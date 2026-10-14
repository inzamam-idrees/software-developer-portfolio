import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { themeSettingsSchema } from "../../lib/portfolio/schemas.mjs";
import {
  activateTheme,
  ThemeActivationError,
} from "../../lib/themes/activation.mjs";

test("activateTheme writes valid settings to the configured data directory", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "portfolio-theme-test-"));
  try {
    const result = await activateTheme("executive", {
      env: { PORTFOLIO_DATA_DIR: tempDir },
      revalidate: false,
    });

    assert.equal(result.success, true);
    assert.equal(result.themeId, "executive");
    assert.equal(result.label, "Executive");

    const content = await readFile(
      path.join(tempDir, "settings", "theme.json"),
      "utf8",
    );
    const parsed = JSON.parse(content);
    assert.deepEqual(parsed, { activeTheme: "executive" });
    assert.deepEqual(themeSettingsSchema.parse(parsed), {
      activeTheme: "executive",
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("activateTheme can cycle through all available themes", async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "portfolio-theme-cycle-"));
  try {
    for (const themeId of ["coding", "executive", "cinematic"]) {
      const res = await activateTheme(themeId, {
        env: { PORTFOLIO_DATA_DIR: tempDir },
        revalidate: false,
      });
      assert.equal(res.success, true);
      assert.equal(res.themeId, themeId);

      const content = await readFile(
        path.join(tempDir, "settings", "theme.json"),
        "utf8",
      );
      assert.deepEqual(JSON.parse(content), { activeTheme: themeId });
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("activateTheme rejects unknown or malformed theme IDs", async () => {
  await assert.rejects(
    () => activateTheme("unknown-theme", { revalidate: false }),
    (error) =>
      error instanceof ThemeActivationError &&
      error.code === "INVALID_THEME",
  );

  await assert.rejects(
    () => activateTheme("", { revalidate: false }),
    (error) =>
      error instanceof ThemeActivationError &&
      error.code === "INVALID_THEME",
  );

  await assert.rejects(
    () => activateTheme(null, { revalidate: false }),
    (error) =>
      error instanceof ThemeActivationError &&
      error.code === "INVALID_THEME",
  );
});
