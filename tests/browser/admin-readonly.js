async (sourcePage) => {
  const origin = "http://127.0.0.1:3019";
  const browser = sourcePage.context().browser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const login = await context.request.post(`${origin}/admin/session`, {
    form: { password: "phase-seven-browser-password" },
    headers: { origin },
    maxRedirects: 0,
  });
  if (login.status() !== 303) throw new Error(`Login returned ${login.status()}`);
  const page = await context.newPage();

  await page.goto(`${origin}/admin/theme`);
  const activateButtons = page.getByRole("button", { name: /^Activate / });
  for (const button of await activateButtons.all()) {
    if (await button.isEnabled()) throw new Error("Activation is offered on a read-only deployment");
  }
  await page.getByText(/read-only/i).first().waitFor();

  const direct = await context.request.post(`${origin}/admin/theme/activate`, {
    form: { themeId: "executive" },
    headers: { origin },
    maxRedirects: 0,
  });
  if (direct.status() !== 303) throw new Error(`Read-only activation returned ${direct.status()}`);
  const location = direct.headers().location ?? "";
  if (!location.includes("/admin/theme?error=READ_ONLY")) throw new Error(`Unexpected redirect: ${location}`);
  await page.goto(location);
  await page.getByRole("alert").filter({ hasText: /not configured/i }).waitFor();

  await page.goto(`${origin}/admin/content/profile`);
  if (await page.getByRole("button", { name: "Save changes" }).isEnabled()) {
    throw new Error("Save is enabled on a read-only deployment");
  }
  await context.close();
  return { adminReadonly: "passed" };
}
