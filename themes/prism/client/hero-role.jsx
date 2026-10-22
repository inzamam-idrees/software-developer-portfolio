"use client";

import { useEffect, useRef, useState } from "react";
import { usePrismMotion } from "./controls";
import { initialTypewriter, stepTypewriter } from "../typewriter.mjs";

export default function HeroRole({ roles, primary, prefix }) {
  const { paused, reduced } = usePrismMotion();
  const root = useRef(null);
  const [state, setState] = useState(null);
  useEffect(() => {
    if (paused || reduced || roles.length < 2) { setState(null); return; }
    let current = initialTypewriter(roles), timer, visible = true;
    const stop = () => clearTimeout(timer);
    const run = () => {
      stop();
      if (document.hidden || !visible) return;
      timer = setTimeout(() => { current = stepTypewriter(current, roles); setState(current); run(); }, current.delay);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); });
    observer.observe(root.current);
    document.addEventListener("visibilitychange", run);
    setState(current); run();
    return () => { stop(); observer.disconnect(); document.removeEventListener("visibilitychange", run); };
  }, [roles, paused, reduced]);
  return <div ref={root} className="prism-role" data-typing={!!state}>
    <span className="prism-role-prefix">{prefix}</span>
    <span className="prism-sr-only">{roles.join(", ")}</span>
    <span className="prism-role-stage" aria-hidden="true">
      <span className="prism-role-sizer">{[...new Set([primary, ...roles])].map((role) => <span key={role}>{role}</span>)}</span>
      <span className="prism-role-line"><span className="prism-role-text">{state ? state.text : primary}<i className="prism-role-dot" /></span><i className="prism-role-caret" /></span>
    </span>
  </div>;
}
