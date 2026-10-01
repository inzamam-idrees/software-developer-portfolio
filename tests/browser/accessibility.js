async (sourcePage) => {
  const ownedTestContexts = [];
  const createTestContext = async (options) => {
    const context = await sourcePage.context().browser().newContext(options);
    ownedTestContexts.push(context);
    return context;
  };
  try {
    const context = await createTestContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const origin = new URL(sourcePage.url()).origin;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.locator(".motion-button").waitFor();
    const borderContrast = await page.locator("#contact-name").evaluate((e) => {
      const c = getComputedStyle(e),
        l = (s) => {
          const rgb = s
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map((v) => Number(v) / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            );
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
      return (l(c.borderTopColor) + 0.05) / (l(c.backgroundColor) + 0.05);
    });
    if (borderContrast < 3)
      throw new Error("Input boundary contrast below 3:1: " + borderContrast);
    await page.keyboard.press("Tab");
    if (
      !(await page
        .getByRole("link", { name: "Skip to content" })
        .evaluate((e) => e === document.activeElement))
    )
      throw new Error("Skip link is not first keyboard destination");
    await page.keyboard.press("Enter");
    if (
      !(await page
        .locator("#main-content")
        .evaluate((e) => e === document.activeElement))
    )
      throw new Error("Skip destination focus");
    await page.getByRole("link", { name: "Inzamam Idrees home" }).focus();
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("Tab");
      if (
        await page.evaluate(() =>
          Boolean(document.activeElement.closest(".mobile-menu")),
        )
      )
        throw new Error("Closed menu link tabbable");
    }
    const toggle = page.getByRole("button", { name: "Open menu", exact: true });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    if (
      (await page.evaluate(() => document.activeElement.textContent.trim())) !==
      "Work"
    )
      throw new Error("Open menu keyboard order");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Open menu", exact: true })
      .waitFor();
    const focus = await toggle.evaluate((e) => ({
      outline: getComputedStyle(e).outlineStyle,
      width: getComputedStyle(e).outlineWidth,
    }));
    if (focus.outline === "none" || focus.width === "0px")
      throw new Error("Keyboard focus invisible");
    const nojs = await createTestContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const staticPage = await nojs.newPage();
    await staticPage.goto(origin, { waitUntil: "domcontentloaded" });
    const native = staticPage.locator("summary.menu-toggle");
    if ((await native.getAttribute("aria-expanded")) !== null)
      throw new Error(
        "No-JavaScript disclosure overrides native expanded state",
      );
    await native.focus();
    await staticPage.keyboard.press("Enter");
    if (
      !(await staticPage
        .locator("details.mobile-disclosure")
        .evaluate((e) => e.open))
    )
      throw new Error("Native menu does not open");
    await nojs.close();
    await context.close();
    return {
      accessibility: "passed",
      inputBoundaryContrast: +borderContrast.toFixed(2),
      skipLink: "first",
      closedMenu: "not tabbable",
      focus: "visible",
    };
  } finally {
    await Promise.allSettled(
      ownedTestContexts.map((context) => context.close()),
    );
  }
}
