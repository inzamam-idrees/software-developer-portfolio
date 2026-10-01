async (page) => {
  const origin = new URL(page.url()).origin;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: "Pause motion", exact: true })
    .waitFor();
  if (!(await page.locator(".story-progress").count()))
    throw new Error("Coordinated scroll progress missing");
  await page
    .locator("#skills")
    .evaluate((e) =>
      window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120),
    );
  await page.waitForTimeout(800);
  const progress = await page
    .locator(".story-progress")
    .evaluate((e) => getComputedStyle(e).transform);
  if (progress === "none" || progress === "matrix(0, 0, 0, 1, 0, 0)")
    throw new Error("Timeline not progressing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Enable motion" }).waitFor();
  if (!(await page.getByRole("button", { name: "Enable motion" }).isDisabled()))
    throw new Error("System preference not authoritative");
  for (const selector of ["#hero h1", "#skills h2", "#contact h2"])
    if (
      await page
        .locator(selector)
        .evaluate((e) => getComputedStyle(e).opacity !== "1")
    )
      throw new Error("Reduced motion hides content");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pause motion" }).waitFor();
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  const start = await page
    .locator(".story-progress")
    .evaluate((e) => getComputedStyle(e).transform);
  if (!start.startsWith("matrix(0,"))
    throw new Error("Scroll reversal not reset: " + start);
  for (let i = 0; i < 2; i++) {
    await page.goto(origin + "/project", { waitUntil: "domcontentloaded" });
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor();
    if (
      (await page.locator("canvas").count()) > 1 ||
      (await page.locator(".motion-control").count()) !== 1
    )
      throw new Error("Duplicated enhancement");
  }
  return { scroll: "passed", liveReducedMotion: "passed", remount: "passed" };
}
