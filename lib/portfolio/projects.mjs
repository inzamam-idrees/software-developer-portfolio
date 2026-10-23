import { formatCopy } from "./format-copy.mjs";

// ── Project routes ──
export function projectPath(project) {
  return `/project/${project.slug}`;
}

export function findProjectBySlug(projects, slug) {
  return projects.find((project) => project.slug === slug) ?? null;
}

/** Path, title and description of a project detail page, from canonical data only. */
export function projectPageInfo(settings, project) {
  return {
    path: projectPath(project),
    title: formatCopy(settings.copy.shared.routes.projectTitle, {
      project: project.title,
      siteName: settings.site.name,
    }),
    description: project.shortDescription,
  };
}
