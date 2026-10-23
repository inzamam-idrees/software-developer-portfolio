async (sourcePage) => {
  const browser = sourcePage.context().browser();
  // Baseline build (before Spatial) and current build, both serving the public active theme.
  const origins = { baseline: "http://127.0.0.1:3020", current: "http://127.0.0.1:3021" };
  const report = {};

  async function measure(origin, route) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const assets = [];
    page.on("response", async (response) => {
      const type = response.request().resourceType();
      if (!["script", "stylesheet", "font"].includes(type)) return;
      const body = await response.body().catch(() => Buffer.alloc(0));
      assets.push({ type, url: response.url(), bytes: body.length, text: type === "font" ? "" : body.toString("utf8") });
    });
    await page.goto(origin + route, { waitUntil: "networkidle" });
    await context.close();
    const total = (type) => assets.filter((asset) => asset.type === type).reduce((sum, asset) => sum + asset.bytes, 0);
    return {
      script: total("script"),
      stylesheet: total("stylesheet"),
      font: total("font"),
      spatialCss: assets.some((asset) => asset.text.includes("theme-spatial")),
      fontFiles: assets.filter((asset) => asset.type === "font").map((asset) => asset.url.split("/").pop()),
      cinematicJs: assets.some((asset) => asset.type === "script" && /story-progress|motion-button/.test(asset.text)),
      spatialJs: assets.some((asset) => /spatial-explorer|spatial-chip/.test(asset.text) && asset.type === "script"),
    };
  }

  for (const route of ["/", "/project", "/blog"]) {
    const baseline = await measure(origins.baseline, route);
    const current = await measure(origins.current, route);
    report[route] = { baseline, current };
    // Known Phase 1 finding: Next links the scoped Spatial stylesheet on every route (reported, not asserted).
  }
  return report;
}
