"use client";

import { useLayoutEffect, useRef, useState } from "react";

// ── Skills / Tools switch ──
// ARIA tabs (roving tabindex, arrows, Home/End) on the reference pill with its
// sliding indicator. Panels are server-rendered; without JS every panel shows.
export default function SkillsTabs({ label, tabs, subtitle, heading }) {
  const [active, setActive] = useState(0);
  const [indicator, setIndicator] = useState(null);
  const buttons = useRef([]);

  useLayoutEffect(() => {
    const measure = () => {
      const node = buttons.current[active];
      if (node) setIndicator({ x: node.offsetLeft, w: node.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const select = (index) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    buttons.current[next]?.focus();
  };
  const onKey = (event) => {
    const moves = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key]);
  };

  return <>
    <div className="sienna-skills-content sienna-section-content">
      {subtitle}
      <div className="sienna-section-main">
        {heading}
        <div className="sienna-skills-toggle" role="tablist" aria-label={label} data-measured={indicator ? "" : undefined} onKeyDown={onKey}
          style={indicator ? { "--sienna-tab-x": `${indicator.x}px`, "--sienna-tab-w": `${indicator.w}px` } : undefined}>
          {tabs.map((tab, index) => <button
            key={tab.id}
            ref={(node) => { buttons.current[index] = node; }}
            type="button"
            role="tab"
            id={`sienna-tab-${tab.id}`}
            aria-selected={index === active}
            aria-controls={`sienna-panel-${tab.id}`}
            tabIndex={index === active ? 0 : -1}
            className={index === active ? "sienna-toggle-btn is-active" : "sienna-toggle-btn"}
            onClick={() => setActive(index)}
          >{tab.label}</button>)}
        </div>
      </div>
    </div>
    <div className="sienna-skills-box">
      {tabs.map((tab, index) => <div
        key={tab.id}
        id={`sienna-panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`sienna-tab-${tab.id}`}
        className="sienna-skills-panel"
        data-sienna-panel=""
        hidden={index !== active}
      >{tab.panel}</div>)}
    </div>
  </>;
}
