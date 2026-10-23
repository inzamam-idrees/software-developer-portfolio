async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3019";
  // Same content with features.threeD and features.animations set to false.
  const flagsOffOrigin = "http://127.0.0.1:3022";
  // Same content with no featured projects.
  const noFeaturedOrigin = "http://127.0.0.1:3023";
  const heavySignature = /WebGLRenderer|__r3f/;
  const evidence = {};

  // Headless Chromium renders WebGL with SwiftShader; report a hardware renderer
  // so the full tier can be exercised. Without this the tier is "reduced".
  const pretendHardware = () => {
    const original = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (key) {
      return key === 37446 ? "Test hardware GPU" : original.call(this, key);
    };
  };
  const withoutWebGL2 = () => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
      return kind === "webgl2" ? null : original.call(this, kind, ...rest);
    };
  };

  async function visit(target, { init, reducedMotion = "no-preference", width = 1440 } = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
    if (init) await context.addInitScript(init);
    await context.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    const failures = [];
    const heavy = [];
    let loadedAt = null;
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("load", () => {
      loadedAt = Date.now();
    });
    page.on("response", async (response) => {
      if (response.request().resourceType() !== "script") return;
      const body = await response.body().catch(() => Buffer.alloc(0));
      if (heavySignature.test(body.toString("utf8"))) heavy.push({ url: response.url(), at: Date.now() });
    });
    await page.goto(target, { waitUntil: "load" });
    return { context, page, failures, heavy, loadedAt: () => loadedAt };
  }

  const stage = (page) => page.locator(".spatial-stage");
  const attribute = (page, name) => stage(page).getAttribute(name);

  // Full tier: scene loads after the load event, one decorative canvas, no layout shift.
  {
    const run = await visit(origin, { init: pretendHardware });
    await run.page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    if ((await attribute(run.page, "data-scene-tier")) !== "full") throw new Error("Expected full tier");
    if ((await run.page.locator("canvas").count()) !== 1) throw new Error("Expected exactly one canvas");
    if ((await run.page.locator("canvas").getAttribute("aria-hidden")) !== "true") throw new Error("Canvas must be aria-hidden");
    if (!run.heavy.length) throw new Error("3D chunk never loaded");
    if (run.heavy.some(({ at }) => at < run.loadedAt())) throw new Error("3D chunk loaded before the load event");
    await run.page.mouse.wheel(0, 1200);
    await run.page.waitForTimeout(500);
    const cls = await run.page.evaluate(() => window.__cls);
    if (cls >= 0.1) throw new Error(`CLS ${cls}`);
    if (await run.page.locator(".spatial-hero-model .spatial-plan").count() !== 1) throw new Error("Hero model plan must stay in the DOM");
    if (run.failures.length) throw new Error(run.failures.join(" | "));
    evidence.full = { cls, heavyScripts: run.heavy.length };

    // DOM selection drives the skills graph.
    await run.page.locator("#skills button[aria-pressed]").filter({ hasText: /^Angular$/ }).click();
    if ((await attribute(run.page, "data-selected")) !== "tech:angular") throw new Error("DOM selection did not reach the scene");

    // Clicking a node inside the skills slot selects that technology in the DOM too.
    const slot = run.page.locator('[data-spatial-slot="skills"]');
    await slot.scrollIntoViewIfNeeded();
    const box = await slot.boundingBox();
    let picked = null;
    for (let row = 1; row < 16 && !picked; row++) {
      for (let column = 1; column < 20 && !picked; column++) {
        await run.page.mouse.click(box.x + (box.width * column) / 20, box.y + (box.height * row) / 16);
        const selected = await attribute(run.page, "data-selected");
        if (selected && selected !== "tech:angular") picked = selected;
      }
    }
    if (!picked) throw new Error("No node could be picked in the skills slot");
    if ((await run.page.locator('#skills button[aria-pressed="true"]').count()) !== 1) throw new Error("Picked node is not reflected in the DOM buttons");
    evidence.picked = picked;

    // Reading the second featured project turns the ring to it.
    const second = run.page.locator("#projects [data-project-id]").nth(1);
    await second.scrollIntoViewIfNeeded();
    await second.hover();
    const focused = await second.getAttribute("data-project-id");
    await run.page.waitForFunction((id) => document.querySelector(".spatial-stage").dataset.focusedProject === id, focused);
    evidence.focusedProject = focused;

    // Scrolling through Experience moves the active role.
    const roles = [];
    for (const role of await run.page.locator("[data-role-id]").all()) {
      await role.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
      await run.page.waitForTimeout(300);
      roles.push(await attribute(run.page, "data-active-role"));
    }
    if (new Set(roles).size < 2 || roles.includes("")) throw new Error(`Active role did not follow scrolling: ${roles}`);
    evidence.activeRoles = roles;
    const scrolledCls = await run.page.evaluate(() => window.__cls);
    if (scrolledCls >= 0.1) throw new Error(`CLS after scrolling ${scrolledCls}`);

    // Losing the WebGL context removes the canvas and keeps the content.
    await run.page.evaluate(() => document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
    await run.page.locator('.spatial-stage[data-scene-tier="none"]').waitFor({ timeout: 10000 });
    if (await run.page.locator("canvas").count()) throw new Error("Canvas still present after context loss");
    if (!(await run.page.locator("#spatial-hero-title").isVisible())) throw new Error("Hero lost after context loss");
    if (run.failures.length) throw new Error(`After context loss: ${run.failures.join(" | ")}`);
    evidence.contextLoss = "fallback";
    await run.context.close();
  }

  // Crossing the phone breakpoint keeps one canvas and creates no extra contexts.
  {
    const countContexts = () => {
      window.__contexts = 0;
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
        const context = original.call(this, kind, ...rest);
        if (kind === "webgl2" && context && !this.__counted) {
          this.__counted = true;
          window.__contexts += 1;
        }
        return context;
      };
    };
    const run = await visit(origin, { init: () => {} });
    await run.context.addInitScript(countContexts);
    await run.context.addInitScript(pretendHardware);
    await run.page.reload({ waitUntil: "load" });
    await run.page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await run.page.setViewportSize(size);
      await run.page.waitForTimeout(800);
      if ((await run.page.locator("canvas").count()) !== 1) throw new Error(`Canvas count changed at ${size.width}`);
      const sideVisible = await run.page.locator('[data-spatial-slot="projects"]').isVisible();
      if (size.width < 1100 && sideVisible) throw new Error("Projects slot visible on a phone");
    }
    const contexts = await run.page.evaluate(() => window.__contexts);
    if (contexts > 2) throw new Error(`Created ${contexts} WebGL2 contexts across resizes`);
    if (run.failures.length) throw new Error(run.failures.join(" | "));
    evidence.resize = { contexts };
    await run.context.close();
  }

  // No featured projects: the scene still starts and the page has no errors.
  {
    const run = await visit(noFeaturedOrigin, { init: pretendHardware });
    await run.page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    if (run.failures.length) throw new Error(`No featured projects: ${run.failures.join(" | ")}`);
    evidence.noFeatured = "ready";
    await run.context.close();
  }

  // A scene chunk that fails to load (e.g. a redeploy removed it) falls back to no 3D, keeping the page.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(pretendHardware);
    const page = await context.newPage();
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    let loaded = false;
    page.on("load", () => {
      loaded = true;
    });
    await page.route("**/_next/static/chunks/**", (route) =>
      loaded && route.request().resourceType() === "script" ? route.abort() : route.continue(),
    );
    await page.goto(origin, { waitUntil: "load" });
    await page.locator('.spatial-stage[data-scene-tier="none"]').waitFor({ timeout: 20000 });
    if (!(await page.locator("#spatial-hero-title").isVisible())) throw new Error("Hero lost after a failed scene chunk");
    if (await page.locator("canvas").count()) throw new Error("Canvas present after a failed scene chunk");
    if (failures.length) throw new Error(`Failed scene chunk raised page errors: ${failures.join(" | ")}`);
    evidence.chunkFailure = "none";
    await context.close();
  }

  // A software renderer on a high-density screen renders at 0.75 device pixels per CSS pixel.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "load" });
    await page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    const ratio = await page.locator("canvas").evaluate((canvas) => canvas.width / canvas.clientWidth);
    if (Math.abs(ratio - 0.75) > 0.02) throw new Error(`Software renderer pixel ratio is ${ratio}`);
    evidence.softwareRatio = ratio;
    await context.close();
  }

  // Reduced tier: system reduced motion still renders the static scene.
  {
    const run = await visit(origin, { init: pretendHardware, reducedMotion: "reduce" });
    await run.page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    if ((await attribute(run.page, "data-scene-tier")) !== "reduced") throw new Error("Expected reduced tier");
    evidence.reduced = "ready";
    await run.context.close();
  }

  // Software renderer (headless default) also selects the reduced tier.
  {
    const run = await visit(origin);
    await run.page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    if ((await attribute(run.page, "data-scene-tier")) !== "reduced") throw new Error("Software renderer must be reduced");
    evidence.software = "reduced";
    await run.context.close();
  }

  // No WebGL2: no canvas and no 3D code.
  {
    const run = await visit(origin, { init: withoutWebGL2 });
    await run.page.waitForTimeout(2500);
    if ((await attribute(run.page, "data-scene-tier")) !== "none") throw new Error("Expected tier none without WebGL2");
    if (await run.page.locator("canvas").count()) throw new Error("Canvas created without WebGL2");
    if (run.heavy.length) throw new Error("3D code loaded without WebGL2");
    evidence.noWebGL = "none";
    await run.context.close();
  }

  // Route pages never load 3D.
  for (const route of ["/project", "/blog"]) {
    const run = await visit(origin + route, { init: pretendHardware });
    await run.page.waitForTimeout(2500);
    if (run.heavy.length) throw new Error(`${route} loaded 3D code`);
    await run.context.close();
  }

  // Feature flags off: no 3D code and no motion control.
  {
    const run = await visit(flagsOffOrigin, { init: pretendHardware });
    await run.page.waitForTimeout(2500);
    if ((await attribute(run.page, "data-scene-tier")) !== "none") throw new Error("threeD:false must select none");
    if (run.heavy.length) throw new Error("threeD:false still loaded 3D code");
    if (await run.page.locator(".spatial-motion-button").count()) throw new Error("animations:false still shows the motion control");
    evidence.flagsOff = "none, no control";
    await run.context.close();
  }

  return { scene: "passed", evidence };
}
