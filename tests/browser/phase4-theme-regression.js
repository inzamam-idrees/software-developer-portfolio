async (sourcePage) => {
  const themes = [
    { id: "coding", origin: "http://127.0.0.1:3014" },
    { id: "cinematic", origin: "http://127.0.0.1:3015" },
  ];
  const results = [];

  for (const theme of themes) {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await sourcePage.setViewportSize(viewport);
      await sourcePage.goto(theme.origin, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sourcePage.locator(`[data-theme-id="${theme.id}"]`).waitFor({ timeout: 15000 });
      await sourcePage.getByRole("heading", { level: 1 }).waitFor({ timeout: 15000 });
      if (await sourcePage.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${theme.id} overflow at ${viewport.width}`);
      results.push(`${theme.id}:${viewport.width}`);
    }

    await sourcePage.setViewportSize({ width: 1280, height: 800 });
    for (const route of ["/project", "/blog"]) {
      await sourcePage.goto(theme.origin + route, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sourcePage.locator(`[data-theme-id="${theme.id}"]`).waitFor({ timeout: 15000 });
      await sourcePage.getByRole("heading", { level: 1 }).waitFor({ timeout: 15000 });
    }
  }
  return { regression: "passed", checks: results, routesPerTheme: 3 };
}
