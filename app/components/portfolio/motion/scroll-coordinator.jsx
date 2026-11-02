"use client";
import { useEffect } from "react";
import { useMotion } from "./motion-preferences";
import { createSceneState } from "./scene-state.mjs";
import { STATION_IDS, stationStops } from "./journey.mjs";

// ── Helpers ──
function resetScene(scene) {
  const { projectCount, pathCount } = scene;
  Object.assign(scene, createSceneState(), { projectCount, pathCount });
}

function countOf(root, selector, fallback) {
  const found = root.querySelectorAll(selector).length;
  return found || fallback;
}

export default function ScrollCoordinator({ stateRef, rootRef }) {
  const { enabled } = useMotion();

  useEffect(() => {
    const scene = stateRef.current;
    const rootElement = rootRef.current;
    scene.projectCount = countOf(rootElement, "[data-project-screen]", scene.projectCount);
    scene.pathCount = countOf(rootElement, "[data-career-step]", scene.pathCount);
    if (!enabled) {
      resetScene(scene);
      return;
    }
    let cancelled = false;
    let media;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gsapModule, triggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        media = gsap.matchMedia();
        media.add(
          { compact: "(max-width: 767px)", desktop: "(min-width: 768px)" },
          (context) => {
            const compact = context.conditions.compact;
            const root = rootElement;
            const progress = root.querySelector(".story-progress");
            let timeline;
            let refreshFrame;

            // Camera journey: one scrubbed timeline across the whole page.
            context.add("rebuild", () => {
              timeline?.scrollTrigger?.kill();
              timeline?.kill();
              scene.journey = 0;
              const max = ScrollTrigger.maxScroll(window);
              const offsets = STATION_IDS.map((id, index) => {
                if (index === 0) return 0;
                const element = root.querySelector("#" + id);
                if (!element) return NaN;
                const top = element.getBoundingClientRect().top + window.scrollY;
                return top - window.innerHeight * (compact ? 0.2 : 0.3);
              });
              const stops = stationStops(offsets, max);
              timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: root,
                  start: 0,
                  end: () => ScrollTrigger.maxScroll(window),
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                },
                onUpdate: () => {
                  progress.style.transform = `scaleX(${timeline.progress()})`;
                },
              });
              let previous = 0;
              STATION_IDS.forEach((id, index) => {
                if (index === 0) return;
                const stop = stops[index];
                timeline.to(scene, { journey: index, duration: stop - previous }, previous);
                previous = stop;
              });
              timeline.set({}, {}, 1);
              timeline.scrollTrigger.refresh();
              timeline.scrollTrigger.update();
            });
            context.rebuild();

            // Per-chapter scrubs: the active project, the career path, the tech orbit.
            const scrub = (selector, vars, start, end) => {
              const trigger = root.querySelector(selector);
              if (!trigger) return;
              gsap.to(scene, {
                ...vars,
                ease: "none",
                scrollTrigger: { trigger, start, end, scrub: 0.5, invalidateOnRefresh: true },
              });
            };
            scrub("#experience", { pathProgress: 1 }, "top 55%", "bottom 65%");
            scrub("#skills", { skillsTurn: 1 }, "top 100%", "bottom 0%");

            // Entrance: hero first, then each chapter as it arrives.
            gsap
              .timeline({ defaults: { duration: 0.9, ease: "power3.out" } })
              .from(root.querySelectorAll("#hero [data-reveal]"), { y: 24, opacity: 0, stagger: 0.12 })
              .from(root.querySelectorAll("#hero .hero-portrait"), { y: 40, scale: 0.94, opacity: 0, duration: 1.2 }, 0.15)
              .from(root.querySelectorAll("#hero .hero-chip"), { y: 18, opacity: 0, stagger: 0.08 }, 0.5);
            for (const section of root.querySelectorAll(".chapter")) {
              const targets = section.querySelectorAll("[data-reveal]");
              if (!targets.length) continue;
              gsap
                .timeline({
                  scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
                })
                .from(targets, { y: 32, opacity: 0, duration: 0.8, stagger: 0.09, ease: "power2.out" });
            }

            const observer = new ResizeObserver(() => {
              cancelAnimationFrame(refreshFrame);
              refreshFrame = requestAnimationFrame(() => context.rebuild());
            });
            observer.observe(root);
            const visibility = () => {
              if (document.hidden) {
                timeline?.scrollTrigger?.disable(false);
              } else {
                timeline?.scrollTrigger?.enable();
                ScrollTrigger.refresh();
              }
            };
            document.addEventListener("visibilitychange", visibility);
            return () => {
              observer.disconnect();
              cancelAnimationFrame(refreshFrame);
              document.removeEventListener("visibilitychange", visibility);
            };
          },
          rootElement,
        );
      })
      .catch(() => resetScene(scene));

    return () => {
      cancelled = true;
      media?.revert();
      resetScene(scene);
      const bar = rootElement?.querySelector(".story-progress");
      if (bar) bar.style.transform = "scaleX(0)";
    };
  }, [enabled, stateRef, rootRef]);
  return null;
}
