import { projectPath } from "../portfolio/projects.mjs";
import { getSiteOrigin } from "../site-origin.mjs";

// ── Helpers ──
const SCHEMA_CONTEXT = "https://schema.org";

function absolute(path, origin) {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return origin ? new URL(path, origin).href : undefined;
}

function nodeId(origin, path, fragment) {
  return `${origin ? new URL(path, origin).href : path}#${fragment}`;
}

function compact(object) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

/** Splits "City, Region, Country" into a PostalAddress; fewer parts stay in addressLocality. */
export function postalAddress(location) {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      "@type": "PostalAddress",
      addressLocality: parts[0],
      addressRegion: parts.slice(1, -1).join(", "),
      addressCountry: parts.at(-1),
    };
  }
  if (parts.length === 2) {
    return {
      "@type": "PostalAddress",
      addressLocality: parts[0],
      addressCountry: parts[1],
    };
  }
  return { "@type": "PostalAddress", addressLocality: location };
}

// ── Nodes ──
function websiteNode(portfolio, origin) {
  const { settings } = portfolio;
  return compact({
    "@type": "WebSite",
    "@id": nodeId(origin, "/", "website"),
    url: origin ? new URL("/", origin).href : undefined,
    name: settings.seo.openGraph.siteName,
    description: settings.seo.description,
    inLanguage: settings.site.locale,
    publisher: { "@id": nodeId(origin, "/", "person") },
  });
}

export function personNode(portfolio, origin) {
  const { profile, about, social, contact, experience, education, skills } =
    portfolio;
  const current = experience.find((item) => item.current);
  return compact({
    "@type": "Person",
    "@id": nodeId(origin, "/", "person"),
    name: profile.name,
    url: origin ? new URL("/", origin).href : undefined,
    image: absolute(profile.image, origin),
    jobTitle: profile.designation,
    description: about.personalStatement,
    email: contact.email ? `mailto:${contact.email}` : undefined,
    address: postalAddress(profile.location),
    worksFor: current
      ? { "@type": "Organization", name: current.company }
      : undefined,
    alumniOf: [...new Set(education.map((item) => item.institution))].map(
      (name) => ({ "@type": "EducationalOrganization", name }),
    ),
    knowsAbout: skills.all,
    sameAs: Object.values(social).filter(Boolean),
  });
}

function pageNode(type, portfolio, origin, path, name, description) {
  return compact({
    "@type": type,
    "@id": nodeId(origin, path, "webpage"),
    url: origin ? new URL(path, origin).href : undefined,
    name,
    description,
    inLanguage: portfolio.settings.site.locale,
    isPartOf: { "@id": nodeId(origin, "/", "website") },
    ...(process.env.PORTFOLIO_BUILD_TIME
      ? { dateModified: process.env.PORTFOLIO_BUILD_TIME }
      : {}),
  });
}

function creativeWorkNode(project, origin) {
  const path = projectPath(project);
  return compact({
    "@type": "CreativeWork",
    "@id": nodeId(origin, path, "project"),
    name: project.title,
    description: project.shortDescription,
    abstract: project.longDescription ?? undefined,
    url: origin ? new URL(path, origin).href : undefined,
    image: absolute(project.image, origin),
    genre: project.category ?? undefined,
    keywords: project.technologies.join(", "),
    creator: { "@id": nodeId(origin, "/", "person") },
    sameAs: [project.links?.demo, project.links?.source].filter(Boolean),
  });
}

// ── Route graphs ──
export function homeStructuredData(portfolio, origin = getSiteOrigin()) {
  const { seo } = portfolio.settings;
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      websiteNode(portfolio, origin),
      {
        ...pageNode("ProfilePage", portfolio, origin, "/", seo.title, seo.description),
        mainEntity: { "@id": nodeId(origin, "/", "person") },
      },
      personNode(portfolio, origin),
    ],
  };
}

export function projectsStructuredData(
  portfolio,
  { title, description },
  origin = getSiteOrigin(),
) {
  const author = { "@id": nodeId(origin, "/", "person") };
  const projects = [...portfolio.projects].sort(
    (left, right) => left.order - right.order,
  );
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      websiteNode(portfolio, origin),
      {
        ...pageNode("CollectionPage", portfolio, origin, "/project", title, description),
        about: author,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: creativeWorkNode(project, origin),
          })),
        },
      },
      personNode(portfolio, origin),
    ],
  };
}

export function projectStructuredData(
  portfolio,
  project,
  { path, title, description },
  origin = getSiteOrigin(),
) {
  const work = creativeWorkNode(project, origin);
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      websiteNode(portfolio, origin),
      {
        ...pageNode("WebPage", portfolio, origin, path, title, description),
        mainEntity: { "@id": work["@id"] },
      },
      {
        ...work,
        mainEntityOfPage: { "@id": nodeId(origin, path, "webpage") },
        isPartOf: { "@id": nodeId(origin, "/project", "webpage") },
      },
      personNode(portfolio, origin),
    ],
  };
}

export function blogStructuredData(
  portfolio,
  articles,
  { title, description },
  origin = getSiteOrigin(),
) {
  const author = { "@id": nodeId(origin, "/", "person") };
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      websiteNode(portfolio, origin),
      {
        ...pageNode("CollectionPage", portfolio, origin, "/blog", title, description),
        about: author,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: articles.length,
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: compact({
              "@type": "BlogPosting",
              headline: article.title,
              description: article.description || undefined,
              url: article.url,
              image: article.cover_image ?? undefined,
              datePublished: article.published_at ?? undefined,
              author,
            }),
          })),
        },
      },
      personNode(portfolio, origin),
    ],
  };
}

/** Serializes JSON-LD for a <script> tag without allowing `</script>` breakouts. */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
