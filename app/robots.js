import { getSiteOrigin } from "@/lib/site-origin.mjs";

// Search and AI crawlers are allowed; private and machine-only paths are not.
export default function robots() {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/preview"],
    },
    ...(origin ? { sitemap: `${origin}/sitemap.xml`, host: origin } : {}),
  };
}
