import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `npm run dev`: theme stylesheets in watch mode next to `next dev`.
// Arguments after `--` go to `next dev` (for example `--port 3001`).
const scripts = path.dirname(fileURLToPath(import.meta.url));
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");

const css = spawn(process.execPath, [path.join(scripts, "build-theme-css.mjs"), "--watch"], {
  stdio: "inherit",
});
const next = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    css.kill(signal);
    next.kill(signal);
  });
}
next.on("exit", (code) => {
  css.kill();
  process.exit(code ?? 0);
});
css.on("exit", (code) => {
  if (code) {
    next.kill();
    process.exit(code);
  }
});
