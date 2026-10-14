import { loadCanonicalPortfolio } from "../lib/portfolio/loader.mjs";

try {
  await loadCanonicalPortfolio();
  console.log("Canonical portfolio content is valid.");
} catch (error) {
  const code = typeof error?.code === "string" ? ` (${error.code})` : "";
  console.error(`Canonical portfolio validation failed${code}.`);
  process.exitCode = 1;
}
