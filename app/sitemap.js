import { getSiteOrigin } from "@/lib/site-origin.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export const dynamic = "force-dynamic";

// Production content only changes on redeploy, so the build time is the last change.
export default async function sitemap() {
  const origin = getSiteOrigin();
  const { settings } = await getCurrentPortfolioView();
  const lastModified = process.env.PORTFOLIO_BUILD_TIME;
  return origin
    ? settings.site.publicRoutes.map((path) => ({
        url: new URL(path, origin).href,
        ...(lastModified ? { lastModified } : {}),
      }))
    : [];
}
