import { projectDetailSections } from "../shared/project-detail.mjs";
import { createCinematicView } from "./view.mjs";

export { projectDetailSections };

// ── Conceptual diagram labels per project id ──
const projectDiagramNodes = Object.freeze({
  1: ["ASSETS", "LDAP", "AUDIT"],
  5: ["DOCUMENTS", "TASKS", "ROLES"],
  4: ["CONTACTS", "PROPERTY", "WORKFLOW"],
});

export function projectDiagram(project, index) {
  return {
    mark: String(index + 1).padStart(2, "0"),
    nodes: projectDiagramNodes[project.id] ?? [],
    category: project.category ?? null,
  };
}

export function createCinematicPresentation(portfolio) {
  const view = createCinematicView(portfolio);
  return Object.freeze({
    ...view,
    featuredProjects: view.featuredProjects.map((project, index) => ({
      ...project,
      diagram: projectDiagram(project, index),
    })),
  });
}
