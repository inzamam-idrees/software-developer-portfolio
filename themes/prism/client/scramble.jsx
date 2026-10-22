"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrismMotion } from "./controls";

export default function Scramble({ text, initial = false }) {
  const [visible, setVisible] = useState(text);
  const timer = useRef(null);
  const { paused, reduced } = usePrismMotion();
  const scramble = useCallback(() => {
    clearInterval(timer.current);
    if (paused || reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(text); return; }
    let resolved = 0;
    const characters = "abcdefghjklmnpqrstuvwxyz0123456789_#@%&*<>/".toUpperCase();
    timer.current = setInterval(() => {
      resolved += .5;
      setVisible([...text].map((character, index) => character === " " || index < resolved ? character : characters[Math.floor(Math.random() * characters.length)]).join(""));
      if (resolved >= text.length) clearInterval(timer.current);
    }, 28);
  }, [text, paused, reduced]);
  useEffect(() => {
    if (initial) scramble();
    else setVisible(text);
    return () => clearInterval(timer.current);
  }, [initial, scramble, text]);
  return <span onMouseEnter={scramble}><span className="prism-sr-only">{text}</span><span aria-hidden="true">{visible}</span></span>;
}
