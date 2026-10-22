import { notFound } from "next/navigation";
import { findProjectBySlug } from "@/lib/portfolio/projects.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
import { requirePreview } from "../../preview-context";

export default async function PreviewProject({ params }) {
  const { portfolio, selection } = await requirePreview(params);
  const { slug } = await params;
  const project = findProjectBySlug(portfolio.projects, slug);
  if (!project) notFound();
  const { default: Slot } = await loadSelectedThemeSlot(selection.theme, "project");
  return <Slot portfolio={portfolio} project={project} />;
}
