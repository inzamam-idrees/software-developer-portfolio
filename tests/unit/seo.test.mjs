import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import {
  findProjectBySlug,
  projectPageInfo,
  projectPath,
} from "../../lib/portfolio/projects.mjs";
import { buildLlmsText } from "../../lib/seo/llms.mjs";
import { pageMetadata } from "../../lib/seo/metadata.mjs";
import { sitemapEntries } from "../../lib/seo/sitemap.mjs";
import {
  blogStructuredData,
  homeStructuredData,
  postalAddress,
  projectStructuredData,
  projectsStructuredData,
  serializeJsonLd,
} from "../../lib/seo/structured-data.mjs";

const origin = "https://portfolio.example.com";

async function view() {
  return buildCurrentPortfolioView(await loadCanonicalPortfolio({ env: {} }));
}

function byType(graph, type) {
  return graph["@graph"].find((node) => node["@type"] === type);
}

test("page metadata is complete and distinct per route", async () => {
  const { settings } = await view();
  const home = pageMetadata(settings, { path: "/" }, origin);
  const projects = pageMetadata(
    settings,
    { path: "/project", title: "Projects", description: "Project list" },
    origin,
  );

  assert.equal(home.alternates.canonical, `${origin}/`);
  assert.equal(home.openGraph.url, `${origin}/`);
  assert.equal(home.openGraph.type, "profile");
  assert.match(home.openGraph.locale, /^[a-z]{2}_[A-Z]{2}$/);
  assert.equal(home.openGraph.images[0].url, settings.seo.openGraph.imagePath);

  assert.equal(projects.alternates.canonical, `${origin}/project`);
  assert.equal(projects.openGraph.url, `${origin}/project`);
  assert.equal(projects.openGraph.title, "Projects");
  assert.equal(projects.description, "Project list");
  assert.equal(projects.twitter.description, "Project list");
  assert.notEqual(projects.description, home.description);
});

test("page metadata omits URLs and images without a site origin", async () => {
  const { settings } = await view();
  const metadata = pageMetadata(settings, { path: "/" }, null);
  assert.equal(metadata.alternates, undefined);
  assert.equal(metadata.metadataBase, undefined);
  assert.equal(metadata.openGraph.url, undefined);
  assert.equal(metadata.openGraph.images, undefined);
  assert.equal(metadata.twitter.images, undefined);

  const layout = pageMetadata(settings, { path: null }, origin);
  assert.equal(layout.alternates, undefined);
  assert.equal(layout.openGraph.url, undefined);
});

test("home graph links WebSite, ProfilePage and Person from canonical data", async () => {
  const portfolio = await view();
  const graph = homeStructuredData(portfolio, origin);
  const person = byType(graph, "Person");
  const page = byType(graph, "ProfilePage");

  assert.equal(graph["@context"], "https://schema.org");
  assert.ok(byType(graph, "WebSite"));
  assert.equal(page.mainEntity["@id"], person["@id"]);
  assert.equal(person.name, portfolio.profile.name);
  assert.equal(person.jobTitle, portfolio.profile.designation);
  assert.equal(person.image, `${origin}${portfolio.profile.image}`);
  assert.equal(person.address["@type"], "PostalAddress");
  assert.deepEqual(person.knowsAbout, portfolio.skills.all);
  assert.deepEqual(
    person.sameAs,
    Object.values(portfolio.social).filter(Boolean),
  );
  const current = portfolio.experience.find((item) => item.current);
  if (current) assert.equal(person.worksFor.name, current.company);
});

test("projects and blog graphs list every item", async () => {
  const portfolio = await view();
  const projects = projectsStructuredData(
    portfolio,
    { title: "Projects", description: "List" },
    origin,
  );
  const list = byType(projects, "CollectionPage").mainEntity;
  assert.equal(list.numberOfItems, portfolio.projects.length);
  assert.equal(list.itemListElement[0].position, 1);

  const articles = [
    {
      title: "An article",
      url: "https://dev.to/x/a",
      description: "",
      cover_image: null,
      published_at: "2025-01-01T00:00:00Z",
    },
  ];
  const blog = blogStructuredData(
    portfolio,
    articles,
    { title: "Blog", description: "List" },
    origin,
  );
  const post = byType(blog, "CollectionPage").mainEntity.itemListElement[0].item;
  assert.equal(post["@type"], "BlogPosting");
  assert.equal(post.headline, "An article");
  assert.equal(post.description, undefined);
  assert.equal(post.image, undefined);
});

test("postal addresses split city, region and country", () => {
  assert.deepEqual(postalAddress("Lahore, Punjab, Pakistan"), {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    addressCountry: "Pakistan",
  });
  assert.equal(postalAddress("Remote").addressLocality, "Remote");
});

