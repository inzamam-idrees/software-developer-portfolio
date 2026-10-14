import { canonicalMetadata } from "@/lib/site-origin.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
export async function generateMetadata() {
  const { portfolio } = await getPortfolioRenderContext();
  const { settings } = portfolio;
  return {
    ...canonicalMetadata("/blog"),
    title: `Writing | ${settings.site.name}`,
  };
}
export default async function BlogPage() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeBlog } = await loadSelectedThemeSlot(selection.theme, "blog");
  return <ThemeBlog portfolio={portfolio} />;
}
