import test from "node:test";
import assert from "node:assert/strict";
import { getSiteOrigin } from "../../lib/site-origin.mjs";
test("normalizes a public HTTPS origin", () => {
  assert.equal(
    getSiteOrigin("https://Portfolio.Example.com/"),
    "https://portfolio.example.com",
  );
  assert.equal(
    getSiteOrigin("https://[2606:4700::1111]"),
    "https://[2606:4700::1111]",
  );
});
test("rejects missing, unsafe and non-origin values", () => {
  for (const value of [
    null,
    "",
    "oops",
    "http://example.com",
    "https://u:p@example.com",
    "https://example.com/path",
    "https://example.com/?a=1",
    "https://example.com/#x",
    "https://localhost",
    "https://app.localhost",
    "https://127.0.0.1",
    "https://127.1",
    "https://10.0.0.1",
    "https://192.168.1.1",
    "https://172.16.0.1",
    "https://169.254.1.1",
    "https://[::1]",
    "https://[fc00::1]",
    "https://[fe80::1]",
    "https://[::ffff:127.0.0.1]",
  ])
    assert.equal(getSiteOrigin(value), null, value);
});
