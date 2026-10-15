import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createFilesystemStore } from "../../lib/content-store/filesystem.mjs";
import { createReadonlyStore } from "../../lib/content-store/readonly.mjs";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import {
  activateTheme,
  ThemeActivationError,
} from "../../lib/themes/activation.mjs";

async function dataRoot(context) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-theme-test-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await cp(path.resolve("portfolio-data"), root, { recursive: true });
  return root;
}

async function activeTheme(root) {
  return JSON.parse(await readFile(path.join(root, "settings", "theme.json"), "utf8"));
}

test("activateTheme writes valid settings through the content store", async (context) => {
  const root = await dataRoot(context);
  const result = await activateTheme("executive", { store: createFilesystemStore({ root }) });

  assert.deepEqual(result, {
    success: true,
    themeId: "executive",
    label: "Executive",
    commitUrl: null,
    liveAfterWrite: true,
  });
  assert.deepEqual(await activeTheme(root), { activeTheme: "executive" });
  const portfolio = await loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } });
  assert.equal(portfolio.settings.theme.activeTheme, "executive");
});

test("activateTheme can cycle through all available themes", async (context) => {
  const root = await dataRoot(context);
  const store = createFilesystemStore({ root });
  for (const themeId of ["coding", "executive", "cinematic"]) {
    const result = await activateTheme(themeId, { store });
    assert.equal(result.themeId, themeId);
    assert.deepEqual(await activeTheme(root), { activeTheme: themeId });
  }
});

test("activateTheme rejects unknown or malformed theme IDs before touching the store", async () => {
  const store = {
    read: async () => assert.fail("store must not be read"),
    write: async () => assert.fail("store must not be written"),
  };
  for (const themeId of ["unknown-theme", "", null]) {
    await assert.rejects(
      () => activateTheme(themeId, { store }),
      (error) => error instanceof ThemeActivationError && error.code === "INVALID_THEME",
    );
  }
});

test("activateTheme reports read-only storage as READ_ONLY", async (context) => {
  const root = await dataRoot(context);
  await assert.rejects(
    () => activateTheme("executive", { store: createReadonlyStore({ root }) }),
    (error) => error instanceof ThemeActivationError && error.code === "READ_ONLY",
  );
  assert.deepEqual(await activeTheme(root), { activeTheme: "coding" });
});

test("deploy-gated stores return the commit link and are not live immediately", async () => {
  const writes = [];
  const store = {
    capabilities: { writable: true, liveAfterWrite: false },
    read: async () => ({ data: { activeTheme: "coding" }, revision: "sha-1" }),
    write: async (id, data, options) => {
      writes.push({ id, data, options });
      return { revision: "sha-2", commitUrl: "https://github.com/o/r/commit/2" };
    },
  };
  const result = await activateTheme("cinematic", { store });
  assert.equal(result.commitUrl, "https://github.com/o/r/commit/2");
  assert.equal(result.liveAfterWrite, false);
  assert.deepEqual(writes, [
    {
      id: "theme",
      data: { activeTheme: "cinematic" },
      options: { expectedRevision: "sha-1", message: "content: update theme via admin" },
    },
  ]);
});
