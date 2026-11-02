import path from "node:path";
import { fileURLToPath } from "node:url";
import { syncReadme } from "../lib/readme-sync.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const theme = await syncReadme(root);
  console.log(`README synced for active theme: ${theme.label}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
