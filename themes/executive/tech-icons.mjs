import {
  siAngular, siReact, siNextdotjs, siTypescript, siJavascript, siRedux, siNodedotjs, siExpress, siNestjs,
  siPhp, siLaravel, siCodeigniter, siPython, siFastapi, siFlask, siDjango, siMongodb, siMysql, siPostgresql,
  siGit, siDocker, siFigma, siFirebase, siNginx, siUbuntu, siJquery, siHtml5, siCss, siSass, siBootstrap,
  siTailwindcss, siIonic, siGraphql, siGooglecloud, siMui, siOpenai, siClaude, siGooglegemini, siGithubcopilot,
  siPrimeng, siAmazonwebservices,
} from "simple-icons";

// Brand marks are matched to canonical technology names by normalized title; unknown names have no icon.
const norm = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const brands = [
  siAngular, siReact, siNextdotjs, siTypescript, siJavascript, siRedux, siNodedotjs, siExpress, siNestjs,
  siPhp, siLaravel, siCodeigniter, siPython, siFastapi, siFlask, siDjango, siMongodb, siMysql, siPostgresql,
  siGit, siDocker, siFigma, siFirebase, siNginx, siUbuntu, siJquery, siHtml5, siCss, siSass, siBootstrap,
  siTailwindcss, siIonic, siGraphql, siGooglecloud, siMui, siOpenai, siClaude, siGooglegemini, siGithubcopilot,
  siPrimeng, siAmazonwebservices,
];
const icons = Object.fromEntries(brands.map((icon) => [norm(icon.title), icon]));
const aliases = { html: siHtml5, scss: siSass, materialui: siMui, gemini: siGooglegemini, aws: siAmazonwebservices };

function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns `{ path, color }` or null. Marks too dark for the charcoal ground fall back to warm white. */
export function techIcon(name) {
  const key = norm(name);
  const icon = icons[key] ?? aliases[key];
  if (!icon) return null;
  return { path: icon.path, color: luminance(icon.hex) < 0.22 ? "#f5f1e8" : `#${icon.hex}` };
}
