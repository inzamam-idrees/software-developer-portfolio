async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const names = await page.locator("#projects h3").allTextContents();
  if (names.join("|") !== "MIS / Nexis Project|Group Captain Project|Remmi CRM")
    throw new Error("Featured ordering/heading contract failed: " + names);
  for (const id of ["about", "skills", "experience", "education", "contact"])
    if ((await page.locator("#" + id).count()) !== 1)
      throw new Error("Missing chapter " + id);
  const levels = await page
    .locator("h1,h2,h3,h4")
    .evaluateAll((es) => es.map((e) => Number(e.tagName.slice(1))));
  if (
    levels.filter((n) => n === 1).length !== 1 ||
    levels.some((n, i) => i && n > levels[i - 1] + 1)
  )
    throw new Error("Invalid heading hierarchy");
  await page.goto(origin + "/project", { waitUntil: "domcontentloaded" });
  if ((await page.locator("article").count()) !== 8)
    throw new Error("Project index must retain all eight projects");
  for (const route of ["/project", "/blog"]) {
    await page.goto(origin + route, { waitUntil: "domcontentloaded" });
    const levels = await page
      .locator("h1,h2,h3,h4")
      .evaluateAll((es) => es.map((e) => Number(e.tagName.slice(1))));
    if (levels.some((n, i) => i && n > levels[i - 1] + 1))
      throw new Error(
        "Route heading hierarchy " + route + ": " + levels.join(","),
      );
  }
  if (await page.locator('a[href=""],a[href="undefined"]').count())
    throw new Error("Empty destinations");
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  return { content: "passed" };
}