test("JSON-LD serialization cannot close the script tag", () => {
  assert.doesNotMatch(serializeJsonLd({ name: "</script><b>" }), /<\//);
});

test("llms.txt is built from canonical content with absolute links", async () => {
  const portfolio = await view();
  const text = buildLlmsText(portfolio, origin);
  assert.ok(text.startsWith(`# ${portfolio.profile.name}\n`));
  assert.match(text, new RegExp(`\\(${origin}/project\\)`));
  for (const project of portfolio.projects) {
    assert.ok(text.includes(`[${project.title}](${origin}/project/${project.slug})`));
  }
  assert.ok(text.includes(portfolio.contact.email));
});

// ── Project detail pages ──
test("project pages get a unique title, description and canonical URL", async () => {
  const { settings, projects } = await view();
  const pages = projects.map((project) => projectPageInfo(settings, project));

  assert.equal(new Set(pages.map((page) => page.path)).size, projects.length);
  assert.equal(new Set(pages.map((page) => page.title)).size, projects.length);
  assert.equal(new Set(pages.map((page) => page.description)).size, projects.length);

  const [project] = projects;
  const page = projectPageInfo(settings, project);
  assert.equal(page.path, `/project/${project.slug}`);
  assert.ok(page.title.includes(project.title));
  assert.ok(page.title.includes(settings.site.name));
  assert.equal(page.description, project.shortDescription);

  const metadata = pageMetadata(settings, page, origin);
  assert.equal(metadata.title, page.title);
  assert.equal(metadata.description, project.shortDescription);
  assert.equal(metadata.alternates.canonical, `${origin}/project/${project.slug}`);
  assert.equal(metadata.openGraph.url, `${origin}/project/${project.slug}`);
  assert.equal(metadata.openGraph.title, page.title);
  assert.equal(metadata.twitter.description, project.shortDescription);
});

test("project slugs resolve to their project and unknown slugs to null", async () => {
  const { projects } = await view();
  for (const project of projects) {
    assert.equal(findProjectBySlug(projects, project.slug), project);
    assert.equal(projectPath(project), `/project/${project.slug}`);
  }
  assert.equal(findProjectBySlug(projects, "no-such-project"), null);
});

test("project graph describes the project as a CreativeWork by the Person", async () => {
  const portfolio = await view();
  const project = portfolio.projects.find((item) => item.links.demo);
  const page = projectPageInfo(portfolio.settings, project);
  const graph = projectStructuredData(portfolio, project, page, origin);
  const url = `${origin}/project/${project.slug}`;
  const webPage = byType(graph, "WebPage");
  const work = byType(graph, "CreativeWork");
  const person = byType(graph, "Person");

  assert.equal(graph["@context"], "https://schema.org");
  assert.ok(byType(graph, "WebSite"));
  assert.equal(webPage["@id"], `${url}#webpage`);
  assert.equal(webPage.url, url);
  assert.equal(webPage.name, page.title);
  assert.equal(webPage.mainEntity["@id"], work["@id"]);
  assert.equal(work["@id"], `${url}#project`);
  assert.equal(work.url, url);
  assert.equal(work.name, project.title);
  assert.equal(work.description, project.shortDescription);
  assert.equal(work.keywords, project.technologies.join(", "));
  assert.equal(work.creator["@id"], person["@id"]);
  assert.deepEqual(work.sameAs, [project.links.demo]);
  assert.equal(work.mainEntityOfPage["@id"], webPage["@id"]);
  assert.equal(work.isPartOf["@id"], `${origin}/project#webpage`);
});

test("project graph omits absent optional fields and absolute URLs without an origin", async () => {
  const portfolio = await view();
  const project = portfolio.projects.find((item) => !item.links.demo && !item.category);
  const graph = projectStructuredData(
    portfolio,
    project,
    projectPageInfo(portfolio.settings, project),
    null,
  );
  const work = byType(graph, "CreativeWork");
  assert.equal(work.url, undefined);
  assert.equal(work.genre, undefined);
  assert.equal(work.sameAs, undefined);
  assert.equal(work["@id"], `/project/${project.slug}#project`);
});

test("project collection items point at their detail pages", async () => {
  const portfolio = await view();
  const graph = projectsStructuredData(
    portfolio,
    { title: "Projects", description: "List" },
    origin,
  );
  const items = byType(graph, "CollectionPage").mainEntity.itemListElement;
  const ordered = [...portfolio.projects].sort((left, right) => left.order - right.order);
  assert.deepEqual(
    items.map(({ item }) => item.url),
    ordered.map((project) => `${origin}/project/${project.slug}`),
  );
});

test("sitemap lists public routes and every project page", async () => {
  const portfolio = await view();
  const entries = sitemapEntries(portfolio, origin, "2026-10-20T00:00:00Z");
  const urls = entries.map((entry) => entry.url);
  for (const path of portfolio.settings.site.publicRoutes) {
    assert.ok(urls.includes(new URL(path, origin).href));
  }
  for (const project of portfolio.projects) {
    assert.ok(urls.includes(`${origin}/project/${project.slug}`));
  }
  assert.equal(
    urls.length,
    portfolio.settings.site.publicRoutes.length + portfolio.projects.length,
  );
  assert.ok(entries.every((entry) => entry.lastModified === "2026-10-20T00:00:00Z"));
  assert.deepEqual(sitemapEntries(portfolio, null), []);
  assert.equal(sitemapEntries(portfolio, origin)[0].lastModified, undefined);
});
