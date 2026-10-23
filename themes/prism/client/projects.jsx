"use client";

import { useEffect, useRef, useState } from "react";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import Dialog from "./dialog";
import { usePrismMotion } from "./controls";
import Heading from "../heading";
import ProjectContent from "../project-content";
import Icon from "../icon";

export default function ProjectShowcase({ projects, copy, archive = false, heading }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const stage = useRef(null);
  const animation = useRef(null);
  const alive = useRef(true);
  const { paused, reduced } = usePrismMotion();
  useEffect(() => { setReady(true); alive.current = true; return () => { alive.current = false; animation.current?.cancel(); }; }, []);
  useEffect(() => { if (paused || reduced) animation.current?.finish(); }, [paused, reduced]);
  useEffect(() => {
    if (!ready || paused || reduced || archive) return;
    const card = stage.current?.querySelector("article:not([hidden])");
    if (!card) return;
    animation.current = card.animate([{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" });
    return () => animation.current?.cancel();
  }, [index, ready, paused, reduced, archive]);
  async function choose(next) {
    if (busy || next === index) return;
    setBusy(true);
    const card = stage.current?.querySelector("article:not([hidden])");
    if (!paused && !reduced && card) {
      animation.current = card.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-40px)" }], { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" });
      await animation.current.finished.catch(() => {});
    }
    if (alive.current) { setIndex(next); setBusy(false); }
  }
  if (!projects.length) return <p className="prism-card">{copy.home.projects.empty}</p>;
  return <div>
    <div className="prism-showcase-heading">
      {heading && <Heading copy={heading} id="prism-projects-title" />}
      {!archive && ready && <div className="prism-carousel-controls">
        <button type="button" className="prism-icon-button" aria-disabled={busy} onClick={() => choose((index + projects.length - 1) % projects.length)} aria-label={copy.project.previous} data-prism-magnetic><Icon name="previous" /></button>
        <button type="button" className="prism-icon-button" aria-disabled={busy} onClick={() => choose((index + 1) % projects.length)} aria-label={copy.project.next} data-prism-magnetic><Icon name="next" /></button>
        <p className="prism-sr-only" role="status" aria-live="polite">{formatCopy(copy.project.position, { current: index + 1, total: projects.length })}</p>
      </div>}
    </div>
    <div ref={stage} className={archive ? "prism-archive" : "prism-carousel"}>
      {projects.map((project, position) => <article key={project.id} className="prism-project prism-card" hidden={!archive && ready && index !== position} data-prism-tilt={6} data-prism-cursor="project">
        <ProjectContent project={project} copy={copy} onPreview={ready ? () => setSelected(project) : undefined} />
      </article>)}
    </div>
    {!archive && <div className="prism-carousel-dots" role="group" aria-label={copy.home.projects.heading}>{ready && projects.map((project, position) => <button type="button" key={project.id} aria-disabled={busy} onClick={() => choose(position)} aria-pressed={position === index} aria-label={project.title}><span /></button>)}</div>}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} label={selected?.title ?? copy.project.preview} closeLabel={copy.project.close} heading={copy.project.preview} className="prism-project-dialog">
      {selected && <ProjectContent project={selected} copy={copy} modal />}
    </Dialog>
  </div>;
}
