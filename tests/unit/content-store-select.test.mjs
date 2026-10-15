import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { createContentStore } from "../../lib/content-store/index.mjs";

const github = {
  PORTFOLIO_CONTENT_STORE: "github",
  GITHUB_CONTENT_TOKEN: "t",
  GITHUB_CONTENT_REPO: "o/r",
  GITHUB_CONTENT_BRANCH: "main",
};

test("development defaults to the filesystem store at the configured data root", async () => {
  const store = createContentStore({ PORTFOLIO_DATA_DIR: "portfolio-data" });
  assert.equal(store.kind, "filesystem");
  assert.equal(store.root, path.resolve("portfolio-data"));
});

test("production defaults to the read-only store", () => {
  assert.equal(createContentStore({ NODE_ENV: "production" }).kind, "readonly");
});

test("explicit GitHub configuration selects the GitHub store", () => {
  assert.equal(createContentStore({ ...github, NODE_ENV: "production" }).kind, "github");
});

test("incomplete or invalid configuration fails with STORE_UNAVAILABLE naming the problem", () => {
  for (const [env, name] of [
    [{ ...github, GITHUB_CONTENT_TOKEN: "" }, "GITHUB_CONTENT_TOKEN"],
    [{ ...github, GITHUB_CONTENT_BRANCH: undefined }, "GITHUB_CONTENT_BRANCH"],
    [{ ...github, GITHUB_CONTENT_REPO: "not-a-repo" }, "GITHUB_CONTENT_REPO"],
    [{ PORTFOLIO_CONTENT_STORE: "s3" }, "PORTFOLIO_CONTENT_STORE"],
  ]) {
    assert.throws(
      () => createContentStore(env),
      (error) => error.code === "STORE_UNAVAILABLE" && error.message.includes(name),
    );
  }
});
