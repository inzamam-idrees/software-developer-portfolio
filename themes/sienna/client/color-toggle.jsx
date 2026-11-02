"use client";

import { useEffect, useRef, useState } from "react";
import { COLOR_STORAGE_KEY } from "../color-script.mjs";

// ── Color mode toggle ──
// The pre-paint script has already applied the stored mode; this reads it back,
// switches with a View Transition where supported and persists the choice.
const SWITCH_MS = 350;

export default function ColorToggle({ label }) {
  const button = useRef(null);
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(button.current?.closest(".theme-sienna")?.getAttribute("data-mode") === "light");
  }, []);

  const toggle = () => {
    const root = button.current?.closest(".theme-sienna");
    if (!root) return;
    const next = root.getAttribute("data-mode") === "light" ? "dark" : "light";
    const apply = () => {
      root.setAttribute("data-mode", next);
      setLight(next === "light");
    };
    try { localStorage.setItem(COLOR_STORAGE_KEY, next); } catch {}
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still && typeof document.startViewTransition === "function") {
      document.startViewTransition(apply);
      return;
    }
    if (!still) {
      root.classList.add("sienna-switching");
      window.setTimeout(() => root.classList.remove("sienna-switching"), SWITCH_MS);
    }
    apply();
  };

  return <button ref={button} type="button" className="sienna-theme-btn" aria-label={label} aria-pressed={light} title={label} onClick={toggle}>
    <span className="sienna-theme-icon" />
  </button>;
}
