"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { LIGHT } from "./palette.mjs";

export const SPINE_SPACING = 2.2;

// One plate per role along the depth axis, most recent first.
export default function Spine({ roles, activeId }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => invalidate(), [activeId, invalidate]);
  return (
    <group>
      {roles.map((role, index) => {
        const active = activeId === `role:${role.id}`;
        return (
          <mesh key={role.id} position={[0, 0, -index * SPINE_SPACING]}>
            <boxGeometry args={[1.8, 1.1, 0.05]} />
            <meshStandardMaterial color={active ? LIGHT.signal : LIGHT.node} roughness={0.85} flatShading />
          </mesh>
        );
      })}
      <mesh position={[-1, -0.65, (-(roles.length - 1) * SPINE_SPACING) / 2]}>
        <boxGeometry args={[0.04, 0.04, Math.max(0.04, (roles.length - 1) * SPINE_SPACING + 1)]} />
        <meshStandardMaterial color={LIGHT.minor} roughness={0.9} />
      </mesh>
    </group>
  );
}
