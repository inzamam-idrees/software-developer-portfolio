import assert from "node:assert/strict";
import test from "node:test";
import {
  createThemeDefinition,
  getThemeDefinition,
  listThemes,
  resolveActiveTheme,
  THEME_SLOTS,
} from "../../lib/themes/registry.mjs";

test("registry exposes only the approved Phase 3 themes with complete lazy slots", () => {
  const themes = listThemes();

  assert.deepEqual(
    themes.map((theme) => theme.id),
    ["coding", "cinematic", "executive", "spatial"],
  );
  assert.equal(themes.some((theme) => theme.id === "creative"), false);
  assert.equal(themes.some((theme) => theme.id === "minimal"), false);
  for (const theme of themes) {
    assert.deepEqual(Object.keys(theme.loaders).sort(), [...THEME_SLOTS].sort());
    for (const loader of Object.values(theme.loaders)) {
      assert.equal(typeof loader, "function");
    }
  }
});

test("active theme resolution uses canonical settings and rejects unknown IDs", () => {
  assert.equal(
    resolveActiveTheme({ theme: { activeTheme: "cinematic" } }).id,
    "cinematic",
  );
  assert.equal(getThemeDefinition("coding").label, "Coding");
  assert.equal(getThemeDefinition("spatial").label, "Spatial");
  assert.equal(getThemeDefinition("spatial").status, "available");
  assert.throws(
    () => resolveActiveTheme({ theme: { activeTheme: "minimal" } }),
    /Unknown portfolio theme: minimal/,
  );
});

test("theme contract rejects incomplete or malformed presentation definitions", () => {
  assert.throws(
    () =>
      createThemeDefinition({
        id: "broken theme",
        label: "Broken",
        status: "available",
        loaders: {},
      }),
    /Invalid theme ID/,
  );
});
