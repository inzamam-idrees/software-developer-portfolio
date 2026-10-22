"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "../icon";

const MotionContext = createContext({ paused: false, reduced: false });
export const usePrismMotion = () => useContext(MotionContext);

export default function Controls({ children, copy, enabled }) {
  const root = useRef(null);
  const [ready, setReady] = useState(false);
  const [light, setLight] = useState(false);
  const [paused, setPaused] = useState(!enabled);
  const [reduced, setReduced] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setReady(true);
    try {
      setLight(localStorage.getItem("prism-color") === "light");
      setPaused(!enabled || localStorage.getItem("prism-motion") === "paused");
    } catch { /* Storage is optional. */ }
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [enabled]);
  useEffect(() => {
    if (paused || reduced) return;
    const host = root.current;
    const reveals = new Set();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const kind = entry.target.dataset.prismReveal;
      const transform = kind === "hero-copy" ? "translateX(-40px)" : kind === "portrait" ? "translateX(40px) scale(.85)" : kind === "right" ? "translateX(30px)" : kind === "heading" ? "translateY(20px)" : "translateY(30px)";
      const animation = entry.target.animate([{ opacity: 0, transform }, { opacity: 1, transform: "none" }], {
        duration: kind === "hero-copy" ? 800 : kind === "portrait" ? 900 : kind === "heading" || kind === "card" ? 500 : 600,
        delay: Number(entry.target.dataset.prismDelay ?? (kind === "portrait" ? 200 : 0)),
        easing: kind === "hero-copy" || kind === "portrait" ? "cubic-bezier(.16,1,.3,1)" : "ease-out",
      });
      reveals.add(animation);
      animation.finished.finally(() => reveals.delete(animation)).catch(() => {});
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    host.querySelectorAll("[data-prism-reveal]").forEach((el) => observer.observe(el));
    return () => { observer.disconnect(); reveals.forEach((animation) => animation.cancel()); };
  }, [paused, reduced, pathname]);
  useEffect(() => {
    const host = root.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - innerHeight;
      host.style.setProperty("--prism-progress", distance > 0 ? String(scrollY / distance) : "0");
      host.dataset.scrolled = String(scrollY > 20);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); addEventListener("scroll", scroll, { passive: true }); addEventListener("resize", scroll);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", scroll); removeEventListener("resize", scroll); };
  }, [pathname]);
  useEffect(() => {
    if (paused || reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const host = root.current;
    let frame = 0;
    let pointer = null;
    let active = null;
    let currentX = 0;
    let currentY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let previousTime = 0;
    const cursor = host.querySelector(".prism-cursor");
    const dot = host.querySelector(".prism-cursor-dot");
    const reset = () => {
      active?.style.removeProperty("transform"); active = null;
      cursor.style.opacity = "0"; dot.style.opacity = "0";
      cancelAnimationFrame(frame); frame = 0; pointer = null;
    };
    const paint = (time) => {
      frame = 0;
      if (!pointer) return;
      const { x, y, target } = pointer;
      const dt = Math.min((time - (previousTime || time - 16)) / 1000, .025);
      previousTime = time;
      velocityX += ((x - currentX) * 560 - velocityX * 48) * dt;
      velocityY += ((y - currentY) * 560 - velocityY * 48) * dt;
      currentX += velocityX * dt; currentY += velocityY * dt;
      cursor.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      cursor.style.opacity = "1"; dot.style.opacity = "1";
      host.style.setProperty("--prism-pointer-x", `${x}px`);
      host.style.setProperty("--prism-pointer-y", `${y}px`);
      const project = target.closest?.("[data-prism-cursor]");
      const interactive = target.closest?.("a,button,input,textarea,select,summary");
      cursor.dataset.kind = project && !interactive ? "project" : interactive ? "pointer" : "default";
      const next = target.closest?.("[data-prism-tilt], [data-prism-magnetic], .prism-hero-socials a");
      if (active !== next) { active?.style.removeProperty("transform"); active = next; }
      if (next) {
        const rect = next.getBoundingClientRect();
        const dx = (x - rect.left) / rect.width - .5;
        const dy = (y - rect.top) / rect.height - .5;
        next.style.setProperty("--prism-card-x", `${x - rect.left}px`);
        next.style.setProperty("--prism-card-y", `${y - rect.top}px`);
        const tilt = Number(next.dataset.prismTilt) || 8;
        const transform = next.hasAttribute("data-prism-tilt")
          ? ["perspective(1000px)", `rotateX(${-dy * tilt * 2}deg)`, `rotateY(${dx * tilt * 2}deg)`].join(" ")
          : `translate(${dx * rect.width * .25}px,${dy * rect.height * .25}px)`;
        next.style.transform = transform;
      }
      if (Math.abs(currentX - x) + Math.abs(currentY - y) + Math.abs(velocityX) + Math.abs(velocityY) > .2) frame = requestAnimationFrame(paint);
    };
    const move = (event) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY, target: event.target };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    host.addEventListener("pointermove", move); host.addEventListener("pointerleave", reset);
    return () => { cancelAnimationFrame(frame); reset(); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", reset); };
  }, [paused, reduced]);
  useEffect(() => {
    const navigate = (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || !root.current.contains(anchor)) return;
      const url = new URL(anchor.href, location.origin);
      if (url.origin !== location.origin || !url.hash || !["/", location.pathname].includes(url.pathname)) return;
      const target = document.getElementById(url.hash.slice(1));
      if (!target) return;
      event.preventDefault(); event.stopPropagation();
      root.current.dispatchEvent(new Event("prism-anchor"));
      if (url.hash === "#main-content") {
        history.replaceState(history.state, "", location.pathname + location.search + url.hash);
        target.focus({ preventScroll: true });
      }
      window.scrollTo({ top: url.hash === "#hero" ? 0 : target.getBoundingClientRect().top + scrollY - 80, behavior: paused || reduced ? "instant" : "smooth" });
    };
    window.addEventListener("click", navigate, true);
    return () => window.removeEventListener("click", navigate, true);
  }, [paused, reduced]);
  const toggleLight = () => { setLight(!light); try { localStorage.setItem("prism-color", light ? "dark" : "light"); } catch {} };
  const toggleMotion = () => { setPaused(!paused); try { localStorage.setItem("prism-motion", paused ? "enabled" : "paused"); } catch {} };
  return <MotionContext.Provider value={{ paused: paused || !enabled, reduced }}>
    <div ref={root} className="prism-root" data-color={light ? "light" : "dark"} data-ready={ready || undefined} data-motion={!ready || paused || reduced || !enabled ? "off" : "on"}>
      <div className="prism-scroll-progress" aria-hidden="true" />
      <div className="prism-cursor" aria-hidden="true"><span>{copy.project.cursor}</span></div>
      <div className="prism-cursor-dot" aria-hidden="true" />
      <div className="prism-spotlight" aria-hidden="true" />
      <div className="prism-preference-controls">
        <button type="button" className="prism-icon-button" onClick={toggleLight} aria-label={copy.navigation.themeToggle} aria-pressed={light}><Icon name={light ? "moon" : "sun"} /></button>
        <button type="button" className="prism-icon-button" onClick={toggleMotion} disabled={reduced || !enabled} aria-label={reduced ? copy.motion.reduced : paused ? copy.motion.enable : copy.motion.pause} aria-pressed={paused}><Icon name={paused || reduced ? "play" : "pause"} /></button>
      </div>
      {children}
    </div>
  </MotionContext.Provider>;
}
