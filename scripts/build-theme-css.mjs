import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile, watch } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import * as sass from "sass";
import { THEME_STYLESHEET_SOURCES } from "../lib/themes/stylesheet-sources.mjs";

// ── Paths ──
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = path.join(root, "app/css");
const outDir = path.join(root, "public/theme-css");
const manifestPath = path.join(root, "lib/themes/stylesheets.generated.json");
export const PUBLIC_PREFIX = "/theme-css/";

// ── Build ──
export async function compileTheme(sources) {
  const scss = sources.map((file) => sass.compile(path.join(cssDir, file), {
    style: "compressed",
    loadPaths: [path.join(root, "styles")],
  }).css);
  const result = await postcss([autoprefixer]).process(scss.join("\n"), { from: undefined });
  return result.css;
}

export async function buildThemeCss() {
  await mkdir(outDir, { recursive: true });
  const manifest = {};
  const keep = new Set();
  for (const [themeId, sources] of Object.entries(THEME_STYLESHEET_SOURCES)) {
    const css = await compileTheme(sources);
    const hash = createHash("sha256").update(css).digest("hex").slice(0, 10);
    const file = `${themeId}.${hash}.css`;
    await writeFile(path.join(outDir, file), css);
    manifest[themeId] = `${PUBLIC_PREFIX}${file}`;
    keep.add(file);
  }
  for (const file of await readdir(outDir)) {
    if (!keep.has(file)) await rm(path.join(outDir, file));
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

// ── CLI ──
async function run() {
  const manifest = await buildThemeCss();
  console.log(`Theme stylesheets built: ${Object.values(manifest).join(", ")}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await run();
  } catch (error) {
    console.error(`Theme stylesheet build failed: ${error.message}`);
    process.exitCode = 1;
  }

  if (process.argv.includes("--watch") && !process.exitCode) {
    let timer;
    for await (const event of watch(cssDir)) {
      if (!event.filename?.endsWith(".scss")) continue;
      clearTimeout(timer);
      timer = setTimeout(() => {
        run().catch((error) => console.error(`Theme stylesheet build failed: ${error.message}`));
      }, 100);
    }
  }
}
