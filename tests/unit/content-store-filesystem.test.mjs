import assert from "node:assert/strict";
import { cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createFilesystemStore } from "../../lib/content-store/filesystem.mjs";
import { createReadonlyStore } from "../../lib/content-store/readonly.mjs";

async function dataRoot(context) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-store-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await cp(path.resolve("portfolio-data"), root, { recursive: true });
  return root;
}

const rejectsWith = (code) => (error) => error.code === code;

test("filesystem store round-trips a document with a new revision", async (context) => {
  const root = await dataRoot(context);
  const store = createFilesystemStore({ root });
  assert.equal(store.kind, "filesystem");
  assert.deepEqual(store.capabilities, { writable: true, liveAfterWrite: true });

  const { data, revision } = await store.read("profile");
  assert.match(revision, /^[a-f0-9]{64}$/);
  const result = await store.write(
    "profile",
    { ...data, headline: "Changed headline." },
    { expectedRevision: revision, message: "content: update profile via admin" },
  );
  assert.notEqual(result.revision, revision);
  assert.equal(result.commitUrl, null);

  const reread = await store.read("profile");
  assert.equal(reread.data.headline, "Changed headline.");
  assert.equal(reread.revision, result.revision);
  const raw = await readFile(path.join(root, "content/profile.json"), "utf8");
  assert.equal(raw, JSON.stringify(reread.data, null, 2) + "\n");
  assert.deepEqual(
    (await readdir(path.join(root, "content"))).filter((name) => name.endsWith(".tmp")),
    [],
  );
});

test("filesystem store rejects a stale revision and leaves the file unchanged", async (context) => {
  const root = await dataRoot(context);
  const store = createFilesystemStore({ root });
  const before = await readFile(path.join(root, "content/about.json"), "utf8");
  const { data } = await store.read("about");

  await assert.rejects(
    () => store.write("about", { ...data, summary: "Stale." }, { expectedRevision: "0".repeat(64), message: "m" }),
    rejectsWith("CONFLICT"),
  );
  assert.equal(await readFile(path.join(root, "content/about.json"), "utf8"), before);
});

test("filesystem store rejects unknown documents and reads every registry document", async (context) => {
  const root = await dataRoot(context);
  const store = createFilesystemStore({ root });
  await assert.rejects(() => store.read("../secrets"), rejectsWith("UNKNOWN_DOCUMENT"));
  const all = await store.readAll();
  assert.equal(Object.keys(all).length, 20);
  assert.equal(all["copy-shared"].navigation.skipToContent, "Skip to content");
});

test("read-only store reads but refuses writes", async (context) => {
  const root = await dataRoot(context);
  const store = createReadonlyStore({ root });
  assert.equal(store.kind, "readonly");
  assert.deepEqual(store.capabilities, { writable: false, liveAfterWrite: false });
  const { data, revision } = await store.read("profile");
  await assert.rejects(
    () => store.write("profile", data, { expectedRevision: revision, message: "m" }),
    rejectsWith("READ_ONLY"),
  );
});
