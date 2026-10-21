import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (file) => readFile(file, "utf8");

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}(`);
  assert.notEqual(start, -1, `${name} is missing`);
  const next = source.indexOf("\nexport ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

test("the root layout lets public routes render statically", async () => {
  const layout = await read("app/layout.js");
  assert.doesNotMatch(layout, /force-dynamic/);
  assert.doesNotMatch(layout, /admin\.scss/);
});

test("public render context never reads request cookies or admin state", async () => {
  const source = await read("lib/portfolio/render-context.mjs");
  const body = functionBody(source, "getPortfolioRenderContext");
  assert.doesNotMatch(body, /getAdminRequestState|cookies\(|headers\(|previewThemeId/);
});

test("public portfolio layout carries no preview branch", async () => {
  const layout = await read("app/(portfolio)/layout.js");
  assert.doesNotMatch(layout, /preview|getAdminRequestState|cookies/);
});

test("admin and preview routes stay dynamic and own the admin stylesheet", async () => {
  for (const file of ["app/admin/layout.js", "app/preview/[themeId]/layout.js"]) {
    const source = await read(file);
    assert.match(source, /export const dynamic = "force-dynamic"/, file);
    assert.match(source, /css\/admin\.scss/, file);
  }
});

test("the blog route revalidates on the same window as its dev.to fetch", async () => {
  const page = await read("app/(portfolio)/blog/page.js");
  const articles = await read("lib/articles.mjs");
  const pageWindow = page.match(/export const revalidate = (\d+);/)?.[1];
  const fetchWindow = articles.match(/revalidate: (\d+)/)?.[1];
  assert.ok(pageWindow, "blog page has no revalidate export");
  assert.equal(pageWindow, fetchWindow);
});

test("the cookie preview route no longer issues a preview cookie", async () => {
  const route = await read("app/admin/theme/preview/route.js");
  assert.doesNotMatch(route, /issueThemePreview|maxAge: 2 \* 60 \* 60/);
  assert.match(route, /previewPath\(theme\.id\)/);
});
