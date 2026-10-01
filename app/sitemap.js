import { getSiteOrigin } from "@/lib/site-origin.mjs";
export default function sitemap() {
  const origin = getSiteOrigin();
  return origin
    ? ["/", "/project", "/blog"].map((path) => ({
        url: new URL(path, origin).href,
      }))
    : [];
}
