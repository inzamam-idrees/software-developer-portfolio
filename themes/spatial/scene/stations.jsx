"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import GraphModel from "./graph-model";
import { FIELD, LIGHT } from "./palette.mjs";
import ProjectRing from "./project-ring";
import { highlightSet, pickNode, sectionProgress } from "./rig.mjs";
import Spine, { SPINE_SPACING } from "./spine";
import Station, { slotElement } from "./station";

const NONE = new Set();
const PICK_RADIUS = 28;
const HERO_CAMERA = { fov: 35, position: [0, 7, 17], target: [0, 0, 0] };
const SKILLS_CAMERA = { fov: 40, position: [0, 17, 12], target: [0, -0.5, 0] };
const PROJECTS_CAMERA = { fov: 35, position: [0, 2.6, 10], target: [0, 0, 0] };

export function HeroStation({ graph, tier }) {
  return (
    <Station name="hero" camera={HERO_CAMERA}>
      <GraphModel
        graph={graph}
        palette={LIGHT}
        highlight={NONE}
        hidden={NONE}
        animate={tier === "full"}
        settled={tier !== "full"}
        idle
      />
    </Station>
  );
}

export function SkillsStation({ graph, compact, selectedId, related, onSelect }) {
  const group = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  const highlight = useMemo(() => highlightSet(graph, selectedId, related), [graph, selectedId, related]);
  // On phones only the selected technology's category opens; other technologies stay folded.
  const hidden = useMemo(() => {
    if (!compact) return NONE;
    return new Set(
      graph.nodes
        .filter((node) => node.kind === "technology" && !highlight.has(`category:${node.categoryId}`) && !highlight.has(node.id))
        .map((node) => node.id),
    );
  }, [graph, compact, highlight]);
  const camera = useMemo(() => {
    const perspective = new PerspectiveCamera(SKILLS_CAMERA.fov, 1, 0.1, 100);
    perspective.position.set(...SKILLS_CAMERA.position);
    perspective.lookAt(...SKILLS_CAMERA.target);
    return perspective;
  }, []);

  useEffect(() => invalidate(), [highlight, hidden, invalidate]);

  useEffect(() => {
    const slot = slotElement("skills");
    if (!slot) return undefined;
    const point = new Vector3();
    const pick = (event) => {
      const rect = slot.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      group.current?.updateMatrixWorld();
      const points = graph.nodes
        .filter((node) => node.kind === "technology" && !hidden.has(node.id))
        .map((node) => {
          point.set(...node.position);
          if (group.current) point.applyMatrix4(group.current.matrixWorld);
          point.project(camera);
          return { id: node.id, x: ((point.x + 1) / 2) * rect.width, y: ((1 - point.y) / 2) * rect.height };
        });
      const id = pickNode(points, event.clientX - rect.left, event.clientY - rect.top, PICK_RADIUS);
      if (id) onSelect(id === selectedId ? null : id);
    };
    slot.addEventListener("click", pick);
    return () => slot.removeEventListener("click", pick);
  }, [graph, hidden, camera, selectedId, onSelect]);

  return (
    <Station name="skills" camera={SKILLS_CAMERA}>
      <GraphModel
        graph={graph}
        palette={FIELD}
        highlight={highlight}
        hidden={hidden}
        animate={false}
        settled
        idle={false}
        groupRef={group}
      />
    </Station>
  );
}

export function ProjectsStation({ projects, focusedId, tier }) {
  return (
    <Station name="projects" camera={PROJECTS_CAMERA}>
      <ProjectRing projects={projects} focusedId={focusedId} animate={tier === "full"} />
    </Station>
  );
}

const EXPERIENCE_CAMERA = { fov: 38, position: [4.2, 2.2, 3.4], target: [0, 0, 0] };

export function ExperienceStation({ roles, tier, activeId }) {
  const dolly = useRef(0);
  const depth = (roles.length - 1) * SPINE_SPACING;

  const update = useCallback(
    (camera, delta) => {
      if (tier !== "full") {
        camera.position.set(6, 3.2, 3.5);
        camera.lookAt(0, 0, -depth / 2);
        return;
      }
      const section = document.getElementById("experience");
      const progress = section ? sectionProgress(section.getBoundingClientRect(), window.innerHeight) : 0;
      dolly.current += (progress * depth - dolly.current) * Math.min(1, Math.min(delta, 0.05) * 6);
      const [x, y, z] = EXPERIENCE_CAMERA.position;
      camera.position.set(x, y, z - dolly.current);
      camera.lookAt(0, 0, -dolly.current);
    },
    [tier, depth],
  );

  return (
    <Station name="experience" camera={EXPERIENCE_CAMERA} update={update}>
      <Spine roles={roles} activeId={activeId} />
    </Station>
  );
}
