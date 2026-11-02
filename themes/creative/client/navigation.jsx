"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon from "../icon";
import useActiveLink from "./use-active-link";

// Native <details> keeps the menu usable without JS; script closes it after
// navigation, on Escape and on outside clicks.
export default function MobileNavigation({ links, copy, resume }) {
  const menu = useRef(null);
  const active = useActiveLink(links);
  const pathname = usePathname();
  const close = () => { if (menu.current) menu.current.open = false; };
  useEffect(close, [pathname]);
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape" || !menu.current?.open) return;
      close();
      menu.current.querySelector("summary")?.focus();
    };
    const onClick = (event) => { if (!menu.current?.contains(event.target)) close(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);
  return <details ref={menu} className="creative-mobile-menu">
    <summary aria-label={copy.openMenu}><Icon name="menu" className="creative-menu-open" /><Icon name="close" className="creative-menu-close" /></summary>
    <nav className="creative-mobile-panel" aria-label={copy.mobile}>
      {links.map((item) => <Link key={item.id} href={item.href} onClick={close} aria-current={active === item.id ? (item.href.includes("#") ? "location" : "page") : undefined}>{item.label}</Link>)}
      {resume && <a className="creative-button creative-button-dark" href={resume.href} target="_blank" rel="noreferrer" onClick={close}>{resume.label}<Icon name="download" /></a>}
    </nav>
  </details>;
}
