"use client";

import { useState } from "react";

// ── Load more ──
// Cards past the first batch are server-rendered and only hidden once JS is
// ready (CSS gate), so without JS every card shows and nothing shifts on load.
export default function LoadMore({ list, batch, label }) {
  const [done, setDone] = useState(false);
  if (done) return null;
  const reveal = () => {
    const hidden = [...document.querySelectorAll("#" + list + " > .sienna-work-extra")];
    const next = hidden.slice(0, batch);
    for (const item of next) item.classList.replace("sienna-work-extra", "is-visible");
    next[0]?.querySelector("a")?.focus();
    if (hidden.length <= batch) setDone(true);
  };
  return <button type="button" className="sienna-btn sienna-btn-primary sienna-load-more" onClick={reveal}>{label}</button>;
}
