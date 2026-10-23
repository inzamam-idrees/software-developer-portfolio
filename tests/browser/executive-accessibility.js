async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3016", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  if (!(await skip.evaluate((element) => element === document.activeElement))) throw new Error("Skip link is not the first keyboard destination");
  await page.keyboard.press("Enter");
  if (!(await page.locator("#main-content").evaluate((element) => element === document.activeElement))) throw new Error("Skip link did not move focus to main content");
  if ((await page.getByRole("heading", { level: 1 }).count()) !== 1) throw new Error("Executive home must have exactly one h1");
  const menu = page.locator(".executive-mobile-nav summary");
  await menu.focus();
  const focus = await menu.evaluate((element) => ({ style: getComputedStyle(element).outlineStyle, width: getComputedStyle(element).outlineWidth }));
  if (focus.style === "none" || focus.width === "0px") throw new Error("Mobile menu focus is not visible");
  const targets = await page.locator("a,button,summary,input,textarea").evaluateAll((elements) => elements.filter((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && (box.width < 24 || box.height < 24);
  }).map((element) => ({ text: element.textContent.trim(), tag: element.tagName, box: element.getBoundingClientRect().toJSON() })));
  if (targets.length) throw new Error(`Interactive targets below 24px: ${JSON.stringify(targets)}`);
  await context.close();

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await nojs.newPage();
  await staticPage.goto("http://127.0.0.1:3016", { waitUntil: "domcontentloaded" });
  await staticPage.getByRole("heading", { level: 1, name: /Engineering with intention/i }).waitFor();
  const nativeMenu = staticPage.locator(".executive-mobile-nav");
  await nativeMenu.locator("summary").focus();
  await staticPage.keyboard.press("Enter");
  if (!(await nativeMenu.evaluate((element) => element.open))) throw new Error("Native mobile menu does not work without JavaScript");
  await nojs.close();
  return { accessibility: "passed", skipLink: "first", headingHierarchy: "one h1", focus: "visible", minimumTarget: "24px", noJavaScript: "essential content and navigation available" };
}
