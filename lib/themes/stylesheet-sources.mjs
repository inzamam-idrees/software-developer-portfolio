import { THEME_IDS } from "./ids.mjs";

/**
 * Sass entries (in `app/css/`) compiled into each theme's own stylesheet by
 * `scripts/build-theme-css.mjs`. Every theme loads only its own sheet; nothing
 * here is imported into the Next CSS graph.
 */
export const THEME_STYLESHEET_SOURCES = Object.freeze({
  coding: Object.freeze(["card.scss", "coding.scss"]),
  cinematic: Object.freeze(["form-primitives.scss", "portfolio.scss"]),
  executive: Object.freeze(["form-primitives.scss", "executive.scss"]),
  spatial: Object.freeze(["form-primitives.scss", "spatial.scss"]),
  prism: Object.freeze(["form-primitives.scss", "prism.scss"]),
});

const listed = Object.keys(THEME_STYLESHEET_SOURCES);
if (listed.join() !== THEME_IDS.join()) {
  throw new Error(`Theme stylesheet sources must list ${THEME_IDS.join(", ")}`);
}
