import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkReadme } from "../lib/readme-sync.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const { theme, problems } = await checkReadme(root);
  if (problems.length) {
    console.error(`README is out of sync with active theme "${theme.id}":`);
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("Fix: npm run capture:screenshots -- " + theme.id + " && npm run sync:readme");
    process.exitCode = 1;
  } else {
    console.log(`README matches active theme: ${theme.label}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
