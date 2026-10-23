import { projectPath } from "../portfolio/projects.mjs";

/** Public routes plus one entry per project page; empty without a public origin. */
export function sitemapEntries(portfolio, origin, lastModified) {
  if (!origin) return [];
  const projectPaths = [...portfolio.projects]
    .sort((left, right) => left.order - right.order)
    .map(projectPath);
  return [...portfolio.settings.site.publicRoutes, ...projectPaths].map(
    (path) => ({
      url: new URL(path, origin).href,
      ...(lastModified ? { lastModified } : {}),
    }),
  );
}
