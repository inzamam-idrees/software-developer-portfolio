import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { THEME_IDS } from "../lib/themes/ids.mjs";
import { SCREENSHOT_DIR } from "../lib/readme-sync.mjs";

// ── Configuration ──
// Needs a running server whose admin hash matches PORTFOLIO_SCREENSHOT_PASSWORD.
//   PORTFOLIO_SCREENSHOT_ORIGIN   default http://127.0.0.1:3000
//   PORTFOLIO_SCREENSHOT_PASSWORD admin password (required)
//   PORTFOLIO_SCREENSHOT_SETTLE   extra ms to wait for motion/3D (default 4000)
//   PORTFOLIO_SCREENSHOT_CHROMIUM optional Chromium executable when the cached browser build differs
// Optional args: theme IDs to capture (default: all).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = (process.env.PORTFOLIO_SCREENSHOT_ORIGIN ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const password = process.env.PORTFOLIO_SCREENSHOT_PASSWORD;
const settle = Number(process.env.PORTFOLIO_SCREENSHOT_SETTLE ?? 4000);
const requested = process.argv.slice(2);
const themeIds = requested.length ? requested : THEME_IDS;

// ── Playwright lookup ──
// Not a project dependency: use a local install, else the one shipped with the global Playwright CLI.
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {}
  try {
    const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return require(path.join(globalRoot, "@playwright/cli/node_modules/playwright"));
  } catch {
    console.error(
      "Playwright library not found. Install it without saving (npm i --no-save playwright) or install the global CLI (npm i -g @playwright/cli), then rerun.",
    );
    process.exit(1);
  }
}

if (!password) {
  console.error("Set PORTFOLIO_SCREENSHOT_PASSWORD to the admin password of the running server.");
  process.exit(1);
}
for (const id of themeIds) {
  if (!THEME_IDS.includes(id)) {
    console.error(`Unknown theme: ${id}`);
    process.exit(1);
  }
}

const { chromium } = loadPlaywright();
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.PORTFOLIO_SCREENSHOT_CHROMIUM || undefined,
  });
} catch (error) {
  console.error(
    [
      "Could not start a Chromium browser for Playwright.",
      `Cause: ${error.message.split("\n")[0]}`,
      "Fix one of:",
      "  1. Install the browser matching the Playwright library:  npx playwright install chromium",
      "  2. Point at an existing Chromium/Chrome binary:  PORTFOLIO_SCREENSHOT_CHROMIUM=/path/to/chrome",
      "     (e.g. ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome)",
      "  3. Use a different Playwright install:  npm i --no-save playwright",
      "Also required: PORTFOLIO_SCREENSHOT_ORIGIN (default http://127.0.0.1:3000) and PORTFOLIO_SCREENSHOT_PASSWORD.",
    ].join("\n"),
  );
  process.exit(1);
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const login = await context.request.post(`${origin}/admin/session`, {
    form: { password },
    headers: { origin },
    maxRedirects: 0,
  });
  if (login.status() !== 303 || !(login.headers().location ?? "").endsWith("/admin/theme")) {
    throw new Error(`Admin sign-in failed (${login.status()}); check the password and origin`);
  }

  await mkdir(path.join(root, SCREENSHOT_DIR), { recursive: true });
  for (const id of themeIds) {
    const page = await context.newPage();
    await page.goto(`${origin}/preview/${id}`, { waitUntil: "load" });
    await page.addStyleTag({ content: "[data-preview-bar]{display:none !important}" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(settle);
    await page.evaluate(() => window.scrollTo(0, 0));
    const file = path.join(root, SCREENSHOT_DIR, `${id}.png`);
    await page.screenshot({ path: file, type: "png" });
    console.log(`captured ${id}`);
    await page.close();
  }
} finally {
  await browser.close();
}
