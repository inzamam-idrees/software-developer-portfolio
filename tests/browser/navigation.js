async (page) => {
  const origin = new URL(page.url()).origin;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const toggle = page.getByRole("button", { name: "Open menu", exact: true });
  await toggle.waitFor();
  if (!(await toggle.count())) throw new Error("Mobile menu toggle missing");
  await toggle.focus();
  await page.keyboard.press("Enter");
  if (
    (await page
      .getByRole("button", { name: "Close menu" })
      .getAttribute("aria-expanded")) !== "true"
  )
    throw new Error("Menu not expanded");
  await page.keyboard.press("Escape");
  if (!(await toggle.evaluate((e) => e === document.activeElement)))
    throw new Error("Escape focus not restored");
  await toggle.click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await page.waitForURL("**/#projects");
  if (!page.url().endsWith("#projects")) throw new Error("Work anchor failed");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () =>
      document.querySelector(".menu-toggle")?.getAttribute("aria-expanded") ===
      "false",
  );
  if ((await toggle.getAttribute("aria-expanded")) !== "false")
    throw new Error("Stale menu after resize");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  if (
    !(await page
      .locator("#main-content")
      .evaluate((e) => e === document.activeElement))
  )
    throw new Error("Skip link focus failed");
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Mobile overflow");
  return { navigation: "passed" };
}
