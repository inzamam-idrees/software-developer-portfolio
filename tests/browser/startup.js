async (page) => {
  const ownedTestContexts = [];
  const createTestContext = async (options) => {
    const context = await page.context().browser().newContext(options);
    ownedTestContexts.push(context);
    return context;
  };
  try {
    const origin = new URL(page.url()).origin;
    const errors = [];
    for (let run = 0; run < 3; run++) {
      const context = await createTestContext(),
        p = await context.newPage();
      p.on("pageerror", (e) => errors.push(e.message));
      for (let visit = 0; visit < 2; visit++) {
        if (visit === 0)
          await p.goto(origin, { waitUntil: "domcontentloaded" });
        else await p.reload({ waitUntil: "domcontentloaded" });
        await p.locator("#contact").waitFor();
        await p.waitForTimeout(800);
        if (
          (await p.locator("h1").count()) !== 1 ||
          !(await p
            .getByText("MIS / Nexis Project", { exact: true })
            .first()
            .isVisible())
        )
          throw new Error("Cold content absent");
        if (errors.length) throw new Error(errors.join("; "));
      }
      await context.close();
    }
    const nojs = await createTestContext({ javaScriptEnabled: false });
    const staticPage = await nojs.newPage();
    await staticPage.goto(origin, { waitUntil: "domcontentloaded" });
    const text = await staticPage.locator("body").innerText();
    if (
      !text.includes("MIS / Nexis Project") ||
      !text.includes("inzamamidrees@gmail.com")
    )
      throw new Error("Essential content absent without JavaScript");
    await nojs.close();
    return {
      startup: "passed",
      coldVisits: 3,
      reloads: 3,
      noJavaScript: "passed",
    };
  } finally {
    await Promise.allSettled(
      ownedTestContexts.map((context) => context.close()),
    );
  }
}
