"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ── Helpers ──
const OFFSET = 140; // sticky header height plus breathing room
// Admin previews serve the same pages under /preview/<theme>; compare their public path.
const publicPath = (pathname) => pathname.replace(/^\/preview\/[^/]+/, "") || "/";
const routeMatches = (match, pathname) => (match === "/" ? pathname === "/" : !!match && pathname.startsWith(match));

/**
 * Id of the navigation item to highlight. On the home page this follows the
 * scroll position (the last linked section whose top passed the header); on
 * other routes it falls back to route matching.
 */
export default function useActiveLink(links) {
  const pathname = publicPath(usePathname());
  const [active, setActive] = useState(() => links.find((item) => routeMatches(item.match, pathname))?.id ?? null);
  useEffect(() => {
    const routeActive = links.find((item) => routeMatches(item.match, pathname))?.id ?? null;
    if (pathname !== "/") { setActive(routeActive); return undefined; }
    const sections = links
      .map((item) => ({ id: item.id, element: item.section && document.getElementById(item.section) }))
      .filter((item) => item.element)
      .sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = routeActive;
      for (const { id, element } of sections) if (element.getBoundingClientRect().top <= OFFSET) current = id;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && sections.length) current = sections.at(-1).id;
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [links, pathname]);
  return active;
}
