"use client";
import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { slotViewport } from "./rig.mjs";
import { StationRegistry, slotElement } from "./station";
import { ExperienceStation, HeroStation, ProjectsStation, SkillsStation } from "./stations";

function Lifecycle({ onReady, onUnavailable }) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const element = gl.domElement;
    const lost = (event) => {
      event.preventDefault();
      onUnavailable();
    };
    const refresh = () => invalidate();
    element.addEventListener("webglcontextlost", lost);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    document.addEventListener("visibilitychange", refresh);
    const ready = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => {
      element.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", refresh);
      cancelAnimationFrame(ready);
    };
  }, [gl, invalidate, onReady, onUnavailable]);
  return null;
}

// Renders every station whose slot is on screen into that slot's rectangle.
// Runs on demand; in the full tier it keeps requesting frames while a slot is
// visible and the tab is shown, so nothing renders off-screen or in the background.
function SlotRenderer({ registry, animate }) {
  const invalidate = useThree((state) => state.invalidate);

  useFrame((state, delta) => {
    const { gl, size } = state;
    gl.autoClear = false;
    gl.setScissorTest(false);
    // The fixed canvas overlays HTML: clear to transparent even between slots.
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true, true);
    gl.setScissorTest(true);
    let visible = false;
    for (const station of registry.current) {
      const slot = slotElement(station.name);
      if (!slot || slot.hasAttribute("data-station-failed")) continue;
      const viewport = slotViewport(slot.getBoundingClientRect(), size.height);
      if (!viewport.visible) continue;
      visible = true;
      station.update?.(station.camera, delta);
      station.camera.aspect = viewport.width / viewport.height;
      station.camera.updateProjectionMatrix();
      gl.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
      gl.setScissor(viewport.x, viewport.y, viewport.width, viewport.height);
      gl.render(station.scene, station.camera);
    }
    gl.setScissorTest(false);
    if (animate && visible && !document.hidden) invalidate();
  }, 1);

  return null;
}

export default function SpatialCanvas({
  graph,
  featured,
  roles,
  tier,
  compact,
  software,
  selection,
  onReady,
  onUnavailable,
  activeRole,
}) {
  const registry = useRef([]);
  const animate = tier === "full";

  return (
    <div className="spatial-canvas-host">
      <Canvas
        dpr={software ? 0.75 : [1, compact ? 1 : 1.5]}
        frameloop="demand"
        style={{ pointerEvents: "none" }}
        gl={{ alpha: true, antialias: !software && !compact, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-hidden", "true");
          gl.domElement.tabIndex = -1;
        }}
      >
        <Lifecycle onReady={onReady} onUnavailable={onUnavailable} />
        <StationRegistry registry={registry}>
          <HeroStation graph={graph} tier={tier} />
          <SkillsStation
            graph={graph}
            compact={compact}
            selectedId={selection.selectedId}
            related={selection.related}
            onSelect={selection.select}
          />
          {!compact && featured.length > 0 && (
            <ProjectsStation projects={featured} focusedId={selection.focusedProjectId} tier={tier} />
          )}
          {!compact && roles.length > 0 && (
            <ExperienceStation roles={roles} tier={tier} activeId={activeRole} />
          )}
        </StationRegistry>
        <SlotRenderer registry={registry} animate={animate} />
      </Canvas>
    </div>
  );
}
