async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const urls = await page
    .locator('meta[property="og:image"],meta[name="twitter:image"]')
    .evaluateAll((es) => es.map((e) => e.content));
  if (
    urls.some((url) => url.includes("localhost") || url.includes("127.0.0.1"))
  )
    throw new Error("Unconfigured social metadata leaks loopback origin");
  if (await page.locator("link[rel=canonical]").count())
    throw new Error("Unconfigured canonical");
  const person = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  if (person.url) throw new Error("Unconfigured Person URL");
  const image = await page.request.get(origin + "/social-image");
  if (
    image.status() !== 200 ||
    !image.headers()["content-type"].includes("image/png")
  )
    throw new Error("Local social image unavailable");
  return {
    metadata: "passed",
    canonical: "omitted",
    socialImage: "200",
    personURL: "omitted",
  };
}
