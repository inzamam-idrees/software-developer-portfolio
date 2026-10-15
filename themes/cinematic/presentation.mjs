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

export function createCinematicPresentation(portfolio) {
  const view = createCinematicView(portfolio);
  const nodesById = view.copy.project.diagram.nodes;
  return Object.freeze({
    ...view,
    featuredProjects: view.featuredProjects.map((project, index) => ({
      ...project,
      diagram: projectDiagram(project, index, nodesById),
    })),
  });
}
