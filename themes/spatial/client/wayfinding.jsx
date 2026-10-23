"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Wayfinding() {
  const pathname = usePathname();
  useEffect(() => {
    const links = [...document.querySelectorAll('.spatial-nav a[href*="#"]')];
    const sections = links.map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter(({ section }) => section);
    let frame = null;
    const update = () => {
      frame = null;
      const reached = sections.map((entry) => ({ ...entry, top: entry.section.getBoundingClientRect().top })).filter(({ top }) => top <= innerHeight * .35).sort((left, right) => right.top - left.top);
      const current = reached[0]?.link;
      const careerLinks = [...document.querySelectorAll('.spatial-blueprint-index a')];
      const currentRole = careerLinks.map((link) => ({link, top: document.getElementById(link.hash.slice(1))?.getBoundingClientRect().top ?? Infinity})).filter(({top}) => top <= innerHeight * .45).sort((a,b) => b.top - a.top)[0]?.link;
      careerLinks.forEach((link) => {
        if (link === currentRole) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      links.forEach((link) => {
        if (link === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
