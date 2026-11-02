import { projectDetailSections } from "../shared/project-detail.mjs";
import { createCinematicView } from "./view.mjs";

export { projectDetailSections };

export function projectDiagram(project, index, nodesById = {}) {
  return {
    mark: String(index + 1).padStart(2, "0"),
    nodes: nodesById[String(project.id)] ?? [],
    category: project.category ?? null,
  };
}

// Normalised skill keys (lowercase, alphanumerics only), in display priority order.
const PREFERRED_TECH = [
  "react", "nextjs", "nodejs", "python", "typescript", "angular", "aws",
  "docker", "mongodb", "postgresql", "figma", "laravel",
];
const skillKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Skills to feature as tiles: preferred skills that exist in the data, then the featured list. */
export function techHighlights(skills, limit = 10) {
  const byKey = new Map(skills.all.map((name) => [skillKey(name), name]));
  const picked = PREFERRED_TECH.filter((key) => byKey.has(key)).map((key) => byKey.get(key));
  for (const name of skills.featured) if (!picked.includes(name)) picked.push(name);
  return picked.slice(0, limit).map((name) => ({
    name,
    category: skills.categories.find((group) => group.technologies.includes(name))?.label ?? null,
  }));
}

/** Headline numbers derived from canonical data; nothing is hardcoded. */
export function createStats(profile, projectCount, skillCount, labels, companyCount = 0) {
  const years = profile.experienceLabel?.match(/\d+\+?/)?.[0];
  return [
    years && { value: years, label: labels.yearsLabel },
    projectCount > 0 && { value: String(projectCount), label: labels.projectsLabel },
    skillCount > 0 && { value: String(skillCount), label: labels.technologiesLabel },
    companyCount > 0 && { value: String(companyCount), label: labels.companiesLabel },
  ].filter(Boolean);
}

export function createCinematicPresentation(portfolio) {
  const view = createCinematicView(portfolio);
  const nodesById = view.copy.project.diagram.nodes;
  return Object.freeze({
    ...view,
    techTiles: techHighlights(view.skills),
    stats: createStats(
      view.profile,
      view.projects.length,
      view.skills.all.length,
      view.copy.home.hero.stats,
      new Set(view.experience.map((job) => job.company)).size,
    ),
    featuredProjects: view.featuredProjects.map((project, index) => ({
      ...project,
      diagram: projectDiagram(project, index, nodesById),
    })),
  });
}
