async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3017";
  const routes = ["/", "/project", "/blog"];
  const viewports = [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ];

  async function assertRoutes(page, themeId) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        await page.goto(origin + route, { waitUntil: "domcontentloaded" });
        await page.locator(`[data-theme-id="${themeId}"]`).waitFor();
        if ((await page.locator("h1").count()) !== 1) {
          throw new Error(`${themeId}${route} does not have exactly one h1`);
        }
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
          throw new Error(`${themeId}${route} overflows at ${viewport.width}px`);
        }
      }
    }
  }

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await assertRoutes(publicPage, "cinematic");
  if (await publicPage.locator('meta[name="robots"][content*="noindex"]').count()) {
    throw new Error("Public Cinematic routes were marked noindex");
  }
  await publicContext.close();

  const previewContext = await browser.newContext();
  const login = await previewContext.request.post(`${origin}/admin/session`, {
    form: { password: "phase-five-browser-password" },
    headers: { origin },
    maxRedirects: 0,
  });
  if (login.status() !== 303) throw new Error(`Login returned ${login.status()}`);

  const previewPage = await previewContext.newPage();
  for (const themeId of ["coding", "executive"]) {
    const selected = await previewContext.request.post(`${origin}/admin/theme/preview`, {
      form: { themeId },
      headers: { origin },
      maxRedirects: 0,
    });
    if (selected.status() !== 303) {
      throw new Error(`${themeId} selection returned ${selected.status()}`);
    }
    await assertRoutes(previewPage, themeId);
    if (!(await previewPage.locator('meta[name="robots"][content*="noindex"]').count())) {
      throw new Error(`${themeId} preview is indexable`);
    }
  }
  await previewContext.close();

  return {
    regression: "passed",
    publicTheme: "cinematic",
    previewThemes: ["coding", "executive"],
    routes,
    viewports: viewports.map(({ width }) => width),
  };
}
