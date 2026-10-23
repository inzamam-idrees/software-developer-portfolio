const SHAPES = Object.freeze(["box", "octahedron", "icosahedron", "cylinder"]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// 0 when the section's top enters the bottom of the viewport, 1 when its
// bottom leaves the top.
export function sectionProgress({ top, height }, viewportHeight) {
  return clamp((viewportHeight - top) / (viewportHeight + height), 0, 1);
}

export function nearestToCenter(rects, viewportHeight) {
  const middle = viewportHeight / 2;
  let best = null;
  let distance = Infinity;
  for (const rect of rects) {
    if (rect.top + rect.height <= 0 || rect.top >= viewportHeight) continue;
    const gap = Math.abs(rect.top + rect.height / 2 - middle);
    if (gap < distance) {
      best = rect.id;
      distance = gap;
    }
  }
  return best;
}

export function slotViewport(rect, canvasHeight) {
  return {
    x: rect.left,
    y: canvasHeight - rect.bottom,
    width: rect.width,
    height: rect.height,
    visible: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < canvasHeight,
  };
}

export function ringTarget(focusIndex, count) {
  if (count <= 0 || focusIndex < 0) return 0;
  return focusIndex === 0 ? 0 : -(2 * Math.PI * focusIndex) / count;
}

function hash(text) {
  let value = 0;
  for (const character of String(text)) value = (value * 31 + character.charCodeAt(0)) >>> 0;
  return value;
}

export function projectShape(project) {
  return {
    kind: SHAPES[hash(project.category ?? project.title) % SHAPES.length],
    segments: clamp(project.technologies.length, 3, 12),
  };
}

export function pickNode(points, x, y, radius) {
  let best = null;
  let distance = radius;
  for (const point of points) {
    const gap = Math.hypot(point.x - x, point.y - y);
    if (gap <= distance) {
      best = point.id;
      distance = gap;
    }
  }
  return best;
}

export function highlightSet(graph, selectedId, related) {
  if (!selectedId || !related) return new Set();
  const ids = new Set([selectedId, ...related.technologies, ...related.projects, ...related.roles]);
  for (const node of graph.nodes) {
    if (ids.has(node.id) && node.kind === "technology" && node.categoryId) {
      ids.add(`category:${node.categoryId}`);
    }
  }
  return ids;
}
