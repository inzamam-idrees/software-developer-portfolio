async (page) => {
  const ownedTestContexts = [];
  const createTestContext = async (options) => {
    const context = await page.context().browser().newContext(options);
    ownedTestContexts.push(context);
    return context;
  };
  try {
    const origin = new URL(page.url()).origin,
      browser = page.context().browser(),
      evidence = [],
      prefix = /:300(?:2|4)$/.test(origin) ? "production" : "development";
    const viewports = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ];
    for (const viewport of viewports) {
      const context = await createTestContext({
          viewport,
          reducedMotion: "no-preference",
        }),
        p = await context.newPage(),
        errors = [],
        failed = [];
      p.on("pageerror", (e) => errors.push(e.message));
      p.on("console", (msg) => {
        if (
          msg.type() === "error" &&
          !/google-analytics|googletagmanager/.test(msg.location().url || "")
        )
          errors.push(msg.text());
      });
      p.on("response", (r) => {
        if (
          r.status() >= 400 &&
          r.url().startsWith(origin) &&
          ["script", "stylesheet", "image"].includes(r.request().resourceType())
        )
          failed.push(new URL(r.url()).pathname + ":" + r.status());
      });
      p.on("requestfailed", (r) => {
        if (
          r.url().startsWith(origin) &&
          r.resourceType() === "script" &&
          !r.failure()?.errorText.includes("ABORTED")
        )
          failed.push(new URL(r.url()).pathname);
      });
      await p.goto(origin, { waitUntil: "domcontentloaded" });
      await p.locator("#contact").waitFor();
      await p
        .locator('.experience-shell[data-scene="ready"]')
        .waitFor({ timeout: 30000 });
      await p.waitForTimeout(1200);
      if ((await p.locator("h1").count()) !== 1)
        throw new Error("Home heading count");
      if (prefix === "production" && (await p.locator("nextjs-portal").count()))
        throw new Error("Next.js development tooling rendered in production");
      if (
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        throw new Error("Overflow at " + viewport.width);
      for (const id of [
        "hero",
        "projects",
        "about",
        "skills",
        "experience",
        "education",
        "writing",
        "contact",
      ])
        if (!(await p.locator("#" + id).count()))
          throw new Error("Missing chapter " + id);
      const hrefs = await p
        .locator("a")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      if (
        hrefs.some((h) => !h) ||
        !hrefs.some((h) => h.startsWith("mailto:")) ||
        !hrefs.some((h) => h.startsWith("tel:")) ||
        !hrefs.some((h) => h.includes("drive.google.com"))
      )
        throw new Error("Missing destination");
      const dead = await p
        .locator('a[href^="#"]')
        .evaluateAll((as) =>
          as
            .filter((a) => !document.getElementById(a.hash.slice(1)))
            .map((a) => a.hash),
        );
      if (dead.length) throw new Error("Dead anchors " + dead);
      await p.screenshot({
        path: `artifacts/portfolio/${prefix}-hero-${viewport.width}.png`,
      });
      if (viewport.width === 1440)
        await p.screenshot({
          path: `artifacts/portfolio/${prefix}-full-desktop.png`,
          fullPage: true,
        });
      for (const id of [
        "projects",
        "about",
        "skills",
        "experience",
        "writing",
        "contact",
      ]) {
        await p.locator("#" + id).evaluate((e) =>
          scrollTo({
            top:
              e.getBoundingClientRect().top +
              scrollY -
              document.querySelector(".site-header").getBoundingClientRect()
                .height -
              16,
            behavior: "instant",
          }),
        );
        await p.waitForTimeout(450);
        const collision = await p.evaluate(() => {
          const fixed = document.querySelector(".motion-button");
          if (!fixed) return [];
          const f = fixed.getBoundingClientRect();
          return [...document.querySelectorAll(".button, input, textarea")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.width &&
                r.top < innerHeight &&
                r.bottom > 0 &&
                r.left < f.right &&
                r.right > f.left &&
                r.top < f.bottom &&
                r.bottom > f.top
              );
            })
            .map((e) => e.textContent?.slice(0, 50) || e.id);
        });
        if (collision.length)
          throw new Error("Motion control overlap " + id + ": " + collision);
        if (viewport.width === 1440 || viewport.width === 390)
          await p.screenshot({
            path: `artifacts/portfolio/${prefix}-${id}-${viewport.width}.png`,
          });
      }
      if (viewport.width === 390)
        await p.screenshot({
          path: `artifacts/portfolio/${prefix}-full-mobile.png`,
          fullPage: true,
        });
      for (const route of ["/project", "/blog"]) {
        await p.goto(origin + route, { waitUntil: "domcontentloaded" });
        await p.locator("h1").waitFor();
        if (
          (await p.locator("h1").count()) !== 1 ||
          (await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ))
        )
          throw new Error("Route layout " + route);
      }
      await p.goto(origin + "/#experience", { waitUntil: "domcontentloaded" });
      await p.reload({ waitUntil: "domcontentloaded" });
      await p.waitForTimeout(300);
      if (errors.length || failed.length)
        throw new Error(JSON.stringify({ viewport, errors, failed }));
      evidence.push({
        viewport,
        routes: 3,
        refresh: "passed",
        errors: 0,
        failedScripts: 0,
        ...(prefix === "production" ? { developmentToolbar: "absent" } : {}),
      });
      await context.close();
    }
    for (const viewport of [viewports[0], viewports[4]]) {
      const c = await createTestContext({ viewport, reducedMotion: "reduce" }),
        p = await c.newPage();
      await p.goto(origin, { waitUntil: "domcontentloaded" });
      await p.locator("#contact").waitFor();
      await p.waitForTimeout(700);
      if (
        !(await p
          .getByRole("button", { name: "Enable motion", exact: true })
          .isDisabled())
      )
        throw new Error("System reduction ignored");
      if (
        (await p.locator("h1").evaluate((e) => getComputedStyle(e).opacity)) !==
        "1"
      )
        throw new Error("Reduced content opacity");
      await p.screenshot({
        path: `artifacts/portfolio/${prefix}-reduced-${viewport.width}.png`,
        fullPage: viewport.width === 390,
      });
      await c.close();
    }
    return {
      acceptance: "passed",
      matrix: evidence,
      reducedMotionBeforeLoad: "passed",
    };
  } finally {
    await Promise.allSettled(
      ownedTestContexts.map((context) => context.close()),
    );
  }
}
