import assert from "node:assert/strict";
import test from "node:test";
import {
  DECORATIVE_TOKENS,
  findHardcodedCopy,
  scanThemeSources,
  themeSourceFiles,
} from "./support/copy-scan.mjs";

function texts(source) {
  return findHardcodedCopy(source).map(({ text }) => text);
}

test("scanner flags JSX text, copy attributes, and display literals", () => {
  assert.deepEqual(texts("<h1>Nothing here.</h1>"), ["Nothing here."]);
  assert.deepEqual(texts("<p>{count} builds</p>"), ["builds"]);
  assert.deepEqual(texts('<nav aria-label="Main navigation" />'), [
    'aria-label="Main navigation"',
  ]);
  assert.deepEqual(texts("<ul aria-label={`${title} technologies`} />"), [
    "aria-label={`${title} technologies`}",
  ]);
  assert.deepEqual(texts('const labels = { a: "Key features" };'), [
    "Key features",
  ]);
  assert.deepEqual(texts('const fallback = "FROM THE NOTEBOOK";'), [
    "FROM THE NOTEBOOK",
  ]);
  assert.deepEqual(texts('const time = " / " + minutes + " MIN READ";'), [
    " MIN READ",
  ]);
  assert.deepEqual(texts("const meta = `${minutes} min read`;"), [
    "${minutes} min read",
  ]);
});

test("scanner ignores expressions, decorative code tokens, and identifiers", () => {
  assert.deepEqual(texts("<h1>{view.copy.heading}</h1>"), []);
  assert.deepEqual(texts('<span className="text-pink-500">const</span>'), []);
  assert.deepEqual(texts('if (event.key === "Escape") close();'), []);
  assert.deepEqual(texts('headers: { "Content-Type": "application/json" }'), []);
  assert.deepEqual(texts('throw new Error("Delivery failed");'), []);
  assert.deepEqual(texts('fetch(url, { method: "POST" });'), []);
  assert.deepEqual(texts("<p>{a}</p>{items.length > 0 && <ul />}"), []);
  assert.deepEqual(texts('<img alt="" />'), []);
  assert.deepEqual(texts('<path d="M250 100 380 175Z M250 100V250" />'), []);
  assert.deepEqual(texts('gl.getExtension("WEBGL_lose_context");'), []);
  assert.deepEqual(texts('const data = { "@type": "Person" };'), []);
});

test("scanner flags lowercase prose literals, entity text, and custom copy props", () => {
  assert.deepEqual(texts('const more = "read more";'), ["read more"]);
  assert.deepEqual(texts("const label = 'min read';"), ["min read"]);
  assert.ok(
    texts("<p>&copy; All rights reserved</p>").some((text) => text.includes("All rights reserved")),
  );
  assert.ok(texts("<p>Made with &hearts; by</p>").some((text) => text.includes("Made with")));
  assert.deepEqual(texts('<Button label="Send message" />'), ['label="Send message"']);
  assert.deepEqual(texts('<Section heading="Contact" />'), ['heading="Contact"']);
  assert.deepEqual(texts('<span className="text-red-400"> N/A</span>'), ["N/A"]);
});

test("scanner still ignores class lists, identifiers, and non-copy props", () => {
  assert.deepEqual(texts('const base = "flex items-center gap-2";'), []);
  assert.deepEqual(texts('const classes = "relative flex";'), []);
  assert.deepEqual(texts('<Button variant="primary" size="lg" />'), []);
  assert.deepEqual(texts('<a href="/project" target="_blank" rel="noreferrer" />'), []);
  assert.deepEqual(texts('<svg viewBox="0 0 24 24" fill="none" />'), []);
  assert.deepEqual(texts("<p>&copy; {year}</p>"), []);
  assert.deepEqual(texts('const mode = "use client";'), []);
});

test("the guard scans theme modules and no longer allowlists visible N/A", async () => {
  const files = await themeSourceFiles();
  assert.ok(files.some((file) => file.endsWith("themes/coding/adapter.mjs")));
  assert.ok(files.some((file) => file.endsWith("themes/cinematic/view.mjs")));
  assert.equal(DECORATIVE_TOKENS.includes("N/A"), false);
});

test(
  "themes and shared components render no hardcoded copy",
  async () => {
    const findings = await scanThemeSources();
    assert.deepEqual(
      findings.map(({ file, line, text }) => `${file}:${line} ${text}`),
      [],
    );
  },
);
