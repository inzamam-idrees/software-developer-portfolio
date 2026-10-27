"use client";

import { useEffect, useState } from "react";
import { readMotionPreference, writeMotionPreference, MOTION_STORAGE_KEY } from "@/lib/motion/preferences.mjs";
import ExecutiveIcon from "./icon";

export default function ExecutiveMotionControl({ copy }) {
  const [paused, setPaused] = useState(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      let storage;
      try { storage = window.localStorage; } catch {}
      setPaused(readMotionPreference(storage) === "paused");
      setReduced(media.matches);
    };
    const onStorage = (event) => { if (event.key === MOTION_STORAGE_KEY || event.key === null) sync(); };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", onStorage);
    return () => { media.removeEventListener("change", sync); window.removeEventListener("storage", onStorage); };
  }, []);
  if (paused === null) return <span className="executive-motion-space" aria-hidden="true" />;
  if (reduced) return <span className="executive-motion-status" title={copy.reducedHelp}>{copy.reduced}</span>;
  const label = paused ? copy.resume : copy.pause;
  const toggle = () => {
    let storage;
    try { storage = window.localStorage; } catch {}
    writeMotionPreference(storage, paused);
    const next = !paused;
    setPaused(next);
    document.querySelector(".theme-executive")?.dispatchEvent(new CustomEvent("executive-motion-change", { detail: next }));
  };
  return <button className="executive-motion-control" type="button" onClick={toggle} aria-label={label} title={label}><ExecutiveIcon kind={paused ? "play" : "pause"} /><span>{paused ? copy.off : copy.on}</span></button>;
}
