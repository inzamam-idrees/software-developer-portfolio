import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import {
  buildSpatialGraph,
  PLAN_VIEWBOX,
  planPoint,
  normalizeTechnology,
  relatedTo,
} from "../../themes/spatial/graph.mjs";

const portfolio = buildCurrentPortfolioView(
  await loadCanonicalPortfolio({ env: {} }),
);

function fixture() {
  return {
    skills: {
      all: ["React", "Tailwind CSS", "Node.js"],
      featured: ["React"],
      proficiency: { React: 5 },
      categories: [
        {
          id: "frontend",
          label: "Frontend",
          title: "Interfaces",
          summary: "Front",
          technologies: ["React", "Tailwind CSS"],
          order: 1,
        },
        {
          id: "backend",
          label: "Backend",
          title: "Services",
          summary: "Back",
          technologies: ["Node.js"],
          order: 2,
        },
      ],
    },
    projects: [
      { id: 2, title: "Two", technologies: ["React", "TailwindCSS", "react"], order: 1 },
      { id: 3, title: "Three", technologies: ["Node.js", "Custom Tool"], order: 2 },
    ],
    experience: [
      { id: 1, role: "Engineer", company: "Co", technologies: ["react"], order: 1 },
    ],
  };
}

test("normalizes case, whitespace and punctuation", () => {
  const tailwind = normalizeTechnology("Tailwind CSS");
  assert.equal(normalizeTechnology("TailwindCSS"), tailwind);
  assert.equal(normalizeTechnology("tailwind-css"), tailwind);
  assert.equal(normalizeTechnology("Next.js"), "nextjs");
  assert.notEqual(normalizeTechnology("Material"), normalizeTechnology("Material UI"));
});

test("dedupes normalized technologies and edges", () => {
  const graph = buildSpatialGraph(fixture());
  const reactNodes = graph.nodes.filter((node) => node.id === "tech:react");
  assert.equal(reactNodes.length, 1);
  assert.equal(reactNodes[0].label, "React");
  const keys = graph.edges.map((edge) => edge.join(">"));
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(keys.includes("tech:tailwindcss>project:2"));
});

test("links categories, technologies, projects and roles from canonical data", () => {
  const graph = buildSpatialGraph(portfolio);
  const ids = new Set(graph.nodes.map((node) => node.id));
  assert.equal(ids.size, graph.nodes.length);
  for (const category of portfolio.skills.categories) {
    assert.ok(ids.has(`category:${category.id}`), category.id);
  }
  for (const project of portfolio.projects) assert.ok(ids.has(`project:${project.id}`));
  for (const role of portfolio.experience) assert.ok(ids.has(`role:${role.id}`));
  for (const [source, target] of graph.edges) {
    assert.ok(ids.has(source), source);
    assert.ok(ids.has(target), target);
  }
});

test("flags unmatched technologies", () => {
  const graph = buildSpatialGraph(portfolio);
  const material = graph.nodes.find((node) => node.id === "tech:material");
  assert.equal(material.unmatched, true);
  assert.equal(material.categoryId, null);
  const angular = graph.nodes.find((node) => node.id === "tech:angular");
  assert.equal(angular.unmatched, false);
  assert.equal(angular.categoryId, "frontend");
});

test("layout is deterministic", () => {
  const first = buildSpatialGraph(portfolio);
  assert.deepEqual(buildSpatialGraph(portfolio), first);
  for (const node of first.nodes) {
    assert.equal(node.position.length, 3);
    assert.ok(node.position.every(Number.isFinite), node.id);
  }
});

test("relatedTo returns connected projects and roles", () => {
  const graph = buildSpatialGraph(fixture());
  const react = relatedTo(graph, "tech:react");
  assert.deepEqual(react.projects, ["project:2"]);
  assert.deepEqual(react.roles, ["role:1"]);
  const frontend = relatedTo(graph, "category:frontend");
  assert.deepEqual(frontend.projects, ["project:2"]);
  assert.deepEqual(frontend.roles, ["role:1"]);
  assert.deepEqual(frontend.technologies, ["tech:react", "tech:tailwindcss"]);
  assert.deepEqual(relatedTo(graph, "tech:missing").projects, []);
});

test("uses no proficiency data", () => {
  const withRatings = buildSpatialGraph(portfolio);
  const without = buildSpatialGraph({
    ...portfolio,
    skills: { ...portfolio.skills, proficiency: {} },
  });
  assert.deepEqual(without, withRatings);
});

test("plan projection keeps every node inside the plan viewBox", () => {
  const graph = buildSpatialGraph(portfolio);
  const [minX, minY, width, height] = PLAN_VIEWBOX;
  for (const node of graph.nodes) {
    const [x, y] = planPoint(node.position);
    assert.ok(x >= minX && x <= minX + width, `${node.id} x=${x}`);
    assert.ok(y >= minY && y <= minY + height, `${node.id} y=${y}`);
  }
  assert.deepEqual(planPoint([0, 0, 0]), [0, 0]);
  assert.ok(planPoint([0, 2.5, 0])[1] < 0, "higher nodes draw nearer the top");
});

test("normalization keeps C, C++ and C# apart and never yields an empty key", () => {
  const keys = ["C", "C++", "C#", ".NET", "NET"].map(normalizeTechnology);
  assert.equal(new Set(keys.slice(0, 3)).size, 3);
  assert.notEqual(normalizeTechnology("C++"), normalizeTechnology("C"));
  assert.ok(keys.every((key) => key.length > 0));
  assert.ok(normalizeTechnology("···").length > 0);
  assert.equal(normalizeTechnology("Tailwind CSS"), normalizeTechnology("TailwindCSS"));
});


test("keeps canonical skills unused by categories, projects, or roles selectable", () => {
  const data = fixture();
  data.skills.all.push("Python", "Agentic AI");
  const graph = buildSpatialGraph(data);
  for (const id of ["tech:python", "tech:agenticai"]) {
    const node = graph.nodes.find((candidate) => candidate.id === id);
    assert.ok(node, id);
    assert.equal(node.unmatched, true);
    assert.ok(node.position.every(Number.isFinite));
    assert.deepEqual(relatedTo(graph, id).technologies, [id]);
  }
});

test("keeps a shared technology in every canonical category", () => {
  const data = fixture();
  data.skills.categories[1].technologies.push("React");
  const graph = buildSpatialGraph(data);
  assert.equal(graph.nodes.filter((node) => node.id === "tech:react").length, 1);
  assert.ok(graph.edges.some(([source, target]) => source === "category:backend" && target === "tech:react"));
  assert.ok(relatedTo(graph, "category:backend").technologies.includes("tech:react"));
});
