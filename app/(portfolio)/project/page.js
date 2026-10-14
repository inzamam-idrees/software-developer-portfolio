import { canonicalMetadata } from "@/lib/site-origin.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

export async function generateMetadata() {
  const { portfolio } = await getPortfolioRenderContext();
  const { settings } = portfolio;
  return {
    ...canonicalMetadata("/project"),
    title: `Projects | ${settings.site.name}`,
  };
}

export default async function ProjectsPage() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeProjects } = await loadSelectedThemeSlot(selection.theme, "projects");
  return <ThemeProjects portfolio={portfolio} />;
}
