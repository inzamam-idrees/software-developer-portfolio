import assert from "node:assert/strict";
import test from "node:test";
import { createGithubStore } from "../../lib/content-store/github.mjs";

const token = "ghp_secret_test_token";
const profile = { name: "INZAMAM IDREES" };

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function fakeFetch(handler) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    calls.push({ url, init });
    return handler(url, init);
  };
  return { fetch, calls };
}

function store(fetch) {
  return createGithubStore({ token, repo: "o/r", branch: "main", fetch });
}

const encoded = Buffer.from(JSON.stringify(profile, null, 2) + "\n").toString("base64");

test("GitHub store reads a document through the contents API", async () => {
  const { fetch, calls } = fakeFetch(() =>
    response(200, { content: encoded.replace(/(.{60})/g, "$1\n"), encoding: "base64", sha: "abc123" }),
  );
  const githubStore = store(fetch);
  assert.equal(githubStore.kind, "github");
  assert.deepEqual(githubStore.capabilities, { writable: true, liveAfterWrite: false });

  const result = await githubStore.read("profile");
  assert.deepEqual(result, { data: profile, revision: "abc123" });
  assert.equal(
    calls[0].url,
    "https://api.github.com/repos/o/r/contents/portfolio-data/content/profile.json?ref=main",
  );
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${token}`);
  assert.equal(calls[0].init.headers.Accept, "application/vnd.github+json");
});

test("GitHub store writes with the expected revision and returns the commit", async () => {
  const { fetch, calls } = fakeFetch(() =>
    response(200, { content: { sha: "def456" }, commit: { html_url: "https://github.com/o/r/commit/1" } }),
  );
  const result = await store(fetch).write("copy-shared", profile, {
    expectedRevision: "abc123",
    message: "content: update copy-shared via admin",
  });

  assert.deepEqual(result, { revision: "def456", commitUrl: "https://github.com/o/r/commit/1" });
  assert.equal(
    calls[0].url,
    "https://api.github.com/repos/o/r/contents/portfolio-data/settings/copy/shared.json",
  );
  assert.equal(calls[0].init.method, "PUT");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    message: "content: update copy-shared via admin",
    content: encoded,
    sha: "abc123",
    branch: "main",
  });
});

test("GitHub store maps API failures to store error codes without leaking the token", async () => {
  const cases = [
    [() => response(409, { message: "conflict" }), "CONFLICT"],
    [() => response(422, { message: "sha mismatch" }), "CONFLICT"],
    [() => response(401, { message: "Bad credentials" }), "UNAUTHORIZED_STORE"],
    [() => response(403, { message: "forbidden" }), "UNAUTHORIZED_STORE"],
    [() => response(502, { message: "bad gateway" }), "STORE_UNAVAILABLE"],
    [() => Promise.reject(new Error(`network down ${token}`)), "STORE_UNAVAILABLE"],
  ];
  for (const [handler, code] of cases) {
    const { fetch } = fakeFetch(handler);
    await assert.rejects(
      () => store(fetch).write("profile", profile, { expectedRevision: "abc", message: "m" }),
      (error) => {
        assert.equal(error.code, code);
        assert.equal(error.message.includes(token), false);
        assert.equal(String(error.cause ?? "").includes(token), false);
        return true;
      },
    );
  }
});

test("GitHub store rejects unknown documents before any request", async () => {
  const { fetch, calls } = fakeFetch(() => response(200, {}));
  await assert.rejects(() => store(fetch).read("../../x"), (error) => error.code === "UNKNOWN_DOCUMENT");
  assert.equal(calls.length, 0);
});

test("GitHub store reads all documents concurrently", async () => {
  let inFlight = 0;
  let peak = 0;
  const { fetch, calls } = fakeFetch(async () => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    inFlight -= 1;
    return response(200, { content: encoded, encoding: "base64", sha: "abc" });
  });
  const all = await store(fetch).readAll();
  assert.equal(calls.length, 20);
  assert.equal(Object.keys(all).length, 20);
  assert.equal(peak, 20);
});
