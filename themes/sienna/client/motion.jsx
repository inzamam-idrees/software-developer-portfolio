"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// ── Constants ──
const COUNT_MS = 1200;
const REVEAL = "[data-reveal]:not(.is-visible)";
const COUNTER = "[data-count]:not([data-counted])";

const easeOut = (t) => 1 - (1 - t) ** 3;

function countUp(node) {
  node.setAttribute("data-counted", "");
  const target = Number(node.getAttribute("data-count"));
  if (!Number.isFinite(target) || target <= 0) return;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / COUNT_MS);
    node.textContent = String(Math.round(target * easeOut(t)));
    if (t < 1) requestAnimationFrame(step);
  };
  node.textContent = "0";
  requestAnimationFrame(step);
}

// ── Pointer effects (fine pointers only) ──
// Project cards tilt toward the pointer; buttons drift a few pixels toward it.
// Both write a transform only, inline, and reset on leave.
const TILT = ".sienna-work-card";
const MAGNET = ".sienna-btn:not(:disabled)";
const TILT_DEG = 6;
const MAGNET_PX = 6;

function pointerEffects() {
  let frame = 0;
  let pending = null;
  let active = null;
  const reset = (node) => { if (node) node.style.transform = ""; };
  const apply = () => {
    frame = 0;
    const { node, x, y } = pending;
    const box = node.getBoundingClientRect();
    const dx = (x - box.left) / box.width - 0.5;
    const dy = (y - box.top) / box.height - 0.5;
    node.style.transform = node.matches(TILT)
      ? "perspective(800px) rotateX(" + (-dy * TILT_DEG).toFixed(2) + "deg) rotateY(" + (dx * TILT_DEG).toFixed(2) + "deg)"
      : "translate(" + (dx * MAGNET_PX * 2).toFixed(1) + "px, " + (dy * MAGNET_PX * 2).toFixed(1) + "px)";
  };
  const onMove = (event) => {
    const node = event.target.closest?.(TILT + "," + MAGNET);
    if (node !== active) { reset(active); active = node; }
    if (!node) return;
    pending = { node, x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const onLeave = () => { reset(active); active = null; };
  document.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  return () => {
    document.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    if (frame) cancelAnimationFrame(frame);
    reset(active);
  };
}

// ── Motion layer ──
// One shared observer reveals [data-reveal] elements once and runs stats
// count-ups. Server HTML already holds final values and visible content; the
// hidden pre-reveal state exists only in CSS gated on .js-ready + motion on +
// no reduced-motion preference.
export default function Motion({ enabled }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!enabled || typeof window.IntersectionObserver !== "function") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target;
        if (node.hasAttribute("data-count")) countUp(node);
        else node.classList.add("is-visible");
        observer.unobserve(node);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    for (const node of document.querySelectorAll(REVEAL + "," + COUNTER)) observer.observe(node);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const stopPointer = fine ? pointerEffects() : null;
    return () => {
      observer.disconnect();
      stopPointer?.();
    };
  }, [enabled, pathname]);
  return null;
}
