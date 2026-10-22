"use client";

import { useEffect, useRef, useState } from "react";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { usePrismMotion } from "./controls";
import Icon from "../icon";

export default function Skills({ groups, featured, proficiency, copy }) {
  const [selected, setSelected] = useState("all");
  const grid = useRef(null);
  const first = useRef(true);
  const { paused, reduced } = usePrismMotion();
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (paused || reduced) return;
    const animations = [...grid.current.querySelectorAll("article:not([hidden])")].map((el, index) => el.animate(
      [{ opacity: 0, transform: "translateY(30px)" }, { opacity: 1, transform: "none" }],
      { duration: 500, delay: index * 100, easing: "ease-out" },
    ));
    return () => animations.forEach((animation) => animation.cancel());
  }, [selected, paused, reduced]);
  return <><div className="prism-frame">
    <div className="prism-filters" role="group" aria-label={copy.heading}>
      <button type="button" aria-pressed={selected === "all"} onClick={() => setSelected("all")}>{copy.all}</button>
      {groups.map((group) => <button key={group.id} type="button" aria-pressed={selected === group.id} onClick={() => setSelected(group.id)}>{group.label ?? group.title}</button>)}
    </div>
    <div ref={grid} className="prism-skills-grid">{groups.map((group, index) => <article className="prism-card" key={group.id} hidden={selected !== "all" && selected !== group.id} data-prism-reveal="card" data-prism-delay={index * 100} data-prism-tilt={8}>
      <div className="prism-card-title"><span className="prism-symbol"><Icon name={group.id} /></span><div><h3>{group.label ?? group.title}</h3>{group.summary && <p className="prism-skill-description" title={group.summary}>{group.summary}</p>}</div></div>
      <ul className="prism-tags">{group.technologies.map((name) => <li key={name}>{name}{proficiency[name] && <span className="prism-proficiency">{formatCopy(copy.proficiency, { level: proficiency[name] })}</span>}</li>)}</ul>
    </article>)}</div>
    </div><div className="prism-marquee" role="group" aria-label={copy.marquee}>
      {[featured.slice(0, Math.ceil(featured.length / 2)), featured.slice(Math.ceil(featured.length / 2))].filter((row) => row.length).map((row, index) => <div className={`prism-marquee-track${index ? " prism-marquee-reverse" : ""}`} key={index}>
        <ul>{row.map((name) => <li key={name}><span className="prism-symbol"><Icon name="code" /></span><span>{name}<small>{groups.find((group) => group.technologies.includes(name))?.label ?? copy.additional}</small></span></li>)}</ul>
        <ul aria-hidden="true">{row.map((name) => <li key={name}><span className="prism-symbol"><Icon name="code" /></span><span>{name}<small>{groups.find((group) => group.technologies.includes(name))?.label ?? copy.additional}</small></span></li>)}</ul>
      </div>)}
    </div>
  </>;
}
