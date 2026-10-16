async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3019";
  const heavySignature = /WebGLRenderer|__r3f|GreenSock|GSAP 3\./;
  const expected = [
    "INZAMAM IDREES",
    "Senior Full Stack Engineer",
    "Senior Software Engineer",
    "Laravel Angular Developer",
    "Web Developer",
    "MIS / Nexis Project",
    "Remmi CRM",
    "Group Captain Project",
    "SmartCommerce – E-Commerce Widgets",
    "Interfaces that make sense.",
    "Systems that connect.",
    "From build to delivery.",
    "AI-enabled development.",
    "Bachelor of Science in Software Engineering (BSSE)",
    "Intermediate in FSC Pre-Engineering",
    "Matriculation in Science (Medical)",
    "Student of the Year",
    "High GPA Achievers",
    "Coding Competition Winner",
  ];
  const sectionIds = ["about", "experience", "skills", "projects", "education", "contact"];
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ];
  const evidence = [];

  async function overflow(page) {
    return page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  }

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce", hasTouch: viewport.width <= 390 });
    // This script covers the content tier; the 3D tiers are covered by spatial-scene.js.
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
        return kind === "webgl2" ? null : original.call(this, kind, ...rest);
      };
    });
    const page = await context.newPage();
    const failures = [];
    const scripts = [];
    page.on("console", (message) => {
      if (message.type() === "error") failures.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
    page.on("response", async (response) => {
      if (response.request().resourceType() !== "script" || !response.url().startsWith(origin)) return;
      const body = await response.body().catch(() => new Uint8Array());
      scripts.push({ url: response.url(), body });
    });

    await page.goto(origin, { waitUntil: "networkidle" });
    await page.locator('[data-theme-id="spatial"]').waitFor();
    if ((await page.getByRole("heading", { level: 1 }).count()) !== 1) throw new Error(`Spatial must have one h1 at ${viewport.width}`);
    for (const id of sectionIds) {
      if ((await page.locator(`section#${id}`).count()) !== 1) throw new Error(`Missing #${id} at ${viewport.width}`);
    }
    const text = await page.locator("main").innerText();
    for (const value of expected) {
      if (!text.includes(value)) throw new Error(`"${value}" missing at ${viewport.width}`);
    }
    if (await overflow(page)) throw new Error(`Horizontal overflow at ${viewport.width}`);

    const heavy = scripts.filter(({ body }) => heavySignature.test(Buffer.from(body).toString("utf8")));
    if (heavy.length) throw new Error(`Spatial without WebGL2 loaded 3D/motion scripts: ${heavy.map(({ url }) => url).join()}`);

    // Skills selection by keyboard updates the live region.
    const button = page.locator("#skills button[aria-pressed]").filter({ hasText: /^Angular$/ });
    await button.focus();
    await page.keyboard.press("Enter");
    if ((await button.getAttribute("aria-pressed")) !== "true") throw new Error(`Angular not pressed at ${viewport.width}`);
    const status = await page.locator('#skills [role="status"]').innerText();
    if (!status.includes("MIS / Nexis Project") || !status.includes("Laravel Angular Developer")) {
      throw new Error(`Selection result incomplete at ${viewport.width}: ${status}`);
    }
    if (viewport.width <= 390) {
      const react = page.locator("#skills button[aria-pressed]").filter({ hasText: /^React$/ });
      await react.tap();
      if (!(await page.locator('#skills [role="status"]').innerText()).includes("Group Captain Project")) {
        throw new Error(`Tap selection failed at ${viewport.width}`);
      }
    }

    if (viewport.width === 320) {
      await page.evaluate(() => {
        const long = "Averyveryverylongname ".repeat(6).trim();
        document.querySelector("#spatial-hero-title").textContent = long;
        document.querySelector(".spatial-hero-headline").textContent = long;
      });
      if (await overflow(page)) throw new Error("Long hero text overflows at 320");
      // The theme clips horizontal overflow, so check that the header controls stay on screen.
      await page.evaluate(() => {
        document.querySelector(".spatial-wordmark span").textContent = "Averyveryverylongfirstname Averyverylonglastname";
      });
      const menuBox = await page.locator(".spatial-mobile-nav summary").boundingBox();
      if (!menuBox || menuBox.x + menuBox.width > 320.5) throw new Error(`Menu pushed off screen by a long name: ${JSON.stringify(menuBox)}`);
    }

    for (const selector of [".spatial-wordmark", ".spatial-header-tools"]) {
      const box = await page.locator(selector).boundingBox();
      if (!box || box.x < 0 || box.x + box.width > viewport.width + 0.5) {
        throw new Error(`${selector} is clipped at ${viewport.width}: ${JSON.stringify(box)}`);
      }
    }

    if (viewport.width < 900) {
      const menu = page.locator(".spatial-mobile-nav summary");
      await menu.focus();
      await page.keyboard.press("Enter");
      if (!(await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible())) throw new Error(`Mobile menu did not open at ${viewport.width}`);
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link").first().click();
      await page.waitForTimeout(300);
      if (await page.locator(".spatial-mobile-nav").evaluate((details) => details.open)) throw new Error(`Mobile menu stayed open after choosing a link at ${viewport.width}`);
    }

    await page.screenshot({ path: `artifacts/portfolio/spatial-phase1-${viewport.width}x${viewport.height}.png`, fullPage: true });
    if (failures.length) throw new Error(`Browser errors at ${viewport.width}: ${failures.join(" | ")}`);
    evidence.push({ viewport: `${viewport.width}x${viewport.height}`, scripts: scripts.length });
    await context.close();
  }

  // Skip link is the first tab stop.
  const keyboard = await browser.newContext({ viewport: viewports[0] });
  const keyboardPage = await keyboard.newPage();
  await keyboardPage.goto(origin, { waitUntil: "networkidle" });
  await keyboardPage.keyboard.press("Tab");
  const first = await keyboardPage.evaluate(() => document.activeElement?.className);
  if (first !== "spatial-skip-link") throw new Error(`First tab stop is ${first}`);
  await keyboard.close();

  // Without JavaScript every section and technology is still present.
  const noScript = await browser.newContext({ viewport: viewports[0], javaScriptEnabled: false });
  const staticPage = await noScript.newPage();
  await staticPage.goto(origin, { waitUntil: "domcontentloaded" });
  const staticText = await staticPage.locator("main").innerText();
  for (const value of [...expected, "Angular", "Material"]) {
    if (!staticText.includes(value)) throw new Error(`No-JS page is missing "${value}"`);
  }
  if (await staticPage.locator(".spatial-hero-model .spatial-plan").count() !== 1) throw new Error("No-JS page is missing the hero model plan");
  if (await staticPage.locator('[data-spatial-slot="skills"] .spatial-plan').count() !== 1) throw new Error("No-JS page is missing the skills plan");

  for (const route of ["/project", "/blog"]) {
    await staticPage.goto(origin + route, { waitUntil: "domcontentloaded" });
    await staticPage.locator('[data-theme-id="spatial"]').waitFor();
    if ((await staticPage.getByRole("heading", { level: 1 }).count()) !== 1) throw new Error(`${route} must contain one h1`);
  }
  await noScript.close();

  return { acceptance: "passed", evidence };
}
