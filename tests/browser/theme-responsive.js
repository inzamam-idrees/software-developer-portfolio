async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const themes = [
    ["coding", "http://127.0.0.1:3014"],
    ["cinematic", "http://127.0.0.1:3015"],
    ["executive", "http://127.0.0.1:3016"],
  ];
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];
  const evidence = [];

  for (const [theme, origin] of themes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(origin, { waitUntil: "domcontentloaded" });
      await page.locator(`[data-theme-id="${theme}"]`).waitFor();
      await page.locator("h1").waitFor();
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error(`${theme} overflow at ${viewport.width}`);
      if (!(await page.getByText("PHASE THREE FIXTURE", { exact: true }).first().isVisible()))
        throw new Error(`${theme} identity hidden at ${viewport.width}`);
      if (viewport.width === 390)
        await page.screenshot({
          path: `artifacts/portfolio/phase3-${theme}-fixture-390.png`,
          fullPage: true,
        });
      evidence.push(`${theme}:${viewport.width}`);
      await context.close();
    }

    const context = await browser.newContext({ viewport: viewports[0] });
    const page = await context.newPage();
    for (const route of ["/project", "/blog"]) {
      await page.goto(origin + route, { waitUntil: "domcontentloaded" });
      await page.locator(`[data-theme-id="${theme}"]`).waitFor();
      await page.locator("h1").waitFor();
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
        throw new Error(`${theme} route overflow: ${route}`);
    }
    await context.close();
  }

  return { responsive: "passed", checks: evidence, routesPerTheme: 3 };
}
