async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  if (!(await page.locator("#contact form").count()))
    throw new Error("Semantic contact form missing");
  let calls = 0,
    mode = "hold",
    release;
  await page.route("**/api/contact", async (route) => {
    calls++;
    if (mode === "hold")
      await new Promise((r) => {
        release = r;
      });
    if (mode === "network") {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      status: mode === "fail" ? 502 : 200,
      contentType: "application/json",
      body: JSON.stringify({ success: mode !== "fail" }),
    });
  });
  const form = page.locator("#contact form"),
    name = page.getByLabel("Your name"),
    email = page.getByLabel("Email address"),
    message = page.getByLabel("What are you building?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Please enter your name.").waitFor();
  await name.fill("Test User");
  await email.fill("bad");
  await message.fill("A project inquiry.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Please enter a valid email address.").waitFor();
  await email.fill("test@example.com");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('#contact button[type="submit"]')?.disabled,
  );
  await form.evaluate((f) => {
    f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(100);
  if (calls !== 1) throw new Error("Duplicate submission");
  release();
  await page.getByText("Message sent. Thank you for reaching out.").waitFor();
  if (await name.inputValue()) throw new Error("Form not cleared");
  mode = "fail";
  await name.fill("Test User");
  await email.fill("test@example.com");
  await message.fill("Keep this message.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByText(
      "Could not send your message. Please try again or email me directly.",
    )
    .waitFor();
  if ((await message.inputValue()) !== "Keep this message.")
    throw new Error("Failed message lost");
  mode = "network";
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByText(
      "Could not send your message. Please try again or email me directly.",
    )
    .waitFor();
  await page.waitForFunction(
    () => !document.querySelector('#contact button[type="submit"]').disabled,
  );
  if ((await message.inputValue()) !== "Keep this message.")
    throw new Error("Network-failed message lost");
  await page.unroute("**/api/contact");
  return { contact: "passed", mockedRequests: calls };
}
