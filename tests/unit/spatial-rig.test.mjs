import assert from "node:assert/strict";
import test from "node:test";
import { buildSpatialGraph, relatedTo } from "../../themes/spatial/graph.mjs";
import {
  highlightSet,
  nearestToCenter,
  pickNode,
  projectShape,
  ringTarget,
  sectionProgress,
  slotViewport,
} from "../../themes/spatial/scene/rig.mjs";

test("sectionProgress runs from 0 entering to 1 leaving and clamps", () => {
  assert.equal(sectionProgress({ top: 900, height: 600 }, 900), 0);
  assert.equal(sectionProgress({ top: -600, height: 600 }, 900), 1);
  assert.equal(sectionProgress({ top: 2000, height: 600 }, 900), 0);
  assert.equal(sectionProgress({ top: -5000, height: 600 }, 900), 1);
  assert.equal(sectionProgress({ top: 150, height: 600 }, 900), 0.5);
});

test("nearestToCenter picks the visible element closest to the viewport middle", () => {
  const rects = [
    { id: "role:1", top: -400, height: 300 },
    { id: "role:2", top: 300, height: 200 },
    { id: "role:3", top: 700, height: 300 },
  ];
  assert.equal(nearestToCenter(rects, 900), "role:2");
  assert.equal(nearestToCenter([{ id: "a", top: 1200, height: 100 }], 900), null);
  assert.equal(nearestToCenter([], 900), null);
});

test("slotViewport converts a DOM rect to a bottom-left GL viewport", () => {
  assert.deepEqual(slotViewport({ left: 10, top: 100, width: 300, height: 200, bottom: 300 }, 900), {
    x: 10,
    y: 600,
    width: 300,
    height: 200,
    visible: true,
  });
  assert.equal(slotViewport({ left: 0, top: 950, width: 300, height: 200, bottom: 1150 }, 900).visible, false);
  assert.equal(slotViewport({ left: 0, top: -300, width: 300, height: 200, bottom: -100 }, 900).visible, false);
  assert.equal(slotViewport({ left: 0, top: 0, width: 0, height: 0, bottom: 0 }, 900).visible, false);
});

test("ringTarget turns the focused project to the front", () => {
  assert.equal(ringTarget(0, 4), 0);
  assert.equal(ringTarget(1, 4), -Math.PI / 2);
  assert.equal(ringTarget(-1, 4), 0);
  assert.equal(ringTarget(0, 0), 0);
});

test("projectShape is deterministic and bounded by technology count", () => {
  const project = { category: "Enterprise systems", title: "A", technologies: ["a", "b"] };
  assert.deepEqual(projectShape(project), projectShape({ ...project }));
  assert.ok(["box", "octahedron", "icosahedron", "cylinder"].includes(projectShape(project).kind));
  assert.equal(projectShape(project).segments, 3);
  assert.equal(projectShape({ ...project, technologies: Array.from({ length: 20 }, (_, i) => `t${i}`) }).segments, 12);
  assert.ok(projectShape({ category: null, title: "Untitled", technologies: ["x"] }).kind);
});

test("pickNode returns the nearest point within the radius", () => {
  const points = [
    { id: "tech:a", x: 10, y: 10 },
    { id: "tech:b", x: 40, y: 10 },
  ];
  assert.equal(pickNode(points, 12, 12, 20), "tech:a");
  assert.equal(pickNode(points, 36, 9, 20), "tech:b");
  assert.equal(pickNode(points, 200, 200, 20), null);
});

test("highlightSet covers the selection, its relations and their categories", () => {
  const graph = buildSpatialGraph({
    skills: {
      all: ["React"],
      categories: [{ id: "frontend", title: "F", technologies: ["React"], order: 1 }],
    },
    projects: [{ id: 1, title: "P", technologies: ["React"], order: 1 }],
    experience: [{ id: 2, role: "R", technologies: ["React"], order: 1 }],
  });
  const set = highlightSet(graph, "tech:react", relatedTo(graph, "tech:react"));
  assert.deepEqual([...set].sort(), ["category:frontend", "project:1", "role:2", "tech:react"]);
  assert.equal(highlightSet(graph, null, null).size, 0);
});
