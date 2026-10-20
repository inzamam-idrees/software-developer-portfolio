import JsonLd from "@/app/components/seo/json-ld";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { projectsStructuredData } from "@/lib/seo/structured-data.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

function projectsPage(settings) {
  return {
    path: "/project",
    title: formatCopy(settings.copy.shared.routes.projectsTitle, {
      siteName: settings.site.name,
    }),
    description: settings.seo.pages.projects.description,
  };
}

export async function generateMetadata() {
  const { settings } = await getCurrentPortfolioView();
  return pageMetadata(settings, projectsPage(settings));
}

export default async function ProjectsPage() {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeProjects } = await loadSelectedThemeSlot(selection.theme, "projects");
  return (
    <>
      <JsonLd
        data={projectsStructuredData(portfolio, projectsPage(portfolio.settings))}
      />
      <ThemeProjects portfolio={portfolio} />
    </>
  );
}
