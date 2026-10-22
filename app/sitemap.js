import { getSiteOrigin } from "@/lib/site-origin.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { sitemapEntries } from "@/lib/seo/sitemap.mjs";

export const dynamic = "force-dynamic";

// Production content only changes on redeploy, so the build time is the last change.
export default async function sitemap() {
  return sitemapEntries(
    await getCurrentPortfolioView(),
    getSiteOrigin(),
    process.env.PORTFOLIO_BUILD_TIME,
  );
}
