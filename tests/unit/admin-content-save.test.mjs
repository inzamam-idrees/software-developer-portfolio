import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { handleContentSave } from "../../lib/admin/content-save.mjs";
import { ContentStoreError } from "../../lib/content-store/errors.mjs";
import { documentRegistry } from "../../lib/portfolio/documents.mjs";

const documents = Object.fromEntries(
  await Promise.all(
    documentRegistry.map(async ({ id, path: relativePath }) => [
      id,
      JSON.parse(await readFile(path.join("portfolio-data", relativePath), "utf8")),
    ]),
  ),
);

function fakeStore({ failWith, liveAfterWrite = true } = {}) {
  const writes = [];
  return {
    writes,
    kind: liveAfterWrite ? "filesystem" : "github",
    capabilities: { writable: true, liveAfterWrite },
    readAll: async () => structuredClone(documents),
    write: async (id, data, options) => {
      if (failWith) throw new ContentStoreError(failWith, `store said ${failWith}`);
      writes.push({ id, data, options });
      return { revision: "rev-2", commitUrl: liveAfterWrite ? null : "https://github.com/o/r/commit/1" };
    },
  };
}

function save(overrides = {}) {
  const store = overrides.store ?? fakeStore();
  return {
    store,
    result: handleContentSave({
      session: { sessionId: "s" },
      sameOrigin: true,
      id: "profile",
      contentLength: 100,
      payload: {
        data: { ...documents.profile, headline: "New headline." },
        expectedRevision: "rev-1",
      },
      store,
      ...overrides,
    }),
  };
}

test("a valid save writes through the store with the admin commit message", async () => {
  const { store, result } = save();
  const { status, body } = await result;
  assert.equal(status, 200);
  assert.deepEqual(body, { ok: true, revision: "rev-2", commitUrl: null, liveAfterWrite: true });
  assert.equal(store.writes.length, 1);
  assert.equal(store.writes[0].data.headline, "New headline.");
  assert.deepEqual(store.writes[0].options, {
    expectedRevision: "rev-1",
    message: "content: update profile via admin",
  });
});

test("deploy-gated stores report the commit link", async () => {
  const { body } = await save({ store: fakeStore({ liveAfterWrite: false }) }).result;
  assert.equal(body.liveAfterWrite, false);
  assert.equal(body.commitUrl, "https://github.com/o/r/commit/1");
});

test("requests are rejected before any store access when unauthorized, cross-origin, oversized, or unknown", async () => {
  const cases = [
    [{ session: null }, 401, "UNAUTHORIZED"],
    [{ sameOrigin: false }, 403, "FORBIDDEN"],
    [{ contentLength: 262145 }, 413, "TOO_LARGE"],
    [{ id: "../content/profile" }, 404, "UNKNOWN_DOCUMENT"],
    [{ payload: { data: documents.profile } }, 400, "BAD_REQUEST"],
    [{ payload: null }, 400, "BAD_REQUEST"],
  ];
  for (const [overrides, status, code] of cases) {
    const store = fakeStore();
    const { result } = save({ ...overrides, store });
    const response = await result;
    assert.equal(response.status, status, code);
    assert.equal(response.body.code, code);
    assert.equal(store.writes.length, 0);
  }
});

test("document validation failures return field issues and do not write", async () => {
  const store = fakeStore();
  const { status, body } = await save({
    store,
    payload: { data: { ...documents.profile, name: "" }, expectedRevision: "rev-1" },
  }).result;
  assert.equal(status, 422);
  assert.equal(body.code, "INVALID");
  assert.equal(body.issues[0].path, "name");
  assert.equal(store.writes.length, 0);
});

test("whole-document rule failures inside the edited document use field paths", async () => {
  const skills = structuredClone(documents.skills);
  skills.all = skills.all.filter((skill) => skill !== "Angular");
  for (const category of skills.categories) {
    category.technologies = category.technologies.filter((skill) => skill !== "Angular");
  }
  delete skills.proficiency.Angular;
  const store = fakeStore();
  const { status, body } = await save({
    store,
    id: "skills",
    payload: { data: skills, expectedRevision: "rev-1" },
  }).result;
  assert.equal(status, 422);
  assert.ok(body.issues.some(({ path: issuePath }) => issuePath.startsWith("featured")), JSON.stringify(body.issues));
  assert.equal(store.writes.length, 0);
});

test("cross-document issues are relative to the edited document, or prefixed when they belong elsewhere", async () => {
  const own = await save({
    payload: { data: { ...documents.profile, resumeId: "other" }, expectedRevision: "rev-1" },
  }).result;
  assert.equal(own.status, 422);
  assert.ok(own.body.issues.some(({ path: issuePath }) => issuePath === "resumeId"), JSON.stringify(own.body.issues));

  const elsewhere = await save({
    id: "resume",
    payload: { data: { ...documents.resume, id: "secondary" }, expectedRevision: "rev-1" },
  }).result;
  assert.equal(elsewhere.status, 422);
  assert.ok(
    elsewhere.body.issues.some(({ path: issuePath }) => issuePath === "profile.resumeId"),
    JSON.stringify(elsewhere.body.issues),
  );
});

test("store failures map to stable statuses without leaking details", async () => {
  for (const [code, status] of [
    ["CONFLICT", 409],
    ["READ_ONLY", 405],
    ["UNAUTHORIZED_STORE", 502],
    ["STORE_UNAVAILABLE", 503],
  ]) {
    const { body, status: actual } = await save({ store: fakeStore({ failWith: code }) }).result;
    assert.equal(actual, status, code);
    assert.equal(body.ok, false);
    assert.equal(body.code, code);
  }
});

test("unexpected store errors return a generic 500", async () => {
  const store = { ...fakeStore(), write: async () => { throw new Error("secret detail"); } };
  const { status, body } = await save({ store }).result;
  assert.equal(status, 500);
  assert.deepEqual(body, { ok: false, code: "SAVE_FAILED" });
});
