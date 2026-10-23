"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Dialog from "./dialog";
import Scramble from "./scramble";
import Icon from "../icon";

export default function Navigation({ links, copy, resume, monogram }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(links[0]?.id ?? "");
  const nav = useRef(null);
  const pathname = usePathname();
  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    const update = () => {
      const eligible = links.filter(({ id }) => { const el = document.getElementById(id); return el && el.getBoundingClientRect().top <= 200; });
      setActive(eligible.at(-1)?.id ?? links[0]?.id ?? "");
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [links, pathname]);
  useEffect(() => {
    const update = () => {
      const item = nav.current?.querySelector('[aria-current="location"]');
      if (!item) return;
      nav.current.style.setProperty("--pill-left", `${item.offsetLeft}px`);
      nav.current.style.setProperty("--pill-width", `${item.offsetWidth}px`);
    };
    update(); window.addEventListener("resize", update);
    document.fonts.ready.then(update);
    return () => window.removeEventListener("resize", update);
  }, [active, links]);
  useEffect(() => {
    const host = nav.current?.closest(".prism-root");
    const onAnchor = () => setOpen(false);
    host?.addEventListener("prism-anchor", onAnchor);
    const close = (event) => { if (event.target.closest?.(".prism-drawer a")) setOpen(false); };
    document.addEventListener("click", close, true);
    return () => { document.removeEventListener("click", close, true); host?.removeEventListener("prism-anchor", onAnchor); };
  }, []);
  const items = links.map((item) => <Link key={item.id} href={item.href} aria-current={active === item.id ? "location" : undefined}><Scramble text={item.label} /></Link>);
  return <>
    <nav ref={nav} className="prism-nav" aria-label={copy.navigation.main}><span className="prism-nav-pill" aria-hidden="true" />{items}</nav>
    <div className="prism-header-actions">
      {resume && <a className="prism-button prism-primary prism-header-resume" href={resume.url} target="_blank" rel="noreferrer" data-prism-magnetic><Icon name="resume" />{copy.navigation.items.resume}<Icon name="arrow" /></a>}
      {ready ? <button type="button" className="prism-icon-button prism-menu-trigger" onClick={() => setOpen(true)} aria-expanded={open} aria-label={copy.navigation.openMenu}><Icon name="menu" /></button> : <details className="prism-nojs-menu"><summary>{copy.navigation.menu}</summary><nav aria-label={copy.navigation.mobile}>{items}</nav></details>}
    </div>
    <Dialog open={open} onClose={() => setOpen(false)} label={copy.navigation.drawer} closeLabel={copy.navigation.closeMenu} className="prism-drawer">
      <p className="prism-drawer-brand"><span className="prism-monogram">{monogram}</span>{copy.navigation.menu}</p>
      <nav aria-label={copy.navigation.mobile}>{items}</nav>
      {resume && <a className="prism-button prism-primary" href={resume.url} target="_blank" rel="noreferrer">{resume.downloadLabel}<Icon name="arrow" /></a>}
    </Dialog>
  </>;
}
