async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3019";
  // axe-core ships with eslint-plugin-jsx-a11y; run this script from the repository root.
  const axePath = "node_modules/axe-core/axe.min.js";
  const report = {};
  const pretendHardware = () => {
    const original = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (key) {
      return key === 37446 ? "Test hardware GPU" : original.call(this, key);
    };
  };

  async function audit(page, label) {
    await page.addScriptTag({ path: axePath });
    const result = await page.evaluate(async () =>
      window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }),
    );
    report[label] = result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
    }));
  }

  for (const [label, options, init] of [
    ["desktop-3d", { viewport: { width: 1440, height: 900 } }, pretendHardware],
    ["phone-3d", { viewport: { width: 390, height: 844 } }, pretendHardware],
    ["desktop-reduced", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }, null],
  ]) {
    const context = await browser.newContext(options);
    if (init) await context.addInitScript(init);
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "load" });
    await page.locator(".spatial-stage[data-scene-status]").waitFor();
    await page.waitForTimeout(3000);
    await page.locator("#skills button[aria-pressed]").filter({ hasText: /^React$/ }).click();
    // Let the 160–200 ms state transitions finish so axe measures settled colours.
    await page.waitForTimeout(600);
    await audit(page, label);

    // Keyboard walk: every stop is visible, shows a focus indicator, and never enters the canvas.
    if (label === "desktop-3d") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator("body").focus();
      const problems = [];
      let stops = 0;
      for (let step = 0; step < 200; step++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return null;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            text: (element.innerText || element.getAttribute("aria-label") || "").slice(0, 40),
            inCanvas: Boolean(element.closest(".spatial-stage")),
            outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
            visible: rect.width > 0 && rect.height > 0,
          };
        });
        if (!info) break;
        stops += 1;
        if (info.inCanvas) problems.push(`focus entered the canvas: ${info.tag}`);
        if (!info.visible) problems.push(`invisible focus target: ${info.tag} ${info.text}`);
        if (!info.outline) problems.push(`no focus indicator: ${info.tag} ${info.text}`);
      }
      report.keyboard = { stops, problems: problems.slice(0, 10) };
    }
    await context.close();
  }

  for (const route of ["/project", "/blog"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(origin + route, { waitUntil: "load" });
    await page.locator('[data-theme-id="spatial"]').waitFor();
    await audit(page, route);
    await context.close();
  }

  const violations = Object.entries(report)
    .filter(([key]) => key !== "keyboard")
    .flatMap(([, list]) => list);
  if (violations.length || report.keyboard.problems.length) {
    throw new Error(JSON.stringify(report));
  }
  return { accessibility: "passed", report };
}
