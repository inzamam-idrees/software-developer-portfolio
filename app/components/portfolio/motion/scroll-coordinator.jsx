"use client";
import { useEffect } from "react";
import { useMotion } from "./motion-preferences";
import { createSceneState } from "./scene-state.mjs";
const chapters = [
  [
    "projects",
    {
      cameraZ: 9,
      rotationY: 0.9,
      coreX: 0.5,
      coreY: 0.3,
      coreScale: 0.85,
      spread: 0.2,
      opacity: 0.16,
    },
  ],
  [
    "about",
    {
      cameraZ: 10,
      rotationY: 1.5,
      coreX: 1.2,
      coreY: 0.1,
      coreScale: 0.85,
      spread: 0.3,
      opacity: 0.18,
    },
  ],
  [
    "skills",
    {
      cameraZ: 10.5,
      rotationY: 2.1,
      rotationX: 0.25,
      coreX: 0.5,
      coreY: 0.25,
      coreScale: 1,
      spread: 1.5,
      opacity: 0.17,
    },
  ],
  [
    "experience",
    {
      cameraZ: 11,
      rotationY: 2.9,
      coreX: 1,
      coreY: 0.2,
      coreScale: 0.8,
      spread: 0.5,
      opacity: 0.12,
    },
  ],
  [
    "education",
    {
      cameraZ: 12,
      rotationY: 3.3,
      coreX: 0.4,
      coreY: 0.2,
      coreScale: 0.7,
      spread: 0.3,
      opacity: 0.1,
    },
  ],
  [
    "writing",
    {
      cameraZ: 13,
      rotationY: 3.7,
      coreX: 0.5,
      coreY: 0,
      coreScale: 0.7,
      spread: 0.2,
      opacity: 0.08,
    },
  ],
  [
    "contact",
    {
      cameraZ: 14,
      rotationY: 4,
      coreX: 0.2,
      coreY: 0,
      coreScale: 0.6,
      spread: 0,
      opacity: 0.04,
    },
  ],
];
export default function ScrollCoordinator({ stateRef, rootRef }) {
  const { enabled } = useMotion();
  useEffect(() => {
    const scene = stateRef.current,
      rootElement = rootRef.current;
    if (!enabled) {
      Object.assign(scene, createSceneState());
      return;
    }
    let cancelled = false,
      media;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([gsapModule, triggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap,
          ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        media = gsap.matchMedia();
        media.add(
          { compact: "(max-width: 767px)", desktop: "(min-width: 768px)" },
          (context) => {
            const compact = context.conditions.compact,
              root = rootElement,
              progress = root.querySelector(".story-progress");
            let timeline, refreshFrame;
            context.add("rebuild", () => {
              timeline?.scrollTrigger?.kill();
              timeline?.kill();
              Object.assign(scene, createSceneState());
              const max = Math.max(1, ScrollTrigger.maxScroll(window));
              let previous = 0;
              timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: root,
                  start: 0,
                  end: () => ScrollTrigger.maxScroll(window),
                  scrub: 0.4,
                  invalidateOnRefresh: true,
                },
                onUpdate: () => {
                  progress.style.transform = `scaleX(${timeline.progress()})`;
                },
              });
              for (const [id, pose] of chapters) {
                const element = root.querySelector("#" + id);
                if (!element) continue;
                const stop = Math.min(
                  0.98,
                  Math.max(
                    previous + 0.001,
                    (element.getBoundingClientRect().top +
                      window.scrollY -
                      120) /
                      max,
                  ),
                );
                const target = { ...pose };
                if (compact) {
                  target.rotationY *= 0.35;
                  target.coreX = 0;
                  target.coreY = 0;
                  target.spread *= 0.5;
                }
                timeline.to(
                  scene,
                  { ...target, duration: stop - previous },
                  previous,
                );
                previous = stop;
              }
              timeline.to(
                scene,
                { opacity: 0.02, duration: Math.max(0.001, 1 - previous) },
                previous,
              );
              timeline.scrollTrigger.refresh();
              timeline.scrollTrigger.update();
            });
            context.rebuild();
            gsap
              .timeline({ defaults: { duration: 0.8, ease: "power2.out" } })
              .from(root.querySelectorAll("#hero [data-reveal]"), {
                y: 18,
                opacity: 0.65,
                stagger: 0.1,
              });
            for (const section of root.querySelectorAll(".chapter")) {
              const targets = section.querySelectorAll("[data-reveal]");
              if (targets.length)
                gsap
                  .timeline({
                    scrollTrigger: {
                      trigger: section,
                      start: "top 82%",
                      toggleActions: "play none none reverse",
                    },
                  })
                  .from(targets, {
                    y: 20,
                    duration: 0.75,
                    stagger: 0.08,
                    ease: "power2.out",
                  });
            }
            const observer = new ResizeObserver(() => {
              cancelAnimationFrame(refreshFrame);
              refreshFrame = requestAnimationFrame(() => context.rebuild());
            });
            observer.observe(root);
            const visibility = () => {
              if (document.hidden) {
                timeline?.scrollTrigger?.disable(false);
                timeline?.pause();
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
      .catch(() => {
        Object.assign(scene, createSceneState());
      });
    return () => {
      cancelled = true;
      media?.revert();
      Object.assign(scene, createSceneState());
      const bar = rootElement?.querySelector(".story-progress");
      if (bar) bar.style.transform = "scaleX(0)";
    };
  }, [enabled, stateRef, rootRef]);
  return null;
}
