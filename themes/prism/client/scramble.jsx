"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrismMotion } from "./controls";

const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789_#@%&*<>/";

export default function Scramble({ text, initial = false }) {
  const [visible, setVisible] = useState(text);
  const timer = useRef(null);
  const root = useRef(null);
  const active = useRef(true);
  const { paused, reduced } = usePrismMotion();
  const scramble = useCallback(() => {
    clearInterval(timer.current);
    if (!active.current || document.hidden || paused || reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(text); return; }
    let resolved = 0;

    timer.current = setInterval(() => {
      setVisible([...text].map((character, index) => character === " " || index < resolved ? character : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)]).join(""));
      if (resolved >= text.length) clearInterval(timer.current);
      resolved += .5;
    }, 28);
  }, [text, paused, reduced]);
  useEffect(() => {
    if (initial) scramble();
    else setVisible(text);
    return () => clearInterval(timer.current);
  }, [initial, scramble, text]);
  useEffect(() => {
    const stop = () => { if (document.hidden || !active.current) { clearInterval(timer.current); setVisible(text); } };
    const observer = new IntersectionObserver(([entry]) => { active.current = entry.isIntersecting; stop(); });
    observer.observe(root.current);
    document.addEventListener("visibilitychange", stop);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", stop); };
  }, [text]);
  return <span ref={root} className="prism-scramble" onMouseEnter={scramble}><span className="prism-sr-only">{text}</span><span className="prism-scramble-sizer" aria-hidden="true">{text}</span><span className="prism-scramble-layer" aria-hidden="true">{visible}</span></span>;
}
