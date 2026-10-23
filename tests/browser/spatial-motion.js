async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3019";
  const evidence = {};

  async function open(options, seed) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
    if (seed) {
      await context.addInitScript((value) => localStorage.setItem("portfolio-motion", value), seed);
    }
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.locator(".is-header .spatial-motion-button").waitFor();
    return { context, page };
  }

  const state = (page) => page.locator(".spatial-motion-root").getAttribute("data-motion");
  async function chipTransition(page) {
    const chip = page.locator("#skills button[aria-pressed]").first();
    await chip.click();
    return chip.evaluate((element) => getComputedStyle(element).transitionDuration);
  }

  // System reduced motion: control disabled with an explanation, no transitions.
  {
    const { context, page } = await open({ reducedMotion: "reduce" });
    const button = page.locator(".is-header .spatial-motion-button");
    if (!(await button.isDisabled())) throw new Error("Motion control must be disabled under reduced motion");
    const note = await page.locator(`#${await button.getAttribute("aria-describedby")}`).innerText();
    if (!note.includes("reduced motion")) throw new Error(`Missing system note: ${note}`);
    if ((await state(page)) !== "paused") throw new Error("Reduced motion must render paused");
    const duration = await chipTransition(page);
    if (duration !== "0s") throw new Error(`Reduced motion transition is ${duration}`);
    evidence.reduced = { disabled: true, duration };
    await context.close();
  }

  // Motion allowed: transitions on, toggle pauses and persists the shared key.
  {
    const { context, page } = await open({ reducedMotion: "no-preference" });
    const button = page.locator(".is-header .spatial-motion-button");
    if ((await state(page)) !== "enabled") throw new Error("Motion should start enabled");
    if ((await button.innerText()) !== "Pause motion") throw new Error(`Label is ${await button.innerText()}`);
    const duration = await chipTransition(page);
    if (duration === "0s") throw new Error("Transitions missing while motion is enabled");
    await button.click();
    if ((await state(page)) !== "paused") throw new Error("Toggle did not pause");
    if ((await button.innerText()) !== "Enable motion") throw new Error("Label did not switch");
    const stored = await page.evaluate(() => localStorage.getItem("portfolio-motion"));
    if (stored !== "paused") throw new Error(`Stored preference is ${stored}`);
    evidence.enabled = { duration, stored };
    await context.close();
  }

  // A pause chosen in another theme (same key) applies to Spatial.
  {
    const { context, page } = await open({ reducedMotion: "no-preference" }, "paused");
    if ((await state(page)) !== "paused") throw new Error("Shared paused preference ignored");
    if ((await page.locator(".is-header .spatial-motion-button").innerText()) !== "Enable motion") throw new Error("Paused label wrong");
    evidence.sharedPreference = "paused";
    await context.close();
  }

  // On phones the control sits in the menu panel and still toggles motion.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "networkidle" });
    if (await page.locator(".is-header .spatial-motion-button").isVisible()) throw new Error("Header motion control visible on a phone");
    await page.locator(".spatial-mobile-nav summary").click();
    const button = page.locator(".is-menu .spatial-motion-button");
    if (!(await button.isVisible())) throw new Error("Menu motion control missing on a phone");
    await button.click();
    if ((await state(page)) !== "paused") throw new Error("Menu control did not pause");
    evidence.phone = "menu control";
    await context.close();
  }

  // Without JavaScript there is no motion control.
  {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    if (await page.locator(".is-header .spatial-motion-button").count()) throw new Error("Motion control rendered without JavaScript");
    await context.close();
  }

  return { motion: "passed", evidence };
}
