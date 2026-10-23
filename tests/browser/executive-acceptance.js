async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3016";
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];
  const evidence = [];
  const signature = /WebGLRenderer|__r3f|GreenSock|GSAP 3\./;

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const failures = [];
    const scripts = new Map();
    page.on("console", (message) => {
      if (message.type() === "error") failures.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
    page.on("response", async (response) => {
      if (response.request().resourceType() === "script" && response.url().startsWith(origin)) {
        const body = await response.body().catch(() => new Uint8Array());
        scripts.set(new URL(response.url()).pathname, body);
      }
    });

    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.locator('[data-theme-id="executive"]').waitFor();
    await page.getByRole("heading", { level: 1, name: /Engineering with intention/i }).waitFor();
    for (const text of ["Senior Full Stack Engineer", "7+ years", "Full-stack engineering", "Selected work", "Professional experience", "Technical expertise", "Get Resume"]) {
      if (!(await page.getByText(text, { exact: !["Get Resume", "Senior Full Stack Engineer"].includes(text) }).first().isVisible())) throw new Error(`${text} is not readily visible in the Executive document at ${viewport.width}`);
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Executive horizontal overflow at ${viewport.width}`);
    const awards = await page.locator("#awards h3").allTextContents();
    if (awards.join("|") !== "Student of the Year|High GPA Achievers|Coding Competition Winner") throw new Error(`Executive awards missing at ${viewport.width}: ${awards}`);
    if ((await page.locator(".executive-timeline .executive-highlights").count()) !== 3) throw new Error(`Executive highlights missing at ${viewport.width}`);
    if ((await page.locator(".executive-timeline ul:empty").count()) !== 0) throw new Error(`Executive empty highlight list at ${viewport.width}`);
    if (await page.locator("canvas,.experience-shell,.motion-control").count()) throw new Error(`Executive initialized Cinematic UI at ${viewport.width}`);

    if (viewport.width <= 980) {
      const menu = page.locator(".executive-mobile-nav summary");
      await menu.focus();
      await page.keyboard.press("Enter");
      if (!(await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible())) throw new Error(`Mobile menu did not open at ${viewport.width}`);
      await page.keyboard.press("Enter");
      if (await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible()) throw new Error(`Mobile menu did not close at ${viewport.width}`);
    }

    await page.screenshot({ path: `artifacts/portfolio/phase4-executive-${viewport.width}x${viewport.height}.png`, fullPage: true, caret: "initial" });
    const heavyScripts = [...scripts.entries()].filter(([, body]) => signature.test(Buffer.from(body).toString("utf8"))).map(([url, body]) => ({ url, bytes: body.length }));
    if (heavyScripts.length) throw new Error(`Executive downloaded Cinematic heavy chunks: ${JSON.stringify(heavyScripts)}`);
    if (failures.length) throw new Error(`Executive browser errors at ${viewport.width}: ${failures.join(" | ")}`);
    evidence.push({ viewport: `${viewport.width}x${viewport.height}`, scripts: scripts.size, scriptBytes: [...scripts.values()].reduce((sum, body) => sum + body.length, 0), heavyScripts: heavyScripts.length });
    await context.close();
  }

  const context = await browser.newContext({ viewport: viewports[0] });
  const page = await context.newPage();
  for (const route of ["/project", "/blog"]) {
    await page.goto(origin + route, { waitUntil: "domcontentloaded" });
    await page.locator('[data-theme-id="executive"]').waitFor();
    if ((await page.getByRole("heading", { level: 1 }).count()) !== 1) throw new Error(`${route} must contain one h1`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${route} has horizontal overflow`);
  }
  await context.close();
  return { acceptance: "passed", evidence, routes: ["/", "/project", "/blog"] };
}
