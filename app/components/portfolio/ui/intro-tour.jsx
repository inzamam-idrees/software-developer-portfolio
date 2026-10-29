"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiPlay, FiSquare } from "react-icons/fi";
import { STATION_IDS } from "../motion/journey.mjs";

const HOLD_MS = 2600;

/**
 * "Watch intro" plays the scroll-driven camera journey on its own: it scrolls
 * through each 3D station, pausing at every chapter. Any wheel, touch or key
 * input from the visitor stops it. With reduced motion it jumps one chapter.
 */
export default function IntroTour({ label, stopLabel }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = STATION_IDS.slice(1)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (reduced) {
      targets[0]?.scrollIntoView({ block: "start" });
      setPlaying(false);
      return undefined;
    }
    let step = 0;
    const next = () => {
      const target = targets[step++];
      if (!target) {
        setPlaying(false);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      timer.current = setTimeout(next, HOLD_MS);
    };
    next();
    const interrupt = () => stop();
    const options = { passive: true };
    window.addEventListener("wheel", interrupt, options);
    window.addEventListener("touchstart", interrupt, options);
    window.addEventListener("keydown", interrupt);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("wheel", interrupt, options);
      window.removeEventListener("touchstart", interrupt, options);
      window.removeEventListener("keydown", interrupt);
    };
  }, [playing, stop]);

  return (
    <button
      type="button"
      className="button secondary intro-button"
      aria-pressed={playing}
      onClick={() => (playing ? stop() : setPlaying(true))}
    >
      {playing ? stopLabel : label}
      {playing ? <FiSquare aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
    </button>
  );
}
