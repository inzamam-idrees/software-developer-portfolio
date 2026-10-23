"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { LIGHT } from "./palette.mjs";
import { projectShape, ringTarget } from "./rig.mjs";

const RADIUS = 2.2;

function ProjectShape({ project }) {
  const { kind, segments } = projectShape(project);
  if (kind === "box") return <boxGeometry args={[0.6, 0.6, 0.6]} />;
  if (kind === "octahedron") return <octahedronGeometry args={[0.45, 0]} />;
  if (kind === "icosahedron") return <icosahedronGeometry args={[0.45, 0]} />;
  return <cylinderGeometry args={[0.38, 0.38, 0.6, segments]} />;
}

// Featured projects on a ring; the focused one turns to the front.
export default function ProjectRing({ projects, focusedId, animate }) {
  const group = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  const focusIndex = projects.findIndex((project) => `project:${project.id}` === focusedId);
  const target = useMemo(() => ringTarget(focusIndex, projects.length), [focusIndex, projects.length]);

  useEffect(() => {
    if (!animate && group.current) group.current.rotation.y = target;
    invalidate();
  }, [animate, target, invalidate]);

  useFrame((_, delta) => {
    if (!animate || !group.current) return;
    const gap = target - group.current.rotation.y;
    if (Math.abs(gap) < 0.001) return;
    group.current.rotation.y += gap * Math.min(1, Math.min(delta, 0.05) * 5);
  });

  return (
    <group ref={group}>
      {projects.map((project, index) => {
        const angle = (2 * Math.PI * index) / projects.length;
        const focused = index === Math.max(focusIndex, 0);
        return (
          <mesh
            key={project.id}
            position={[RADIUS * Math.sin(angle), 0, RADIUS * Math.cos(angle)]}
            rotation={[0.4, angle, 0]}
          >
            <ProjectShape project={project} />
            <meshStandardMaterial color={focused ? LIGHT.signal : LIGHT.node} roughness={0.85} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
