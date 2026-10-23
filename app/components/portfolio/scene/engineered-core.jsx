"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Object3D } from "three";
import { getSceneProfile } from "../motion/scene-state.mjs";
const corners = [
  [-1, -1, -1],
  [-1, -1, 1],
  [-1, 1, -1],
  [-1, 1, 1],
  [1, -1, -1],
  [1, -1, 1],
  [1, 1, -1],
  [1, 1, 1],
];
const beams = [];
for (let axis = 0; axis < 3; axis++)
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      const p = [0, 0, 0];
      p[(axis + 1) % 3] = a;
      p[(axis + 2) % 3] = b;
      const size = [0.045, 0.045, 0.045];
      size[axis] = 2;
      beams.push({ position: p, size });
    }
function Frame({ scale = 1 }) {
  const instances = useRef(null);
  const scratch = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    beams.forEach((beam, index) => {
      scratch.position.set(...beam.position);
      scratch.scale.set(...beam.size);
      scratch.updateMatrix();
      instances.current.setMatrixAt(index, scratch.matrix);
    });
    instances.current.instanceMatrix.needsUpdate = true;
  }, [scratch]);
  return (
    <instancedMesh
      ref={instances}
      scale={scale}
      args={[undefined, undefined, beams.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#AEB8C1" metalness={0.75} roughness={0.26} />
    </instancedMesh>
  );
}
export default function EngineeredCore({
  stateRef,
  enabled,
  compact,
  software = false,
}) {
  const group = useRef(null),
    nodes = useRef(null),
    nodeGroup = useRef(null),
    idle = useRef(0);
  const size = useThree((state) => state.size);
  const narrow = !compact && size.width / size.height < 1.2;
  const scratch = useMemo(() => new Object3D(), []);
  const { particleCount } = getSceneProfile(compact, software);
  const positions = useMemo(() => {
    let seed = 47;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const result = new Float32Array(particleCount * 3);
    for (let i = 0; i < result.length; i++) result[i] = (random() - 0.5) * 9;
    return result;
  }, [particleCount]);
  useLayoutEffect(() => {
    corners.forEach((position, i) => {
      scratch.position.set(...position.map((v) => v * 1.4));
      scratch.updateMatrix();
      nodes.current.setMatrixAt(i, scratch.matrix);
    });
    nodes.current.instanceMatrix.needsUpdate = true;
  }, [scratch]);
  useFrame(({ pointer }, delta) => {
    const state = stateRef.current;
    if (enabled) idle.current += Math.min(delta, 0.05) * 0.08;
    else idle.current = 0;
    group.current.position.set(
      (compact ? 0 : narrow ? 1.1 : 2.4) + state.coreX,
      (compact ? -1.6 : 0.1) + state.coreY,
      0,
    );
    group.current.rotation.set(
      0.42 + state.rotationX + (enabled ? pointer.y * 0.025 : 0),
      0.6 + state.rotationY + idle.current,
      0.15,
    );
    group.current.scale.setScalar(
      state.coreScale * (compact ? 0.48 : narrow ? 0.55 : 1),
    );
    nodeGroup.current.scale.setScalar(1 + state.spread * 0.35);
  });
  return (
    <group ref={group}>
      <Frame />
      <group rotation={[0.3, 0.4, 0.5]}>
        <Frame scale={0.72} />
      </group>
      <mesh>
        <octahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial
          color="#283A35"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      {[
        [-0.4, 0.2, 0.1],
        [0.7, 0.5, 0.3],
      ].map((rotation, i) => (
        <mesh key={i} rotation={rotation}>
          <torusGeometry args={[1.85, 0.018, 6, compact ? 32 : 48]} />
          <meshStandardMaterial
            color={i ? "#59656F" : "#91E5C1"}
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}
      <group ref={nodeGroup}>
        <instancedMesh ref={nodes} args={[undefined, undefined, 8]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#91E5C1" />
        </instancedMesh>
      </group>
      <points visible={enabled}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#AEB8C1"
          size={compact ? 0.012 : 0.018}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
