import { canonicalMetadata } from "@/lib/site-origin.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
export const metadata = canonicalMetadata("/");
export default async function Home() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeHome } = await loadSelectedThemeSlot(selection.theme, "home");
  return <ThemeHome portfolio={portfolio} />;
}
