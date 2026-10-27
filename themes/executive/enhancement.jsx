"use client";

import { useEffect } from "react";
import { createExecutiveMotion } from "./motion.mjs";
import { usePathname } from "next/navigation";
import { readMotionPreference, MOTION_STORAGE_KEY } from "@/lib/motion/preferences.mjs";

/** Progressive state only: all content and all navigation are server rendered. */
export default function ExecutiveEnhancement() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.querySelector(".theme-executive");
    if (!root || !window.IntersectionObserver) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const disclosures = [...root.querySelectorAll(".executive-project-disclosure")];
    const timers = new Map();
    const frames = new Set();
    const settle = (details) => { clearTimeout(timers.get(details)); timers.delete(details); details.querySelector(".executive-disclosure-grid").inert = false; delete details.dataset.opening; if (details.dataset.expanded === "false") details.open = false; };
    disclosures.forEach((details) => { details.dataset.motionReady = "true"; details.dataset.expanded = String(details.open); });
    const motion = createExecutiveMotion(root);
    let localPaused = null;
    const preference = () => {
      let storage;
      try { storage = window.localStorage; } catch {}
      root.dataset.executiveMotion = !media.matches && (localPaused ?? (readMotionPreference(storage) === "paused")) === false ? "enabled" : "paused";
      motion.setEnabled(root.dataset.executiveMotion === "enabled");
      if (root.dataset.executiveMotion === "paused") disclosures.forEach(settle);
      else disclosures.forEach((details) => { details.dataset.expanded = String(details.open); });
    };
    const localChange = (event) => { localPaused = event.detail; preference(); };
    root.addEventListener("executive-motion-change", localChange);
    preference();
    media.addEventListener("change", preference);
    const storageChange = (event) => { if (event.key === MOTION_STORAGE_KEY || event.key === null) { localPaused = null; preference(); } };
    window.addEventListener("storage", storageChange);

    const sections = [...root.querySelectorAll("main section[id]")];
    const headerLinks = [...root.querySelectorAll("[data-section-link]")];
    const updateIndicator = () => {
      root.querySelectorAll(".executive-desktop-nav,.executive-section-nav").forEach((nav) => {
        const links = [...nav.querySelectorAll("[data-section-link]")];
        const index = links.findIndex((link) => link.hasAttribute("aria-current"));
        nav.dataset.indicatorVisible = String(index >= 0);
        if (index >= 0) nav.style.setProperty("--ex-nav-index", String(index));
      });
    };
    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of headerLinks) {
          if (link.dataset.sectionLink === entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
        updateIndicator();
      }
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));

    const roles = [...root.querySelectorAll("[data-role]")];
    const roleLinks = [...root.querySelectorAll("[data-role-link]")];
    const setRole = (role) => {
      roles.forEach((item) => { item.dataset.active = String(item === role); });
      roleLinks.forEach((link) => {
        if (link.dataset.roleLink === role.dataset.role) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
      root.style.setProperty("--ex-progress", String((roles.indexOf(role) + 1) / roles.length));
    };
    const roleObserver = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => setRole(entry.target));
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    roles.forEach((role) => roleObserver.observe(role));
    // Anchor activation gives immediate feedback and native focus, including long roles.
    const onAnchor = (event) => {
      if (!root.contains(event.target)) return;
      const summary = event.target.closest(".executive-project-disclosure > summary");
      if (summary) {
        const details = summary.parentElement;
        if (root.dataset.executiveMotion !== "enabled") {
          clearTimeout(timers.get(details));
          delete details.dataset.expanded;
          details.querySelector(".executive-disclosure-grid").inert = false;
          return;
        }
        event.preventDefault();
        clearTimeout(timers.get(details));
        if (details.open && (details.dataset.expanded === "true" || details.dataset.opening === "true")) {
          delete details.dataset.opening;
          details.querySelector(".executive-disclosure-grid").inert = true;
          details.dataset.expanded = "false";
          // A bounded fallback also settles a zero-height or interrupted transition.
          timers.set(details, setTimeout(() => settle(details), 280));
        } else {
          details.dataset.expanded = "false";
          details.querySelector(".executive-disclosure-grid").inert = false;
          details.dataset.opening = "true";
          details.open = true;
          const first = requestAnimationFrame(() => {
            frames.delete(first);
            const second = requestAnimationFrame(() => { frames.delete(second); if (details.open && details.dataset.opening === "true") { details.dataset.expanded = "true"; delete details.dataset.opening; } });
            frames.add(second);
          });
          frames.add(first);
        }
        return;
      }
      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (anchor.dataset.roleLink) {
        const role = roles.find((item) => item.dataset.role === anchor.dataset.roleLink);
        if (role) { setRole(role); role.focus({ preventScroll: true }); }
      }
      root.querySelectorAll(".executive-mobile-nav[open]").forEach((menu) => { menu.open = false; });
    };
    const onTransitionEnd = (event) => {
      if (event.propertyName !== "grid-template-rows") return;
      const details = event.target.closest(".executive-project-disclosure");
      if (details && details.dataset.expanded === "false") settle(details);
    };
    const onFocus = (event) => motion.settleFocused(event.target);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("transitionend", onTransitionEnd);
    document.addEventListener("click", onAnchor, true);
    return () => {
      motion.dispose();
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("executive-motion-change", localChange);
      media.removeEventListener("change", preference);
      window.removeEventListener("storage", storageChange);
      document.removeEventListener("click", onAnchor, true);
      root.removeEventListener("transitionend", onTransitionEnd);
      frames.forEach(cancelAnimationFrame);
      disclosures.forEach((details) => { settle(details); delete details.dataset.motionReady; delete details.dataset.expanded; });
      sectionObserver.disconnect();
      roleObserver.disconnect();
      delete root.dataset.executiveMotion;
    };
  }, [pathname]);
  return null;
}
