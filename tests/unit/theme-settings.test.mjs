import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { themeSettingsSchema } from "../../lib/portfolio/schemas.mjs";

test("canonical theme settings accept only registered Phase 3 theme IDs", () => {
  assert.deepEqual(themeSettingsSchema.parse({ activeTheme: "cinematic" }), {
    activeTheme: "cinematic",
  });
  assert.equal(
    themeSettingsSchema.safeParse({ activeTheme: "minimal" }).success,
    false,
  );
});

test("bundled canonical portfolio preserves the public Coding theme", async () => {
  const portfolio = await loadCanonicalPortfolio({ env: {} });
  assert.equal(portfolio.settings.theme.activeTheme, "coding");
});
