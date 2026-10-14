import { getSiteOrigin } from "@/lib/site-origin.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const origin = getSiteOrigin();
  const { settings } = await getCurrentPortfolioView();
  return origin
    ? settings.site.publicRoutes.map((path) => ({
        url: new URL(path, origin).href,
      }))
    : [];
}
