import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  END_MARKER,
  checkReadme,
  START_MARKER,
  replaceMarkedBlock,
  syncReadme,
} from "../../lib/readme-sync.mjs";

async function fixture(activeTheme) {
  const root = await mkdtemp(path.join(os.tmpdir(), "readme-sync-"));
  await mkdir(path.join(root, "portfolio-data/settings"), { recursive: true });
  await mkdir(path.join(root, "public/image/theme-screenshots"), { recursive: true });
  await writeFile(
    path.join(root, "portfolio-data/settings/theme.json"),
    JSON.stringify({ activeTheme }),
  );
  await writeFile(
    path.join(root, "README.md"),
    `# T\n\n${START_MARKER}\nold\n${END_MARKER}\n\nafter\n`,
  );
  return root;
}

test("replaceMarkedBlock swaps only the marked region and rejects missing markers", () => {
  const out = replaceMarkedBlock(`a\n${START_MARKER}\nx\n${END_MARKER}\nb`, `${START_MARKER}\ny\n${END_MARKER}`);
  assert.equal(out, `a\n${START_MARKER}\ny\n${END_MARKER}\nb`);
  assert.throws(() => replaceMarkedBlock("no markers", "x"), /ACTIVE-THEME/);
});

test("syncReadme copies the active screenshot, rewrites the block and is idempotent", async () => {
  const root = await fixture("prism");
  try {
    await writeFile(path.join(root, "public/image/theme-screenshots/prism.png"), "prism-bytes");
    await writeFile(path.join(root, "public/image/theme-screenshots/coding.png"), "coding-bytes");
    const theme = await syncReadme(root);
    assert.equal(theme.id, "prism");
    const first = await readFile(path.join(root, "README.md"), "utf8");
    assert.match(first, /Active theme: \*\*Prism\*\*/);
    assert.match(first, /\nafter\n$/);
    assert.equal(await readFile(path.join(root, "public/image/screen.png"), "utf8"), "prism-bytes");
    await syncReadme(root);
    assert.equal(await readFile(path.join(root, "README.md"), "utf8"), first);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("syncReadme fails clearly when the screenshot is missing and leaves files untouched", async () => {
  const root = await fixture("coding");
  try {
    await assert.rejects(syncReadme(root), /Missing screenshot .*coding\.png/);
    assert.match(await readFile(path.join(root, "README.md"), "utf8"), /\nold\n/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("checkReadme passes after sync and reports block, image and screenshot drift", async () => {
  const root = await fixture("prism");
  try {
    await writeFile(path.join(root, "public/image/theme-screenshots/prism.png"), "prism-bytes");
    await syncReadme(root);
    assert.deepEqual((await checkReadme(root)).problems, []);

    await writeFile(path.join(root, "portfolio-data/settings/theme.json"), JSON.stringify({ activeTheme: "coding" }));
    const drift = await checkReadme(root);
    assert.equal(drift.problems.length, 2);
    assert.match(drift.problems.join("\n"), /does not describe "Coding"/);
    assert.match(drift.problems.join("\n"), /Missing screenshot .*coding\.png/);

    await writeFile(path.join(root, "public/image/theme-screenshots/coding.png"), "coding-bytes");
    assert.match((await checkReadme(root)).problems.join("\n"), /screen\.png differs/);

    await rm(path.join(root, "public/image/screen.png"));
    assert.match((await checkReadme(root)).problems.join("\n"), /screen\.png is missing/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("checkReadme flags missing markers", async () => {
  const root = await fixture("coding");
  try {
    await writeFile(path.join(root, "README.md"), "# no markers\n");
    await writeFile(path.join(root, "public/image/theme-screenshots/coding.png"), "x");
    assert.match((await checkReadme(root)).problems.join("\n"), /missing the .*markers/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
