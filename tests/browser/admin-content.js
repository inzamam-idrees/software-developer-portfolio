async (sourcePage) => {
  const origin = "http://127.0.0.1:3018";
  const password = "phase-seven-browser-password";
  const browser = sourcePage.context().browser();
  const evidence = [];

  async function signedInContext() {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const login = await context.request.post(`${origin}/admin/session`, {
      form: { password },
      headers: { origin },
      maxRedirects: 0,
    });
    if (login.status() !== 303) throw new Error(`Login returned ${login.status()}`);
    return context;
  }

  async function saveAndWait(page) {
    await page.getByRole("button", { name: "Save changes" }).click();
    const status = page.locator("[data-save-status]");
    await status.filter({ hasNotText: /^$|Saving/ }).waitFor({ timeout: 20000 });
    return (await status.innerText()).trim();
  }

  // ── Anonymous access is redirected ──
  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(`${origin}/admin/content/profile`);
  if (!anonymousPage.url().includes("/admin/login")) {
    throw new Error(`Anonymous editor access was not redirected: ${anonymousPage.url()}`);
  }
  const anonymousSave = await anonymous.request.post(`${origin}/admin/content/profile/save`, {
    data: { data: {}, expectedRevision: "x" },
    headers: { origin },
  });
  if (anonymousSave.status() !== 401) throw new Error(`Anonymous save returned ${anonymousSave.status()}`);
  await anonymous.close();
  evidence.push("anonymous redirected and rejected");

  // ── Document list ──
  const context = await signedInContext();
  const page = await context.newPage();
  await page.goto(`${origin}/admin/content`);
  for (const label of ["Profile", "Projects", "Shared copy", "Executive theme copy"]) {
    await page.getByRole("link", { name: label, exact: true }).waitFor();
  }
  if (!(await page.getByText(/local files/i).first().isVisible())) {
    throw new Error("Store kind is not shown on the document list");
  }
  evidence.push("document list");

  // ── Successful edit is live on the public site ──
  await page.goto(`${origin}/admin/content/profile`);
  const headline = page.getByLabel("Headline", { exact: true });
  await headline.fill("Engineering with care.");
  const saved = await saveAndWait(page);
  if (!/Saved\. Live now\./.test(saved)) throw new Error(`Unexpected save status: ${saved}`);
  const publicPage = await context.newPage();
  await publicPage.goto(origin);
  await publicPage.getByRole("heading", { level: 1, name: /Engineering with care\./ }).waitFor();
  evidence.push("edit published");

  // ── Field validation errors stay on the field ──
  await page.reload();
  await page.getByLabel("Name", { exact: true }).fill("");
  const invalid = await saveAndWait(page);
  if (!/Fix the highlighted fields/.test(invalid)) throw new Error(`Unexpected invalid status: ${invalid}`);
  const nameError = page.locator("#field-name-error");
  if (!(await nameError.isVisible())) throw new Error("Name error is not shown next to the field");
  if ((await page.getByLabel("Name", { exact: true }).getAttribute("aria-invalid")) !== "true") {
    throw new Error("Name field is not marked invalid");
  }
  evidence.push("field error");

  // ── Concurrent edit is rejected without losing the form ──
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto(`${origin}/admin/content/profile`);
  await second.goto(`${origin}/admin/content/profile`);
  await first.getByLabel("Headline", { exact: true }).fill("Engineering with intention.");
  if (!/Saved/.test(await saveAndWait(first))) throw new Error("First tab did not save");
  await second.getByLabel("Focus label", { exact: true }).fill("Second tab value");
  const conflict = await saveAndWait(second);
  if (!/changed elsewhere/i.test(conflict)) throw new Error(`Unexpected conflict status: ${conflict}`);
  if ((await second.getByLabel("Focus label", { exact: true }).inputValue()) !== "Second tab value") {
    throw new Error("Conflict discarded the unsaved value");
  }
  evidence.push("conflict kept form");

  // ── Expired session keeps the form ──
  await context.clearCookies();
  await second.reload().catch(() => {});
  const expired = await signedInContext();
  const stale = await expired.newPage();
  await stale.goto(`${origin}/admin/content/about`);
  await expired.clearCookies();
  await stale.getByLabel("Summary", { exact: true }).fill("Unsaved summary");
  const sessionStatus = await saveAndWait(stale);
  if (!/sign in again/i.test(sessionStatus)) throw new Error(`Unexpected expired status: ${sessionStatus}`);
  if ((await stale.getByLabel("Summary", { exact: true }).inputValue()) !== "Unsaved summary") {
    throw new Error("Expired session discarded the form");
  }
  evidence.push("expired session kept form");

  // ── Keyboard reachability ──
  const keyboardContext = await signedInContext();
  const keyboardPage = await keyboardContext.newPage();
  await keyboardPage.goto(`${origin}/admin/content/projects`);
  const removeButtons = keyboardPage.getByRole("button", { name: /^Remove item \d+ from Projects$/ });
  const before = await removeButtons.count();
  await keyboardPage.getByRole("button", { name: "Add item to Projects" }).focus();
  await keyboardPage.keyboard.press("Enter");
  if ((await removeButtons.count()) !== before + 1) {
    throw new Error("Keyboard Add item did not create an item");
  }
  evidence.push("keyboard add item");

  // ── Invalid JSON blocks saving without sending a request ──
  let saveRequests = 0;
  keyboardPage.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/save")) saveRequests += 1;
  });
  await keyboardPage.goto(`${origin}/admin/content/articles`);
  await keyboardPage.getByLabel("Articles (JSON)", { exact: true }).fill("{ not json");
  const jsonStatus = await saveAndWait(keyboardPage);
  if (!/invalid JSON/i.test(jsonStatus)) throw new Error(`Unexpected JSON status: ${jsonStatus}`);
  if (saveRequests !== 0) throw new Error("Invalid JSON was submitted");
  evidence.push("invalid JSON blocked");

  await keyboardContext.close();
  await expired.close();
  await context.close();
  return { adminContent: "passed", evidence };
}
