import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { compileTheme } from "../../scripts/build-theme-css.mjs";
import { THEME_IDS } from "../../lib/themes/ids.mjs";
import { THEME_STYLESHEET_SOURCES } from "../../lib/themes/stylesheet-sources.mjs";

// Class prefixes that only one theme (or the admin) may ship.
const ownedPrefixes = {
  coding: ".coding-",
  cinematic: ".hero-grid",
  executive: ".executive-",
  spatial: ".spatial-",
  prism: ".prism-",
  admin: ".admin-",
};

test("the root layout imports only the global stylesheet", async () => {
  const layout = await readFile("app/layout.js", "utf8");
  const sheets = [...layout.matchAll(/import\s+"([^"]+\.s?css)"/g)].map((match) => match[1]);
  assert.deepEqual(sheets, ["./css/globals.scss"]);
});

test("each theme shell links its own built stylesheet and imports no Sass", async () => {
  for (const themeId of THEME_IDS) {
    const shell = await readFile(`themes/${themeId}/shell.jsx`, "utf8");
    assert.doesNotMatch(shell, /\.scss"/, `${themeId} shell imports Sass into the Next CSS graph`);
    assert.match(
      shell,
      new RegExp(`<link rel="stylesheet" href=\\{themeStylesheetHref\\("${themeId}"\\)\\} precedence="theme" />`),
      `${themeId} shell does not link its own stylesheet`,
    );
  }
});

test("each compiled theme stylesheet holds only that theme's rules", async () => {
  for (const [themeId, sources] of Object.entries(THEME_STYLESHEET_SOURCES)) {
    const css = await compileTheme(sources);
    assert.ok(css.includes(ownedPrefixes[themeId]), `${themeId} sheet is missing its own rules`);
    for (const [owner, prefix] of Object.entries(ownedPrefixes)) {
      if (owner === themeId) continue;
      assert.ok(!css.includes(prefix), `${themeId} sheet contains ${owner} rules (${prefix})`);
    }
  }
});

test("the generated manifest points every theme at a hashed file that exists", async () => {
  const manifest = JSON.parse(
    await readFile("lib/themes/stylesheets.generated.json", "utf8"),
  );
  assert.deepEqual(Object.keys(manifest), [...THEME_IDS]);
  for (const [themeId, href] of Object.entries(manifest)) {
    assert.match(href, new RegExp(`^/theme-css/${themeId}\\.[0-9a-f]{10}\\.css$`));
    await access(`public${href}`);
  }
});
