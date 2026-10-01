"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
const links = [
  ["Work", "projects"],
  ["About", "about"],
  ["Expertise", "skills"],
  ["Experience", "experience"],
  ["Contact", "contact"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const disclosure = useRef(null);
  const summary = useRef(null);
  const pathname = usePathname();
  const closeMenu = useCallback(() => {
    if (disclosure.current) disclosure.current.open = false;
    setOpen(false);
  }, []);
  useEffect(() => {
    setOpen(Boolean(disclosure.current?.open));
    setReady(true);
    const media = matchMedia("(min-width: 768px)");
    const reset = () => {
      if (disclosure.current) disclosure.current.open = false;
      setOpen(false);
    };
    media.addEventListener("change", reset);
    return () => media.removeEventListener("change", reset);
  }, []);
  useEffect(() => {
    closeMenu();
  }, [closeMenu, pathname]);
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return undefined;
    }
    const sections = links
      .map(([, id]) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        setActiveSection((current) => {
          if (visible) return visible.target.id;
          return entries.some(
            (entry) => entry.target.id === current && !entry.isIntersecting,
          )
            ? null
            : current;
        });
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);
  const currentSection =
    pathname === "/project" ? "projects" : activeSection;
  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape" && disclosure.current?.open) {
        disclosure.current.open = false;
        setOpen(false);
        summary.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  const items = () =>
    links.map(([label, id]) => (
      <li key={id}>
        <Link
          href={`/#${id}`}
          onClick={closeMenu}
          aria-current={
            currentSection === id
              ? pathname === "/project"
                ? "page"
                : "location"
              : undefined
          }
        >
          {label}
          {id === "contact" && <span aria-hidden="true"> ↗</span>}
        </Link>
      </li>
    ));
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          className="wordmark"
          href="/"
          aria-label="Inzamam Idrees home"
          onClick={closeMenu}
        >
          inzamam<span className="accent">.</span>
          <span className="wordmark-sub">IDREES / ENGINEER</span>
        </Link>
        <nav aria-label="Main navigation">
          <ul className="main-menu desktop-menu">{items()}</ul>
          <details
            className="mobile-disclosure"
            suppressHydrationWarning
            ref={disclosure}
            onToggle={(e) => setOpen(e.currentTarget.open)}
          >
            <summary
              ref={summary}
              className="menu-toggle"
              role="button"
              aria-label={ready ? (open ? "Close menu" : "Open menu") : "Menu"}
              aria-expanded={ready ? open : undefined}
              aria-controls="main-menu"
            >
              {open ? "Close −" : "Menu +"}
            </summary>
            <ul id="main-menu" className="main-menu mobile-menu">
              {items()}
            </ul>
          </details>
        </nav>
        <div id="motion-slot" />
      </div>
    </header>
  );
}
