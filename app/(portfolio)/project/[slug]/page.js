import { notFound } from "next/navigation";
import JsonLd from "@/app/components/seo/json-ld";
import { findProjectBySlug, projectPageInfo } from "@/lib/portfolio/projects.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { projectStructuredData } from "@/lib/seo/structured-data.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

export async function generateStaticParams() {
  const { projects } = await getCurrentPortfolioView();
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { settings, projects } = await getCurrentPortfolioView();
  const project = findProjectBySlug(projects, slug);
  if (!project) notFound();
  return pageMetadata(settings, projectPageInfo(settings, project));
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const { portfolio, selection } = await getPortfolioRenderContext();
  const project = findProjectBySlug(portfolio.projects, slug);
  if (!project) notFound();
  const { default: ThemeProject } = await loadSelectedThemeSlot(selection.theme, "project");
  return (
    <>
      <JsonLd
        data={projectStructuredData(
          portfolio,
          project,
          projectPageInfo(portfolio.settings, project),
        )}
      />
      <ThemeProject portfolio={portfolio} project={project} />
    </>
  );
}
