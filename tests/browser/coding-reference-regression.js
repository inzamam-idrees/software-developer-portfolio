async (sourcePage) => {
  const origin = "http://127.0.0.1:3014";
  const applicationErrors = [];
  sourcePage.on("console", (message) => {
    if (message.type() === "error") applicationErrors.push(message.text());
  });
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ];
  const screenshots = [];

  for (const viewport of viewports) {
    await sourcePage.setViewportSize(viewport);
    for (const route of ["/", "/project", "/blog"]) {
      await sourcePage.goto(origin + route, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      await sourcePage.locator('[data-theme-id="coding"]').waitFor();
      if (
        await sourcePage.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        )
      ) {
        throw new Error(`Coding overflow at ${viewport.width} on ${route}`);
      }
      const routeName = route === "/" ? "home" : route.slice(1);
      const path = `artifacts/portfolio/coding-reference-${routeName}-${viewport.width}x${viewport.height}.png`;
      await sourcePage.screenshot({ path, fullPage: true });
      screenshots.push(path);
    }
  }

  await sourcePage.setViewportSize({ width: 1280, height: 800 });
  await sourcePage.goto(origin, { waitUntil: "domcontentloaded" });
  if (await sourcePage.locator('button[aria-controls="coding-mobile-menu"]').isVisible()) {
    throw new Error("Coding mobile menu control is visible on desktop");
  }
  if (!(await sourcePage.locator("#navbar-default").isVisible())) {
    throw new Error("Coding reference desktop navigation is hidden");
  }

  await sourcePage.setViewportSize({ width: 768, height: 1024 });
  await sourcePage.goto(origin, { waitUntil: "domcontentloaded" });
  if (!(await sourcePage.locator('button[aria-controls="coding-mobile-menu"]').isVisible())) {
    throw new Error("Coding tablet navigation does not use the mobile disclosure");
  }
  if (await sourcePage.locator("#navbar-default").isVisible()) {
    throw new Error("Coding desktop navigation crowds the tablet header");
  }

  await sourcePage.setViewportSize({ width: 1280, height: 800 });
  await sourcePage.goto(origin + "/project", { waitUntil: "domcontentloaded" });
  await sourcePage.getByRole("heading", { level: 1, name: "All Projects" }).waitFor();
  const projectColumns = await sourcePage
    .locator('[data-coding-project-grid="true"]')
    .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  if (projectColumns !== 2) throw new Error("Coding project archive is not two columns");

  await sourcePage.setViewportSize({ width: 320, height: 700 });
  await sourcePage.goto(origin + "/project", { waitUntil: "domcontentloaded" });
  const narrowProjectHeading = sourcePage.getByRole("heading", {
    level: 1,
    name: "All Projects",
  });
  const narrowHeadingBox = await narrowProjectHeading.boundingBox();
  if (!narrowHeadingBox || narrowHeadingBox.height > 44) {
    throw new Error("Coding project heading wraps on narrow mobile");
  }

  await sourcePage.setViewportSize({ width: 1280, height: 800 });
  await sourcePage.goto(origin + "/blog", { waitUntil: "domcontentloaded" });
  await sourcePage.getByRole("heading", { level: 1, name: "All Blog" }).waitFor();
  await sourcePage.locator('[data-coding-blog-decoration="true"]').waitFor();
  const blogCards = sourcePage.locator("[data-coding-blog-card]");
  if (await blogCards.count()) {
    await blogCards.first().locator("img").waitFor();
    await blogCards.first().locator('[data-coding-blog-engagement="true"]').waitFor();
  }

  await sourcePage.setViewportSize({ width: 390, height: 844 });
  await sourcePage.goto(origin, { waitUntil: "domcontentloaded" });
  const toggle = sourcePage.locator('button[aria-controls="coding-mobile-menu"]');
  await toggle.waitFor();
  await sourcePage.waitForFunction(
    () =>
      document
        .querySelector('button[aria-controls="coding-mobile-menu"]')
        ?.getAttribute("data-ready") === "true",
  );
  if ((await toggle.getAttribute("aria-label")) !== "Open menu") {
    throw new Error("Coding mobile menu has no accessible closed label");
  }
  await toggle.click();
  await sourcePage.waitForFunction(
    () =>
      document
        .querySelector('button[aria-controls="coding-mobile-menu"]')
        ?.getAttribute("aria-expanded") === "true",
  );
  const about = sourcePage.getByRole("link", { name: "ABOUT" });
  await about.waitFor();
  await sourcePage.keyboard.press("Escape");
  await sourcePage.waitForFunction(
    () =>
      document
        .querySelector('button[aria-controls="coding-mobile-menu"]')
        ?.getAttribute("aria-expanded") === "false",
  );

  const relevantErrors = applicationErrors.filter(
    (message) =>
      !message.includes("favicon") &&
      !message.includes("React DevTools") &&
      !message.includes("next-devtools") &&
      !message.includes("caret-color") &&
      !(message.includes('id="contact-name"') && message.includes("style={{}}")),
  );
  if (relevantErrors.length) {
    throw new Error(`Coding emitted browser errors: ${relevantErrors.join(" | ")}`);
  }

  return { codingReferenceRegression: "passed", screenshots };
}
