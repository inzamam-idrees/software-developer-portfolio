import { getSiteOrigin } from "../site-origin.mjs";

/**
 * Full page metadata for a public route. Next.js replaces (not merges) nested
 * `openGraph` / `twitter` objects, so every route builds the complete set.
 * URLs and images are only emitted when SITE_URL is a valid public origin;
 * a null `path` (root layout defaults) omits the canonical and og:url.
 */
export function pageMetadata(
  settings,
  { path, title, description },
  origin = getSiteOrigin(),
) {
  const { seo } = settings;
  const url = origin && path ? new URL(path, origin).href : null;
  const pageTitle = title ?? seo.title;
  const pageDescription = description ?? seo.description;
  const isHome = !path || path === "/";
  const socialTitle = isHome ? seo.openGraph.title : pageTitle;
  const socialDescription = isHome
    ? seo.openGraph.description
    : pageDescription;

  return {
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    title: pageTitle,
    description: pageDescription,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: path === "/" ? "profile" : "website",
      ...(url ? { url } : {}),
      siteName: seo.openGraph.siteName,
      locale: seo.openGraph.locale,
      title: socialTitle,
      description: socialDescription,
      ...(origin
        ? {
            images: [
              {
                url: seo.openGraph.imagePath,
                width: 1200,
                height: 630,
                alt: seo.openGraph.imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: seo.twitter.card,
      title: isHome ? seo.twitter.title : pageTitle,
      description: isHome ? seo.twitter.description : pageDescription,
      ...(origin ? { images: [seo.twitter.imagePath] } : {}),
    },
  };
}
