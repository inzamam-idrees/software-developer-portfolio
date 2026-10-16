"use client";
import { useEffect, useRef } from "react";
import { nearestToCenter } from "../scene/rig.mjs";
import { useSelection } from "./selection";

function entryId(target) {
  return target?.closest?.("[data-project-id]")?.getAttribute("data-project-id") ?? null;
}

// Tracks which featured project the visitor is reading, hovering, or focusing,
// so the project ring can turn it to the front.
export default function ProjectFocus({ className, children }) {
  const { focusProject } = useSelection();
  const list = useRef(null);

  useEffect(() => {
    const element = list.current;
    if (!element) return undefined;
    let frame = null;
    const update = () => {
      frame = null;
      const rects = [...element.querySelectorAll("[data-project-id]")].map((entry) => {
        const rect = entry.getBoundingClientRect();
        return { id: entry.getAttribute("data-project-id"), top: rect.top, height: rect.height };
      });
      const id = nearestToCenter(rects, window.innerHeight);
      if (id) focusProject(id);
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(schedule, { threshold: [0, 0.5, 1] });
    element.querySelectorAll("[data-project-id]").forEach((entry) => observer.observe(entry));
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [focusProject]);

  const onIntent = (event) => {
    const id = entryId(event.target);
    if (id) focusProject(id);
  };

  return (
    <div ref={list} className={className} onFocusCapture={onIntent} onPointerOver={onIntent}>
      {children}
    </div>
  );
}
