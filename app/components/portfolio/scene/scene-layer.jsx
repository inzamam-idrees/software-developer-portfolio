"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useMotion } from "../motion/motion-preferences";
import SceneBoundary from "./scene-boundary";
const CoreCanvas = dynamic(() => import("./core-canvas"), {
  ssr: false,
  loading: () => null,
});
export default function SceneLayer({ stateRef, onStatus }) {
  const { enabled, ready } = useMotion();
  const [available, setAvailable] = useState(false),
    [compact, setCompact] = useState(false),
    [software, setSoftware] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      setAvailable(Boolean(context));
      const debug = context?.getExtension("WEBGL_debug_renderer_info");
      const renderer = debug
        ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL)
        : "";
      setSoftware(/swiftshader|llvmpipe|software/i.test(renderer));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setAvailable(false);
    }
    return () => media.removeEventListener("change", update);
  }, []);
  const unavailable = useCallback(() => {
    setAvailable(false);
    onStatus("fallback");
  }, [onStatus]);
  const loaded = useCallback(() => onStatus("ready"), [onStatus]);
  if (!ready || !available) return null;
  return (
    <div
      className={`scene-layer ${enabled ? "" : "is-static"}`}
      aria-hidden="true"
    >
      <SceneBoundary onUnavailable={unavailable}>
        <CoreCanvas
          stateRef={stateRef}
          enabled={enabled}
          compact={compact}
          software={software}
          onReady={loaded}
          onUnavailable={unavailable}
        />
      </SceneBoundary>
    </div>
  );
}
