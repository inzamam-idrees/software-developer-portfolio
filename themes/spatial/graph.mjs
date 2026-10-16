const CATEGORY_RADIUS = 4;
const TECHNOLOGY_RADIUS = 1.2;
const OUTER_RADIUS = 7;
const OUTER_HEIGHT = 2.5;
const UNMATCHED_RADIUS = 1.5;

export function normalizeTechnology(name) {
  const lower = String(name).trim().toLowerCase();
  // "+" and "#" carry meaning (C, C++, C#), so they are spelled out before stripping.
  const key = lower
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "");
  return key || lower;
}

function byOrder(left, right) {
  return left.order - right.order;
}

function round(value) {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function ringPoint(index, count, radius, center = [0, 0, 0], height = 0) {
  const angle = count > 0 ? (2 * Math.PI * index) / count : 0;
  return [
    round(center[0] + radius * Math.cos(angle)),
    round(center[1] + height),
    round(center[2] + radius * Math.sin(angle)),
  ];
}

/**
 * Derives the Spatial system model from canonical skills, projects, and
 * experience. Placement is deterministic so server and client agree and
 * tests can compare builds. Proficiency is intentionally ignored.
 */
export function buildSpatialGraph({ skills, projects, experience }) {
  const categories = [...skills.categories].sort(byOrder);
  const spelling = new Map(
    skills.all.map((name) => [normalizeTechnology(name), name]),
  );
  const nodes = [];
  const technologies = new Map();
  const edges = new Map();

  function addEdge(source, target) {
    edges.set(`${source}>${target}`, [source, target]);
  }

  categories.forEach((category, index) => {
    const id = `category:${category.id}`;
    const center = ringPoint(index, categories.length, CATEGORY_RADIUS);
    nodes.push({
      id,
      kind: "category",
      label: category.title,
      categoryId: category.id,
      unmatched: false,
      position: center,
    });
    category.technologies.forEach((name, slot) => {
      const key = normalizeTechnology(name);
      if (technologies.has(key)) return;
      const node = {
        id: `tech:${key}`,
        kind: "technology",
        label: spelling.get(key) ?? name,
        categoryId: category.id,
        unmatched: false,
        position: ringPoint(
          slot,
          category.technologies.length,
          TECHNOLOGY_RADIUS,
          center,
          ((slot % 3) - 1) * 0.4,
        ),
      };
      technologies.set(key, node);
      nodes.push(node);
      addEdge(id, node.id);
    });
  });

  const unmatched = [];
  function technologyNode(name) {
    const key = normalizeTechnology(name);
    if (!technologies.has(key)) {
      const node = {
        id: `tech:${key}`,
        kind: "technology",
        label: spelling.get(key) ?? name,
        categoryId: null,
        unmatched: true,
        position: null,
      };
      technologies.set(key, node);
      unmatched.push(node);
    }
    return technologies.get(key);
  }

  const sortedProjects = [...projects].sort(byOrder);
  const sortedRoles = [...experience].sort(byOrder);
  for (const project of sortedProjects) {
    for (const name of project.technologies) {
      addEdge(technologyNode(name).id, `project:${project.id}`);
    }
  }
  for (const role of sortedRoles) {
    for (const name of role.technologies) {
      addEdge(technologyNode(name).id, `role:${role.id}`);
    }
  }

  unmatched.forEach((node, index) => {
    node.position = ringPoint(index, unmatched.length, UNMATCHED_RADIUS, [
      0,
      -OUTER_HEIGHT,
      0,
    ]);
    nodes.push(node);
  });
  sortedProjects.forEach((project, index) => {
    nodes.push({
      id: `project:${project.id}`,
      kind: "project",
      label: project.title,
      categoryId: null,
      unmatched: false,
      position: ringPoint(index, sortedProjects.length, OUTER_RADIUS, undefined, OUTER_HEIGHT),
    });
  });
  sortedRoles.forEach((role, index) => {
    nodes.push({
      id: `role:${role.id}`,
      kind: "role",
      label: role.role,
      categoryId: null,
      unmatched: false,
      position: ringPoint(index, sortedRoles.length, OUTER_RADIUS, undefined, -OUTER_HEIGHT),
    });
  });

  return { nodes, edges: [...edges.values()] };
}

function inNodeOrder(graph, ids) {
  const index = new Map(graph.nodes.map((node, position) => [node.id, position]));
  return [...ids]
    .filter((id) => index.has(id))
    .sort((left, right) => index.get(left) - index.get(right));
}

export function relatedTo(graph, nodeId) {
  const neighbours = (id) =>
    graph.edges.flatMap(([source, target]) =>
      source === id ? [target] : target === id ? [source] : [],
    );
  const kind = nodeId.slice(0, nodeId.indexOf(":"));
  const technologies = new Set();
  if (kind === "tech") technologies.add(nodeId);
  for (const id of neighbours(nodeId)) {
    if (id.startsWith("tech:")) technologies.add(id);
  }

  const reached = new Set();
  for (const technology of technologies) {
    for (const id of neighbours(technology)) reached.add(id);
  }
  if (kind === "project" || kind === "role") reached.delete(nodeId);

  return {
    technologies: inNodeOrder(graph, technologies),
    projects: inNodeOrder(graph, [...reached].filter((id) => id.startsWith("project:"))),
    roles: inNodeOrder(graph, [...reached].filter((id) => id.startsWith("role:"))),
  };
}

// ── Plan drawing (oblique projection for the server-rendered model) ──
export const PLAN_VIEWBOX = Object.freeze([-10, -6.5, 20, 13]);

export function planPoint([x, y, z]) {
  return [round(x + z * 0.35), round(z * 0.45 - y)];
}
