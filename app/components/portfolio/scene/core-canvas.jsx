"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Fog, MathUtils } from "three";
import { cameraPose } from "../motion/journey.mjs";
import { getSceneProfile } from "../motion/scene-state.mjs";
import { createResources, disposeResources, PALETTE } from "./resources";
import {
  AboutStation,
  ContactStation,
  ExperienceStation,
  HeroStation,
  Particles,
  ProjectsStation,
  SceneContext,
  SkillsStation,
} from "./stations";

// ── Camera rig ──
function Rig({ stateRef, enabled, compact, pointerRef, timeRef, onReady, onUnavailable }) {
  const { gl, camera, scene, invalidate } = useThree();
  const announced = useRef(false);
  const raf = useRef(null);
  const look = useMemo(() => ({ x: 0, y: 0, z: 0 }), []);

  useEffect(() => {
    scene.fog = new Fog(PALETTE.obsidian, 16, 44);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useEffect(() => {
    const element = gl.domElement;
    const lost = (event) => {
      event.preventDefault();
      onUnavailable();
    };
    element.addEventListener("webglcontextlost", lost);
    return () => {
      element.removeEventListener("webglcontextlost", lost);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [gl, onUnavailable]);

  useEffect(() => {
    invalidate();
  }, [enabled, invalidate]);

  useFrame(({ pointer }, delta) => {
    const dt = Math.min(delta, 0.05);
    if (enabled) timeRef.current += dt;
    const parallax = enabled && !compact;
    pointerRef.current.x = MathUtils.damp(pointerRef.current.x, parallax ? pointer.x : 0, 3, dt);
    pointerRef.current.y = MathUtils.damp(pointerRef.current.y, parallax ? pointer.y : 0, 3, dt);

    const state = stateRef.current;
    state.focus = MathUtils.damp(state.focus, state.projectFocus, 4, dt);
    const { position, target } = cameraPose(state.journey, compact);
    camera.position.set(
      position[0] + pointerRef.current.x * 0.45,
      position[1] + pointerRef.current.y * 0.3,
      position[2],
    );
    look.x = target[0];
    look.y = target[1];
    look.z = target[2];
    camera.lookAt(look.x, look.y, look.z);
    gl.domElement.style.opacity = String(state.opacity);
    if (!announced.current) {
      announced.current = true;
      raf.current = requestAnimationFrame(onReady);
    }
  });
  return null;
}

// ── Canvas ──
function readCounts(stateRef) {
  if (typeof document === "undefined") return;
  const projects = document.querySelectorAll("[data-project-screen]").length;
  const jobs = document.querySelectorAll("[data-career-step]").length;
  if (projects) stateRef.current.projectCount = projects;
  if (jobs) stateRef.current.pathCount = jobs;
}

export default function CoreCanvas({
  stateRef,
  enabled,
  compact,
  software = false,
  onReady,
  onUnavailable,
}) {
  const [hidden, setHidden] = useState(false);
  const profile = useMemo(() => getSceneProfile(compact, software), [compact, software]);
  const resources = useMemo(() => createResources(profile), [profile]);
  const timeRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const context = useMemo(() => {
    readCounts(stateRef);
    return {
      stateRef,
      resources,
      profile,
      compact,
      enabled: enabled && !hidden,
      timeRef,
      pointerRef,
    };
  }, [stateRef, resources, profile, compact, enabled, hidden]);

  useEffect(() => () => disposeResources(resources), [resources]);

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      tabIndex={-1}
      dpr={[software ? 0.75 : 1, profile.maxDpr]}
      frameloop={enabled && !hidden ? "always" : "demand"}
      camera={{ position: [0, 0, 9.5], fov: 38, near: 0.1, far: 80 }}
      gl={{
        alpha: true,
        antialias: !compact && !software,
        powerPreference: "high-performance",
      }}
      eventSource={typeof document !== "undefined" ? document.documentElement : undefined}
      eventPrefix="client"
    >
      <SceneContext.Provider value={context}>
        <ambientLight intensity={0.55} color={PALETTE.steel} />
        <directionalLight position={[4, 6, 5]} intensity={3} color={PALETTE.ice} />
        <pointLight position={[-4, 1, 4]} intensity={30} color={PALETTE.teal} />
        <pointLight position={[5, -2, 3]} intensity={18} color={PALETTE.cyan} />
        <Rig
          stateRef={stateRef}
          enabled={enabled && !hidden}
          compact={compact}
          pointerRef={context.pointerRef}
          timeRef={context.timeRef}
          onReady={onReady}
          onUnavailable={onUnavailable}
        />
        <HeroStation />
        <AboutStation />
        <SkillsStation />
        <ProjectsStation />
        <ExperienceStation />
        <ContactStation />
        <Particles />
      </SceneContext.Provider>
    </Canvas>
  );
}
