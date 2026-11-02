"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll reveals for [data-reveal] elements. Content stays visible until this
// runs, so no-JS, reduced-motion and animations-off visitors see everything.
export default function Motion({ enabled }) {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const root = document.querySelector(".theme-creative");
    if (!root || !enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const pending = [...root.querySelectorAll("[data-reveal]:not(.is-visible)")];
    const show = (element) => element.classList.add("is-visible");
    // Anything already on screen is shown before the first paint, without a flash.
    for (const element of pending) if (element.getBoundingClientRect().top < window.innerHeight * 0.92) show(element);
    root.dataset.reveal = "ready";
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    for (const element of pending) if (!element.classList.contains("is-visible")) observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, pathname]);
  return null;
}
