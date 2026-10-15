import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (file) => readFile(file, "utf8");

test("the canonical portfolio is loaded once per request through React cache()", async () => {
  const server = await source("lib/portfolio/server.mjs");
  assert.match(server, /import \{ cache \} from "react";/);
  assert.match(server, /cache\(\s*(?:async\s*)?\(\)\s*=>\s*loadCanonicalPortfolio\(\)\s*\)/);
  assert.match(server, /export const getCurrentPortfolioView = cache\(/);
});

test("the Cinematic shell sends the client navbar only its navigation copy", async () => {
  const shell = await source("themes/cinematic/shell.jsx");
  const navbar = shell.match(/<Navbar\b[^>]*\/>/s)?.[0] ?? "";
  assert.match(navbar, /copy=\{view\.copy\.navigation\}/);
  const footer = shell.match(/<Footer\b[\s\S]*?\/>/)?.[0] ?? "";
  assert.doesNotMatch(footer, /copy=\{view\.copy\}/);
  assert.match(footer, /navigation: view\.copy\.navigation/);
  assert.match(footer, /footer: view\.copy\.footer/);
});
