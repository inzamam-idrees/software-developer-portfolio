"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { COMPACT_QUERY, detectWebGL } from "@/lib/motion/capability.mjs";
import { decideSceneTier } from "@/lib/motion/tier.mjs";
import { nearestToCenter } from "../scene/rig.mjs";
import { useMotion } from "./motion";
import SceneBoundary from "./scene-boundary";
import { useSelection } from "./selection";

const SpatialCanvas = dynamic(() => import("../scene/canvas"), {
  ssr: false,
  loading: () => null,
});

function afterLoadAndIdle(callback) {
  let cancelled = false;
  let handle = null;
  const schedule = () => {
    if (cancelled) return;
    handle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(callback, { timeout: 2000 })
        : window.setTimeout(callback, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (handle === null) return;
    if ("cancelIdleCallback" in window) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}

export default function SpatialStage({ graph, featured, roles, features }) {
  const motion = useMotion();
  const selection = useSelection();
  const [activeRole, setActiveRole] = useState(null);
  const [capability, setCapability] = useState(null);
  const [compact, setCompact] = useState(false);
  const [lost, setLost] = useState(false);
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!features.threeD) {
      setCapability({ webgl2: false, software: false });
      return undefined;
    }
    setCapability(detectWebGL(document));
    const media = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [features.threeD]);

  const tier =
    !motion.ready || !capability
      ? null
      : lost
        ? "none"
        : decideSceneTier({
            threeD: features.threeD,
            animations: features.animations,
            webgl2: capability.webgl2,
            software: capability.software,
            reducedMotion: motion.reduced,
            preference: motion.preference,
          });

  useEffect(() => {
    if (tier === null) return undefined;
    if (tier === "none" || tier === "reduced") {
      setStatus("fallback");
      return undefined;
    }
    if (requested) return undefined;
    setStatus("loading");
    return afterLoadAndIdle(() => setRequested(true));
  }, [tier, requested]);

  // The role nearest the middle of the viewport lights its plate on the spine.
  useEffect(() => {
    if (status !== "ready") return undefined;
    let frame = null;
    const update = () => {
      frame = null;
      const rects = [...document.querySelectorAll("[data-role-id]")].map((element) => {
        const rect = element.getBoundingClientRect();
        return { id: element.getAttribute("data-role-id"), top: rect.top, height: rect.height };
      });
      setActiveRole(nearestToCenter(rects, window.innerHeight));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [status]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-spatial-scene", status === "ready" ? "ready" : "off");
    return () => root.removeAttribute("data-spatial-scene");
  }, [status]);

  const onReady = useCallback(() => setStatus("ready"), []);
  const onUnavailable = useCallback(() => {
    setLost(true);
    setStatus("fallback");
  }, []);

  return (
    <div
      className="spatial-stage"
      aria-hidden="true"
      data-scene-tier={tier ?? "pending"}
      data-scene-status={status}
      data-selected={selection.selectedId ?? ""}
      data-focused-project={selection.focusedProjectId ?? ""}
      data-active-role={activeRole ?? ""}
    >
      {requested && tier === "full" && (
        <SceneBoundary onUnavailable={onUnavailable}>
          <SpatialCanvas
            graph={graph}
            featured={featured}
            roles={roles}
            selection={selection}
            activeRole={activeRole}
            tier={tier}
            compact={compact}
            software={capability.software}
            onReady={onReady}
            onUnavailable={onUnavailable}
          />
        </SceneBoundary>
      )}
    </div>
  );
}
