import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getThemeDefinition } from "./themes/registry.mjs";
import { themePurpose } from "./themes/purposes.mjs";

// ── Constants ──
export const START_MARKER = "<!-- ACTIVE-THEME:START -->";
export const END_MARKER = "<!-- ACTIVE-THEME:END -->";
export const SCREENSHOT_DIR = "public/image/theme-screenshots";
export const HERO_IMAGE = "public/image/screen.png";

// ── Pure helpers ──
export function renderActiveThemeBlock(theme, purpose) {
  return `${START_MARKER}\nActive theme: **${theme.label}**. ${purpose}\n${END_MARKER}`;
}

export function replaceMarkedBlock(readme, block) {
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README must contain ${START_MARKER} and ${END_MARKER} in that order`);
  }
  return readme.slice(0, start) + block + readme.slice(end + END_MARKER.length);
}

// ── Shared lookup ──
async function readActiveTheme(root) {
  const settings = JSON.parse(
    await readFile(path.join(root, "portfolio-data/settings/theme.json"), "utf8"),
  );
  return getThemeDefinition(settings.activeTheme);
}

async function readScreenshot(root, theme) {
  try {
    return await readFile(path.join(root, SCREENSHOT_DIR, `${theme.id}.png`));
  } catch {
    throw new Error(
      `Missing screenshot ${SCREENSHOT_DIR}/${theme.id}.png; run npm run capture:screenshots first`,
    );
  }
}

// ── Check ──
// Read-only: reports every way README and the hero image disagree with the active theme.
export async function checkReadme(root) {
  const theme = await readActiveTheme(root);
  const problems = [];
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    problems.push(`README.md is missing the ${START_MARKER} / ${END_MARKER} markers`);
  } else if (
    readme.slice(start, end + END_MARKER.length) !==
    renderActiveThemeBlock(theme, themePurpose(theme.id))
  ) {
    problems.push(`README.md active-theme block does not describe "${theme.label}"`);
  }
  let hero = null;
  try {
    hero = await readFile(path.join(root, HERO_IMAGE));
  } catch {
    problems.push(`${HERO_IMAGE} is missing`);
  }
  try {
    const shot = await readScreenshot(root, theme);
    if (hero && !hero.equals(shot)) {
      problems.push(`${HERO_IMAGE} differs from ${SCREENSHOT_DIR}/${theme.id}.png`);
    }
  } catch (error) {
    problems.push(error.message);
  }
  return { theme, problems };
}

// ── Sync ──
export async function syncReadme(root) {
  const theme = await readActiveTheme(root);
  const screenshot = await readScreenshot(root, theme);
  const readmePath = path.join(root, "README.md");
  const next = replaceMarkedBlock(
    await readFile(readmePath, "utf8"),
    renderActiveThemeBlock(theme, themePurpose(theme.id)),
  );
  await writeFile(path.join(root, HERO_IMAGE), screenshot);
  await writeFile(readmePath, next);
  return theme;
}
