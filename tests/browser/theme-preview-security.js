async (sourcePage) => {
  const browser = sourcePage.context().browser();
  const origin = "http://127.0.0.1:3017";
  const heavySignature = /WebGLRenderer|__r3f|GreenSock|GSAP 3\./;

  async function verifyLightPreview(themeId) {
    const context = await browser.newContext();
    const login = await context.request.post(`${origin}/admin/session`, {
      form: { password: "phase-five-browser-password" },
      headers: { origin },
      maxRedirects: 0,
    });
    if (login.status() !== 303) throw new Error(`Preview proof login returned ${login.status()}`);

    const page = await context.newPage();
    const scripts = [];
    page.on("response", async (response) => {
      if (response.request().resourceType() !== "script" || !response.url().startsWith(origin)) return;
      const body = await response.body().catch(() => new Uint8Array());
      scripts.push({ url: response.url(), body });
    });
    await page.goto(`${origin}/preview/${themeId}`, { waitUntil: "networkidle" });
    await page.locator(`[data-theme-id="${themeId}"]`).waitFor();
    const heavy = scripts.filter(({ body }) => heavySignature.test(Buffer.from(body).toString("utf8")));
    if (heavy.length) {
      throw new Error(`${themeId} preview downloaded Cinematic heavy modules: ${heavy.map(({ url }) => url).join(", ")}`);
    }
    const evidence = {
      themeId,
      scripts: scripts.length,
      bytes: scripts.reduce((total, { body }) => total + body.length, 0),
      heavy: heavy.length,
    };
    await context.close();
    return evidence;
  }

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto(origin, { waitUntil: "domcontentloaded" });
  await publicPage.locator('[data-theme-id="cinematic"]').waitFor();
  if (await publicPage.locator('meta[name="robots"][content*="noindex"]').count()) {
    throw new Error("Public metadata was changed by preview architecture");
  }

  const anonymousAdmin = await publicPage.goto(`${origin}/admin/theme`, {
    waitUntil: "domcontentloaded",
  });
  if (!anonymousAdmin.url().includes("/admin/login")) {
    throw new Error("Anonymous administrator route was not protected");
  }
  if (await publicPage.getByText("Current public theme").count()) {
    throw new Error("Private theme management leaked to an anonymous response");
  }

  await publicPage.getByLabel("Administrator password").fill("incorrect-password");
  await publicPage.getByRole("button", { name: "Sign in" }).click();
  await publicPage.getByText("Unable to sign in with those credentials.").waitFor();

  await publicPage.getByLabel("Administrator password").fill("phase-five-browser-password");
  await publicPage.getByRole("button", { name: "Sign in" }).click();
  await publicPage.waitForURL(`${origin}/admin/theme`);
  await publicPage.getByText("Current public theme").waitFor();
  await publicPage.getByText("Cinematic", { exact: true }).first().waitFor();
  if (!(await publicPage.getByRole("button", { name: "Activate Executive" }).isVisible())) {
    throw new Error("Theme activation button was not available");
  }

  const rejected = await publicPage.request.post(`${origin}/admin/theme/preview`, {
    form: { themeId: "minimal" },
    headers: { origin },
  });
  if (rejected.status() !== 400) {
    throw new Error(`Invalid preview theme returned ${rejected.status()}`);
  }

  // ── The older cookie preview now hands over to the URL preview ──
  const legacy = await publicPage.request.post(`${origin}/admin/theme/preview`, {
    form: { themeId: "executive" },
    headers: { origin },
    maxRedirects: 0,
  });
  if (legacy.status() !== 303 || !legacy.headers().location?.endsWith("/preview/executive")) {
    throw new Error(`Legacy preview returned ${legacy.status()} to ${legacy.headers().location}`);
  }
  if (/portfolio_theme_preview=[^;]/.test(legacy.headers()["set-cookie"] ?? "")) {
    throw new Error("Legacy preview still issues a preview cookie");
  }
  await publicContext.addCookies([
    { name: "portfolio_theme_preview", value: "forged.value", url: origin },
  ]);
  await publicPage.goto(origin, { waitUntil: "domcontentloaded" });
  await publicPage.locator('[data-theme-id="cinematic"]').waitFor();
  if (await publicPage.locator('[data-theme-id="executive"]').count()) {
    throw new Error("A preview cookie changed the public theme");
  }
  await publicPage.goto(`${origin}/admin/theme`, { waitUntil: "domcontentloaded" });

  // ── Previews live on their own route and never change the public routes ──
  await publicPage.getByRole("link", { name: "Preview Executive" }).click();
  await publicPage.waitForURL(`${origin}/preview/executive`);
  await publicPage.locator('[data-theme-id="executive"]').waitFor();
  if (!(await publicPage.locator('meta[name="robots"][content*="noindex"]').count())) {
    throw new Error("Private preview response can be indexed");
  }
  await publicPage.getByRole("complementary", { name: "Theme preview controls" }).waitFor();
  await publicPage.locator('[data-theme-id="executive"] a[href="/project"]:visible').first().click();
  await publicPage.waitForURL(`${origin}/preview/executive/project`);
  await publicPage.locator('[data-theme-id="executive"]').waitFor();
  await publicPage.goto(`${origin}/preview/executive/blog`, { waitUntil: "domcontentloaded" });
  await publicPage.locator('[data-theme-id="executive"]').waitFor();
  for (const route of ["/", "/project", "/blog"]) {
    await publicPage.goto(origin + route, { waitUntil: "domcontentloaded" });
    await publicPage.locator('[data-theme-id="cinematic"]').waitFor();
  }
  const missingTheme = await publicPage.goto(`${origin}/preview/minimal`, { waitUntil: "domcontentloaded" });
  if (missingTheme.status() !== 404) {
    throw new Error(`Unknown preview theme returned ${missingTheme.status()}`);
  }

  const separateContext = await browser.newContext();
  const separatePage = await separateContext.newPage();
  await separatePage.goto(origin, { waitUntil: "domcontentloaded" });
  await separatePage.locator('[data-theme-id="cinematic"]').waitFor();
  if (await separatePage.locator('[data-theme-id="executive"]').count()) {
    throw new Error("Preview state leaked into another browser session");
  }
  await separatePage.goto(`${origin}/preview/executive`, { waitUntil: "domcontentloaded" });
  if (!separatePage.url().includes("/admin/login")) {
    throw new Error("Anonymous preview route was not protected");
  }

  const unauthorizedPost = await separatePage.request.post(
    `${origin}/admin/theme/preview`,
    { form: { themeId: "coding" }, headers: { origin }, maxRedirects: 0 },
  );
  if (unauthorizedPost.status() !== 401) {
    throw new Error(`Unauthorized preview mutation returned ${unauthorizedPost.status()}`);
  }

  await separateContext.close();
  await publicContext.close();
  const moduleIsolation = [];
  for (const themeId of ["coding", "executive"]) {
    moduleIsolation.push(await verifyLightPreview(themeId));
  }
  const result = {
    previewSecurity: "passed",
    publicTheme: "cinematic",
    previewTheme: "executive",
    isolatedSessions: true,
    activationExposed: false,
    moduleIsolation,
  };
  await sourcePage.evaluate((value) => {
    document.body.dataset.phase5Result = JSON.stringify(value);
  }, result);
  return result;
}
