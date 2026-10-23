async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const definitions = [
    ["coding", "http://127.0.0.1:3014"],
    ["cinematic", "http://127.0.0.1:3015"],
    ["executive", "http://127.0.0.1:3016"],
  ];
  const results = {};
  // These signatures live in the actual GSAP/Three/Fiber library chunks.
  // The small Cinematic controller may be present in an RSC route manifest,
  // but it must not trigger these heavyweight dynamic chunks for light themes.
  const signature = /WebGLRenderer|__r3f|GreenSock|GSAP 3\./;

  for (const [theme, origin] of definitions) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const scripts = new Map();
    page.on("response", async (response) => {
      if (
        response.request().resourceType() === "script" &&
        response.url().startsWith(origin)
      ) {
        const body = await response.body().catch(() => new Uint8Array());
        scripts.set(new URL(response.url()).pathname, body);
      }
    });

    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.locator(`[data-theme-id="${theme}"]`).waitFor();
    await page.getByText("PHASE THREE FIXTURE", { exact: true }).first().waitFor();
    await page
      .getByText("Phase Three Fixture Project", { exact: true })
      .first()
      .waitFor();
    await page
      .getByText("Phase Three Fixture Role", { exact: true })
      .first()
      .waitFor();

    if (theme === "cinematic") {
      await page.locator("canvas").waitFor({ timeout: 30000 });
      await page.getByRole("button", { name: "Pause motion" }).waitFor();
    } else {
      await page.waitForTimeout(1500);
      if (await page.locator("canvas,.experience-shell,.motion-control").count())
        throw new Error(`${theme} initialized the Cinematic runtime`);
    }

    await page.screenshot({
      path: `artifacts/portfolio/phase3-${theme}-fixture-1440.png`,
      fullPage: true,
    });

    const heavyScripts = [...scripts.entries()]
      .filter(([, body]) => signature.test(Buffer.from(body).toString("utf8")))
      .map(([url, body]) => ({ url, bytes: body.length }));
    if (theme === "cinematic" && heavyScripts.length === 0)
      throw new Error("Cinematic did not download its expected 3D/motion runtime");
    if (theme !== "cinematic" && heavyScripts.length)
      throw new Error(`${theme} downloaded Cinematic heavy chunks: ${JSON.stringify(heavyScripts)}`);

    results[theme] = {
      fixture: "rendered",
      scriptCount: scripts.size,
      scriptBytes: [...scripts.values()].reduce((sum, body) => sum + body.length, 0),
      heavyScripts,
      canvas: await page.locator("canvas").count(),
    };
    await context.close();
  }

  return results;
}
