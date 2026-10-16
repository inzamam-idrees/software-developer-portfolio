import assert from "node:assert/strict";
import test from "node:test";
import {
  previewHref,
  previewPageOf,
  previewPath,
} from "../../lib/admin/preview-links.mjs";

const origin = "http://127.0.0.1:3000";

test("public portfolio links stay inside the theme preview", () => {
  assert.equal(previewHref("/", "executive", origin), "/preview/executive");
  assert.equal(previewHref("/#contact", "executive", origin), "/preview/executive#contact");
  assert.equal(previewHref("/project", "spatial", origin), "/preview/spatial/project");
  assert.equal(previewHref("/blog/?page=2", "coding", origin), "/preview/coding/blog?page=2");
  assert.equal(previewHref(`${origin}/project`, "coding", origin), "/preview/coding/project");
});

test("other links are left alone", () => {
  assert.equal(previewHref("https://github.com/example", "coding", origin), null);
  assert.equal(previewHref("/admin/theme", "coding", origin), null);
  assert.equal(previewHref("/preview/coding", "coding", origin), null);
  assert.equal(previewHref("/resume.pdf", "coding", origin), null);
  assert.equal(previewHref("mailto:someone@example.com", "coding", origin), null);
});

test("preview paths encode the theme id and report the current page", () => {
  assert.equal(previewPath("a b"), "/preview/a%20b");
  assert.equal(previewPageOf("/preview/executive/project", "executive"), "/project");
  assert.equal(previewPageOf("/preview/executive", "executive"), "");
  assert.equal(previewPageOf("/preview/executive/unknown", "executive"), "");
});
