import manifest from "./stylesheets.generated.json" with { type: "json" };

/**
 * Hashed URL of a theme's own stylesheet, built by `scripts/build-theme-css.mjs`
 * (runs before `build` and alongside `dev`).
 */
export function themeStylesheetHref(themeId) {
  const href = manifest[themeId];
  if (typeof href !== "string") {
    throw new Error(
      `No stylesheet built for theme ${themeId}; run node scripts/build-theme-css.mjs`,
    );
  }
  return href;
}
