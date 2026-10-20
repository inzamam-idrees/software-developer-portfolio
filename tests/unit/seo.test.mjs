import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { buildLlmsText } from "../../lib/seo/llms.mjs";
import { pageMetadata } from "../../lib/seo/metadata.mjs";
import {
  blogStructuredData,
  homeStructuredData,
  postalAddress,
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
  for (const project of portfolio.projects) assert.ok(text.includes(project.title));
  assert.ok(text.includes(portfolio.contact.email));
});
