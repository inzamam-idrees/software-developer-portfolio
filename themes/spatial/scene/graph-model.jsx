"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Object3D } from "three";

const ASSEMBLY_SECONDS = 1.6;
const IDLE_SPEED = 0.05;
const START_SCALE = 0.08;

function NodeGeometry({ kind }) {
  if (kind === "category") return <boxGeometry args={[0.36, 0.36, 0.36]} />;
  if (kind === "technology") return <icosahedronGeometry args={[0.1, 0]} />;
  if (kind === "project") return <octahedronGeometry args={[0.28, 0]} />;
  return <boxGeometry args={[0.24, 0.24, 0.24]} />;
}

function easeOut(value) {
  return 1 - (1 - value) ** 3;
}

function nodeColor(node, palette, highlight) {
  if (highlight.size) return highlight.has(node.id) ? palette.signal : palette.dim;
  return node.kind === "technology" ? palette.minor : palette.node;
}

function Nodes({ kind, nodes, palette, highlight, hidden, progress }) {
  const mesh = useRef(null);
  const scratch = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    nodes.forEach((node, index) => {
      mesh.current.setColorAt(index, color.set(nodeColor(node, palette, highlight)));
    });
    mesh.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [nodes, palette, highlight, color, invalidate]);

  useFrame(() => {
    if (!mesh.current) return;
    const amount = START_SCALE + (1 - START_SCALE) * easeOut(progress.current);
    nodes.forEach((node, index) => {
      const [x, y, z] = node.position;
      scratch.position.set(x * amount, y * amount, z * amount);
      scratch.rotation.set(0, kind === "role" ? Math.PI / 4 : 0, kind === "role" ? Math.PI / 4 : 0);
      scratch.scale.setScalar(hidden.has(node.id) ? 0 : highlight.has(node.id) ? 1.35 : 1);
      scratch.updateMatrix();
      mesh.current.setMatrixAt(index, scratch.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, nodes.length]}>
      <NodeGeometry kind={kind} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.85} metalness={0.05} flatShading />
    </instancedMesh>
  );
}

function Lines({ segments, color, opacity, progress }) {
  const geometry = useRef(null);
  const material = useRef(null);
  const positions = useMemo(() => new Float32Array(segments.length), [segments]);

  useFrame(() => {
    if (!geometry.current) return;
    const amount = START_SCALE + (1 - START_SCALE) * easeOut(progress.current);
    for (let index = 0; index < segments.length; index++) positions[index] = segments[index] * amount;
    geometry.current.attributes.position.needsUpdate = true;
    material.current.opacity = opacity * progress.current;
  });

  if (!segments.length) return null;
  return (
    <lineSegments>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial ref={material} color={color} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
}

/**
 * The system model: one instanced mesh per node kind plus two line sets
 * (all links, and the highlighted path). Used by the hero and skills stations.
 */
export default function GraphModel({ graph, palette, highlight, hidden, animate, settled, idle, groupRef }) {
  const ownGroup = useRef(null);
  const group = groupRef ?? ownGroup;
  const progress = useRef(settled ? 1 : 0);
  const invalidate = useThree((state) => state.invalidate);

  const byKind = useMemo(() => {
    const groups = { category: [], technology: [], project: [], role: [] };
    for (const node of graph.nodes) groups[node.kind].push(node);
    return Object.entries(groups).filter(([, nodes]) => nodes.length > 0);
  }, [graph]);

  const [base, path] = useMemo(() => {
    const points = new Map(graph.nodes.map((node) => [node.id, node.position]));
    const all = [];
    const marked = [];
    for (const [source, target] of graph.edges) {
      if (hidden.has(source) || hidden.has(target)) continue;
      const pair = [...points.get(source), ...points.get(target)];
      (highlight.has(source) && highlight.has(target) ? marked : all).push(...pair);
    }
    return [Float32Array.from(all), Float32Array.from(marked)];
  }, [graph, highlight, hidden]);

  useLayoutEffect(() => {
    if (settled) progress.current = 1;
    invalidate();
  }, [settled, invalidate]);

  useFrame((_, delta) => {
    if (!animate) return;
    const step = Math.min(delta, 0.05);
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + step / ASSEMBLY_SECONDS);
    } else if (idle) {
      group.current.rotation.y += step * IDLE_SPEED;
    }
  });

  return (
    <group ref={group} rotation={[0, -0.35, 0]}>
      <Lines segments={base} color={palette.edge} opacity={highlight.size ? 0.08 : 0.2} progress={progress} />
      <Lines segments={path} color={palette.signal} opacity={0.9} progress={progress} />
      {byKind.map(([kind, nodes]) => (
        <Nodes
          key={kind}
          kind={kind}
          nodes={nodes}
          palette={palette}
          highlight={highlight}
          hidden={hidden}
          progress={progress}
        />
      ))}
    </group>
  );
}
