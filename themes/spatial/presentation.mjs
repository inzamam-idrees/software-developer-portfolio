import { formatMonth } from "../../lib/portfolio/current-view.mjs";
import { projectDetailSections } from "../shared/project-detail.mjs";
import { buildSpatialGraph } from "./graph.mjs";
import { createSpatialView } from "./view.mjs";

export { projectDetailSections };

export function experiencePeriod(role, presentLabel) {
  const end = role.current ? presentLabel : formatMonth(role.endDate);
  return `${formatMonth(role.startDate)} – ${end}`;
}

function technologyEntry(graph, id) {
  const node = graph.nodes.find((candidate) => candidate.id === id);
  return { nodeId: node.id, label: node.label };
}

export function createSpatialPresentation(portfolio) {
  const view = createSpatialView(portfolio);
  const graph = buildSpatialGraph(view);
  const skillGroups = graph.nodes
    .filter((node) => node.kind === "category")
    .map((node) => {
      const category = view.skills.categories.find(
        (candidate) => candidate.id === node.categoryId,
      );
      return {
        id: category.id,
        label: category.label,
        title: category.title,
        summary: category.summary,
        technologies: graph.edges
          .filter(([source]) => source === node.id)
          .map(([, target]) => technologyEntry(graph, target)),
      };
    });
  const unmatchedTechnologies = graph.nodes
    .filter((node) => node.unmatched)
    .map((node) => ({ nodeId: node.id, label: node.label }));

  const experience = view.experience.map((role) => ({
    ...role,
    period: experiencePeriod(role, view.copy.home.experience.present),
  }));

  return Object.freeze({
    ...view,
    experience,
    graph,
    skillGroups,
    unmatchedTechnologies,
  });
}
