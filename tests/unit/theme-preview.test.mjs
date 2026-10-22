import assert from "node:assert/strict";
import test from "node:test";
import {
  listPreviewableThemes,
  resolveThemeSelection,
  ThemeSelectionError,
} from "../../lib/themes/selection.mjs";

const activeSettings = { theme: { activeTheme: "cinematic" } };

test("an authorized preview selects an available registered theme without changing settings", () => {
  const selection = resolveThemeSelection({
    settings: activeSettings,
    previewThemeId: "executive",
    authorized: true,
  });

  assert.equal(selection.theme.id, "executive");
  assert.equal(selection.mode, "preview");
  assert.equal(activeSettings.theme.activeTheme, "cinematic");
});

test("preview selection remains public-active without verified authorization", () => {
  const selection = resolveThemeSelection({
    settings: activeSettings,
    previewThemeId: "coding",
    authorized: false,
  });

  assert.equal(selection.theme.id, "cinematic");
  assert.equal(selection.mode, "public");
});

test("invalid and unavailable preview identifiers fail safely", () => {
  assert.throws(
    () =>
      resolveThemeSelection({
        settings: activeSettings,
        previewThemeId: "minimal",
        authorized: true,
      }),
    (error) =>
      error instanceof ThemeSelectionError &&
      error.code === "INVALID_PREVIEW_THEME",
  );

  assert.throws(
    () =>
      resolveThemeSelection({
        settings: activeSettings,
        previewThemeId: "executive",
        authorized: true,
        themes: [
          {
            id: "executive",
            label: "Executive",
            status: "architecture-ready",
            loaders: {},
          },
        ],
      }),
    (error) =>
      error instanceof ThemeSelectionError &&
      error.code === "UNAVAILABLE_PREVIEW_THEME",
  );
});

test("only available registry themes are offered for preview", () => {
  assert.deepEqual(
    listPreviewableThemes().map((theme) => theme.id),
    ["coding", "cinematic", "executive", "spatial", "prism"],
  );
});

test("an authorized Spatial preview stays session-scoped", () => {
  const preview = resolveThemeSelection({
    settings: activeSettings,
    previewThemeId: "spatial",
    authorized: true,
  });
  assert.equal(preview.theme.id, "spatial");
  assert.equal(preview.mode, "preview");
  assert.equal(activeSettings.theme.activeTheme, "cinematic");

  const visitor = resolveThemeSelection({
    settings: activeSettings,
    previewThemeId: "spatial",
    authorized: false,
  });
  assert.equal(visitor.theme.id, "cinematic");
  assert.equal(visitor.mode, "public");
});
