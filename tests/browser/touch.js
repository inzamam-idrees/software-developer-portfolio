async (sourcePage) => {
  const ownedTestContexts = [];
  const createTestContext = async (options) => {
    const context = await sourcePage.context().browser().newContext(options);
    ownedTestContexts.push(context);
    return context;
  };
  try {
    const origin = new URL(sourcePage.url()).origin,
      c = await createTestContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
      }),
      p = await c.newPage();
    await p.goto(origin, { waitUntil: "domcontentloaded" });
    await p.getByRole("button", { name: "Open menu", exact: true }).waitFor();
    await p.getByRole("button", { name: "Open menu", exact: true }).tap();
    await p
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Work", exact: true })
      .tap();
    await p.waitForURL("**/#projects");
    await p.getByRole("button", { name: "Open menu", exact: true }).waitFor();
    if (
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    )
      throw new Error("Touch viewport overflow");
    await p.locator("#contact").evaluate((e) => scrollTo(0, e.offsetTop));
    await p.getByRole("button", { name: "Send message", exact: true }).tap();
    await p.getByText("Please enter your name.").waitFor();
    await p.locator("#contact form").evaluate((e) =>
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY - 88,
        behavior: "instant",
      }),
    );
    await p.screenshot({
      path: "artifacts/portfolio/production-contact-form-390.png",
    });
    await c.close();
    return {
      mobileTouch: "passed",
      menu: "passed",
      anchor: "passed",
      formControl: "passed",
    };
  } finally {
    await Promise.allSettled(
      ownedTestContexts.map((context) => context.close()),
    );
  }
}
