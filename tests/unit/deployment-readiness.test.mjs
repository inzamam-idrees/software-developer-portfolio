import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

test("pins local and Netlify builds to the validated Node 22 runtime", async () => {
  const [nvmrc, netlify] = await Promise.all([
    read(".nvmrc"),
    read("netlify.toml"),
  ]);

  assert.equal(nvmrc.trim(), "22");
  assert.match(netlify, /NODE_VERSION\s*=\s*"22"/);
  assert.doesNotMatch(netlify, /NODE_VERSION\s*=\s*"18"/);
  assert.match(netlify, /command\s*=\s*"npm run build"/);
  assert.match(netlify, /included_files\s*=\s*\["portfolio-data\/\*\*"\]/);
});

test("production builds validate canonical content before Next.js compiles", async () => {
  const packageJson = JSON.parse(await read("package.json"));

  assert.equal(
    packageJson.scripts["validate:content"],
    "node scripts/validate-portfolio-data.mjs",
  );
  assert.equal(packageJson.scripts.prebuild, "npm run validate:content");
});

test("the deployment validator uses the canonical loader", async () => {
  const validator = await read("scripts/validate-portfolio-data.mjs");

  assert.match(validator, /loadCanonicalPortfolio/);
  assert.match(validator, /Canonical portfolio content is valid/);
});

test("the production container uses Node 22 and packages read-only canonical data", async () => {
  const dockerfile = await read("Dockerfile.prod");

  assert.doesNotMatch(dockerfile, /FROM node:20/);
  assert.match(dockerfile, /FROM node:22/);
  assert.match(dockerfile, /COPY --from=base \/app\/portfolio-data \.\/portfolio-data/);
});

test("server secrets do not use a browser-exposed environment prefix", async () => {
  const [captchaRoute, envExample] = await Promise.all([
    read("app/api/google/route.js"),
    read(".env.example"),
  ]);

  assert.doesNotMatch(captchaRoute, /NEXT_PUBLIC_RECAPTCHA_SECRET_KEY/);
  assert.match(captchaRoute, /process\.env\.RECAPTCHA_SECRET_KEY/);
  assert.match(envExample, /^RECAPTCHA_SECRET_KEY=$/m);
});
