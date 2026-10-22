async (page) => {
  const origin = "http://127.0.0.1:3025";
  const context = page.context();
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const login = await context.request.post(`${origin}/admin/session`, {
    form: { password: "prism-browser-password" }, headers: { origin }, maxRedirects: 0,
  });
  check(login.status() === 303, `Login returned ${login.status()}`);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const scripts = [];
  let inspectingPrism = true;
  page.on("response", async (response) => {
    if (inspectingPrism && response.request().resourceType() === "script" && response.url().startsWith(origin)) {
      const body = await response.text().catch(() => "");
      if (/WebGLRenderer|__r3f|GreenSock|GSAP 3\./.test(body)) scripts.push(response.url());
    }
  });
  const shots = [];
  for (const width of [390, 768, 1280, 1536]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["", "/project", "/blog"]) {
      await page.goto(`${origin}/preview/prism${route}`, { waitUntil: "networkidle" });
      await page.locator('.prism-root[data-ready="true"]').waitFor();
      check(await page.locator('[data-theme-id="prism"]').count() === 1, "Prism missing");
      check(await page.locator('meta[name="robots"][content*="noindex"]').count() > 0, "Preview indexable");
      await page.waitForTimeout(700);
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      check(geometry.document <= geometry.viewport + 1, `Overflow at ${width} ${route}: ${geometry.document}`);
      for (const mode of ["dark", "light"]) {
        if (await page.locator(".prism-root").getAttribute("data-color") !== mode) await page.getByRole("button", { name: "Toggle color theme" }).click();
        await page.locator("dialog[open]").waitFor({ state: "detached" });
        const path = `/tmp/prism-${width}-${route.slice(1) || "home"}-${mode}.png`;
        await page.screenshot({ path }); shots.push(path);
      }
    }
  }
  await page.goto(`${origin}/preview/prism`, { waitUntil: "networkidle" });
  const first = await page.locator('.prism-carousel article:visible h3').textContent();
  await page.getByRole("button", { name: "Next project", exact: true }).click();
  await page.waitForTimeout(1100);
  check(await page.locator('.prism-carousel article:visible h3').textContent() !== first, "Carousel did not advance");
  const trigger = page.getByRole("button", { name: "Quick preview", exact: true }).first();
  await trigger.click();
  const dialog = page.locator('dialog[open]');
  check(await dialog.count() === 1, "Modal missing");
  check(await page.evaluate(() => document.body.style.overflow === "hidden"), "Modal did not lock scroll");
  check(await dialog.evaluate((el) => el.contains(document.activeElement)), "Focus not inside modal");
  const focusables = dialog.locator('button, a[href]');
  await focusables.last().focus(); await page.keyboard.press("Tab");
  check(await dialog.evaluate((el) => el.contains(document.activeElement)), "Focus escaped modal");
  await page.keyboard.press("Escape");
  await page.locator("dialog[open]").waitFor({ state: "detached" });
  check(await page.locator('dialog[open]').count() === 0, "Escape failed");
  check(await trigger.evaluate((el) => document.activeElement === el), "Focus not restored");
  await trigger.click();
  await dialog.getByRole("link", { name: "View full project" }).last().click();
  await page.waitForURL(/\/preview\/prism\/project\//);
  check(await page.locator('.prism-project h1').count() === 1, "Project detail missing");
  await page.goto(`${origin}/preview/prism`, { waitUntil: "networkidle" });
  const filter = page.locator('.prism-filters button').nth(1);
  await filter.click();
  check(await page.locator('.prism-skills-grid article:visible').count() === 1, "Skills filter failed");
  await page.getByRole('button', { name: 'All Skills', exact: true }).click();
  check(await page.locator('.prism-skills-grid article:visible').count() > 1, "Skills reset failed");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.prism-menu-trigger').click();
  check(await page.locator('.prism-drawer[open]').count() === 1, "Drawer missing");
  await page.keyboard.press("Escape");
  await page.locator("dialog[open]").waitFor({ state: "detached" });
  check(await page.locator('.prism-menu-trigger').evaluate((el) => document.activeElement === el), "Drawer focus not restored");
  await page.locator('.prism-menu-trigger').click();
  await page.locator('.prism-drawer nav a').filter({ hasText: 'Skills' }).click();
  await page.waitForTimeout(500);
  check(await page.locator('dialog[open]').count() === 0, "Drawer did not close on preview link");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  check(await page.locator('.prism-root').getAttribute('data-motion') === 'off', 'Reduced motion ignored');
  check(await page.locator('.prism-cursor').evaluate((el) => getComputedStyle(el).display === 'none'), 'Cursor active under reduced motion');
  check(await page.locator('.prism-marquee-track').first().evaluate((el) => getComputedStyle(el).animationName === 'none'), 'Marquee active under reduced motion');
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${origin}/admin/content/certificates`, { waitUntil: "networkidle" });
  check(await page.getByRole('heading', { name: 'Certificates', exact: true }).count() > 0, 'Certificate editor missing');
  await page.goto(`${origin}/preview/prism`, { waitUntil: "networkidle" });
  const enable = page.getByRole('button', { name: 'Enable motion', exact: true });
  if (await enable.count()) await enable.click();
  await page.locator('.prism-footer a[href="/project"]').click();
  await page.waitForURL('**/preview/prism/project');
  await page.locator('.prism-header a[href="/"]').click();
  await page.waitForURL('**/preview/prism');
  await page.waitForTimeout(700);
  check(await page.locator('.prism-marquee-track').first().evaluate((el) => el.getAnimations().some((animation) => animation.playState === 'running')), 'Client navigation canceled marquee');
  inspectingPrism = false;
  for (const id of ['coding','cinematic','executive','spatial']) {
    await page.goto(`${origin}/preview/${id}`, { waitUntil: "domcontentloaded" });
    check(await page.locator(`[data-theme-id="${id}"]`).count() === 1, `${id} broken`);
    check(await page.locator('#certificates').count() === 0, `Certificates leaked into ${id}`);
    check(!(await page.locator('body').innerText()).includes('[TODO: certificate'), `Placeholder leaked into ${id}`);
  }
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  check(await page.locator('[data-theme-id="coding"]').count() === 1, "Public theme changed");
  const nojs = await context.browser().newContext({ javaScriptEnabled: false, storageState: await context.storageState() });
  const fallback = await nojs.newPage();
  await fallback.goto(`${origin}/preview/prism`, { waitUntil: "networkidle" });
  check(await fallback.locator('.prism-carousel article:visible').count() === 4, 'No-JS project content hidden');
  check(await fallback.locator('.prism-skills-grid article:visible').count() > 1, 'No-JS skills hidden');
  check(await fallback.locator('#certificates h3:visible').count() === 3, 'No-JS certificates hidden');
  check(await fallback.locator('#contact:visible').count() === 1, 'No-JS contact hidden');
  await nojs.close();
  check(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  return { routes: 12, screenshots: shots.length, modal: 'passed', drawer: 'passed', filters: 'passed', reducedMotion: 'passed', noJavaScript: 'passed', isolation: 'passed', pageErrors: errors, heavyPrismScripts: scripts };
}
