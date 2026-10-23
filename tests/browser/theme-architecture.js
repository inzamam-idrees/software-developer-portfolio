async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const activeTheme = page.locator('[data-theme-id="cinematic"]');
  if ((await activeTheme.count()) !== 1)
    throw new Error("Active Cinematic theme boundary is missing");
  if (!(await activeTheme.locator("#hero").count()))
    throw new Error("Cinematic home did not render inside its theme boundary");
  return { themeArchitecture: "passed", activeTheme: "cinematic" };
}
