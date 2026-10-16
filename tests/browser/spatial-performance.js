async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3019";
  const report = {};

  const pretendHardware = () => {
    const original = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (key) {
      return key === 37446 ? "Test hardware GPU" : original.call(this, key);
    };
  };
  // Counts draw calls and triangles per animation frame.
  const countDraws = () => {
    const frame = { calls: 0, triangles: 0 };
    window.__frames = [];
    const flush = () => {
      if (frame.calls) window.__frames.push({ ...frame });
      frame.calls = 0;
      frame.triangles = 0;
      requestAnimationFrame(flush);
    };
    requestAnimationFrame(flush);
    const proto = WebGL2RenderingContext.prototype;
    const wrap = (name, countIndex, instanceIndex) => {
      const original = proto[name];
      proto[name] = function (...args) {
        frame.calls += 1;
        if (args[0] === this.TRIANGLES) {
          const instances = instanceIndex === null ? 1 : args[instanceIndex];
          frame.triangles += (args[countIndex] / 3) * instances;
        }
        return original.apply(this, args);
      };
    };
    wrap("drawArrays", 2, null);
    wrap("drawElements", 1, null);
    wrap("drawArraysInstanced", 2, 3);
    wrap("drawElementsInstanced", 1, 4);
  };
  const vitals = () => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__vitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  };

  // Draw calls and triangles per station at desktop size.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(pretendHardware);
    await context.addInitScript(countDraws);
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "load" });
    await page.locator('.spatial-stage[data-scene-status="ready"]').waitFor({ timeout: 30000 });
    await page.locator("#skills button[aria-pressed]").filter({ hasText: /^Angular$/ }).click();
    const stations = {};
    for (const name of ["hero", "skills", "projects", "experience"]) {
      await page.locator(`[data-spatial-slot="${name}"]`).evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(400);
      await page.evaluate(() => (window.__frames = []));
      await page.waitForTimeout(1500);
      const frames = await page.evaluate(() => window.__frames);
      stations[name] = {
        frames: frames.length,
        maxCalls: Math.max(0, ...frames.map((frame) => frame.calls)),
        maxTriangles: Math.max(0, ...frames.map((frame) => frame.triangles)),
      };
    }
    report.drawCalls = stations;
    const worst = Math.max(...Object.values(stations).map((station) => station.maxCalls));
    const triangles = Math.max(...Object.values(stations).map((station) => station.maxTriangles));
    if (worst > 20) throw new Error(`Draw calls per frame ${worst} exceed 20`);
    if (triangles > 15000) throw new Error(`Triangles per frame ${triangles} exceed 15000`);

    // Idle: with the hero off screen and nothing animating, frames stop.
    await page.locator("#contact").evaluate((element) => element.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.evaluate(() => (window.__frames = []));
    await page.waitForTimeout(1500);
    report.idleFramesWithNoSlotVisible = (await page.evaluate(() => window.__frames)).length;
    if (report.idleFramesWithNoSlotVisible > 2) throw new Error(`Rendering continued off screen: ${report.idleFramesWithNoSlotVisible} frames`);
    await context.close();
  }

  // LCP and CLS on a throttled phone profile (headless approximation of a mid-range phone).
  for (const [label, init] of [["full", pretendHardware], ["default", null]]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    if (init) await context.addInitScript(init);
    await context.addInitScript(vitals);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await page.goto(origin, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(4000);
    for (let step = 0; step < 8; step++) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(250);
    }
    const result = await page.evaluate(() => ({ ...window.__vitals, tier: document.querySelector(".spatial-stage")?.dataset.sceneTier }));
    report[`phone-${label}`] = { lcpMs: Math.round(result.lcp), cls: Number(result.cls.toFixed(4)), tier: result.tier };
    if (result.lcp > 2500) throw new Error(`LCP ${result.lcp} ms on the throttled phone profile (${label})`);
    if (result.cls >= 0.1) throw new Error(`CLS ${result.cls} on the throttled phone profile (${label})`);
    await context.close();
  }

  return { performance: "passed", report };
}
