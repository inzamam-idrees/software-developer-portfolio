"use client";

import Link from "next/link";
import useActiveLink from "./use-active-link";

export default function DesktopNavigation({ links, label }) {
  const active = useActiveLink(links);
  return <nav className="creative-nav" aria-label={label}>
    {links.map((item) => <Link key={item.id} href={item.href} aria-current={active === item.id ? (item.href.includes("#") ? "location" : "page") : undefined}>{item.label}</Link>)}
  </nav>;
}
