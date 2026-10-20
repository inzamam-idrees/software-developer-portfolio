import JsonLd from "@/app/components/seo/json-ld";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { homeStructuredData } from "@/lib/seo/structured-data.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

export async function generateMetadata() {
  const { settings } = await getCurrentPortfolioView();
  return pageMetadata(settings, { path: "/" });
}

export default async function Home() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeHome } = await loadSelectedThemeSlot(selection.theme, "home");
  return (
    <>
      <JsonLd data={homeStructuredData(portfolio)} />
      <ThemeHome portfolio={portfolio} />
    </>
  );
}
