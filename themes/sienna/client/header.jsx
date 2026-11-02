"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ColorToggle from "./color-toggle";

// ── Constants ──
const ACTIVE_OFFSET = 10;
const DESKTOP = "(min-width: 992px)";
const FOCUSABLE = "a[href], button:not([disabled])";

// Preview pages are served at /preview/<theme>/…; match them like public routes.
const routeOf = (pathname) => pathname.replace(/^\/preview\/[^/]+/, "") || "/";

// ── Header ──
// Reference behaviour (fixed bar, solid after 10px, overlay menu on small screens)
// plus scroll progress, active-section highlight and an accessible menu (aria-expanded, Escape, focus trap, close on navigation).
export default function SiennaHeader({ brand, homeLabel, links, suffix, copy }) {
  const header = useRef(null);
  const progress = useRef(null);
  const toggle = useRef(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const pathname = usePathname();
  const route = routeOf(pathname);
  const onHome = route === "/";

  const close = useCallback((restoreFocus) => {
    setOpen(false);
    if (restoreFocus) toggle.current?.focus();
  }, []);

  useEffect(() => close(false), [pathname, close]);

  // Scroll state: written straight to the DOM so scrolling never re-renders.
  useEffect(() => {
    const root = header.current?.closest(".theme-sienna");
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const node = header.current;
      if (!node) return;
      const active = y >= ACTIVE_OFFSET;
      node.toggleAttribute("data-active", active);
      root?.toggleAttribute("data-scrolled", active);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current?.style.setProperty("--sienna-progress", max > 0 ? String(Math.min(1, y / max)) : "0");
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Active section on the home page; route match elsewhere.
  useEffect(() => {
    if (!onHome) {
      setCurrent(links.find((link) => link.match && route.startsWith(link.match))?.id ?? null);
      return undefined;
    }
    const sections = links
      .map((link) => [link.id, document.getElementById(link.section)])
      .filter(([, node]) => node);
    if (!sections.length || typeof window.IntersectionObserver !== "function") return undefined;
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
      const hit = sections.find(([, node]) => visible.get(node.id));
      setCurrent(hit ? hit[0] : null);
    }, { rootMargin: "-45% 0px -50% 0px" });
    for (const [, node] of sections) observer.observe(node);
    return () => observer.disconnect();
  }, [links, onHome, route]);

  // Open menu: lock scroll, trap focus, close on Escape or when the layout turns desktop.
  useEffect(() => {
    if (!open) return undefined;
    const node = header.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); return; }
      if (event.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); lastItem.focus(); }
      else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); first.focus(); }
    };
    const desktop = window.matchMedia(DESKTOP);
    const onChange = (event) => { if (event.matches) close(false); };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open, close]);

  return <>
    <div ref={progress} className="sienna-progress" aria-hidden="true" />
    <header ref={header} className="sienna-header" data-open={open ? "" : undefined}>
      <div className="sienna-container">
        <p className="sienna-logo"><Link href="/" aria-label={homeLabel}>{brand}<span aria-hidden="true">{suffix}</span></Link></p>
        <div className="sienna-navbar-actions"><ColorToggle label={copy.colorMode} /></div>
        <button
          ref={toggle}
          type="button"
          className="sienna-nav-toggle"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          aria-controls="sienna-navbar"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sienna-bar-one" />
          <span className="sienna-bar-two" />
          <span className="sienna-bar-three" />
        </button>
        <nav id="sienna-navbar" className="sienna-navbar" aria-label={copy.main}>
          <ul className="sienna-navbar-list">
            {links.map((link) => {
              const active = current === link.id;
              return <li key={link.id}>
                <Link
                  className="sienna-navbar-link"
                  href={link.href}
                  aria-current={active ? (onHome ? "location" : "page") : undefined}
                  onClick={() => close(false)}
                >
                  {link.label}<span aria-hidden="true">{suffix}</span>
                </Link>
              </li>;
            })}
          </ul>
        </nav>
      </div>
    </header>
  </>;
}
