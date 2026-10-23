"use client";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { readMotionPreference, writeMotionPreference } from "@/lib/motion/preferences.mjs";

const MotionContext = createContext({ enabled: false, reduced: false, ready: false });
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function useMotion() {
  return useContext(MotionContext);
}

function storage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export default function MotionProvider({ animationsEnabled, children }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [preference, setPreference] = useState("enabled");

  useEffect(() => {
    const media = window.matchMedia(REDUCED_QUERY);
    const update = () => setReduced(media.matches);
    update();
    setPreference(readMotionPreference(storage()));
    setReady(true);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const setEnabled = useCallback((enabled) => {
    writeMotionPreference(storage(), enabled);
    setPreference(enabled ? "enabled" : "paused");
  }, []);

  const value = useMemo(
    () => ({
      enabled: ready && animationsEnabled && !reduced && preference === "enabled",
      reduced,
      ready,
      preference,
      available: animationsEnabled,
      setEnabled,
    }),
    [ready, animationsEnabled, reduced, preference, setEnabled],
  );

  return (
    <MotionContext.Provider value={value}>
      <div className="spatial-motion-root" data-motion={value.enabled ? "enabled" : "paused"}>
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function MotionControl({ copy, placement }) {
  const { enabled, reduced, ready, available, setEnabled } = useMotion();
  const noteId = useId();
  if (!ready || !available) return null;
  return (
    <div className={`spatial-motion-control is-${placement}`}>
      <button
        type="button"
        className="spatial-motion-button"
        disabled={reduced}
        aria-describedby={reduced ? noteId : undefined}
        onClick={() => setEnabled(!enabled)}
      >
        {reduced ? copy.reduced : enabled ? copy.pause : copy.enable}
      </button>
      {reduced && (
        <span id={noteId} className="spatial-sr-only">
          {copy.systemNote}
        </span>
      )}
    </div>
  );
}
