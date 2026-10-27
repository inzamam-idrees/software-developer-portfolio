"use client";

import { useState } from "react";

export default function ExecutivePortrait({ src, name }) {
  const [failed, setFailed] = useState(false);
  return <div className="executive-portrait">{src && !failed ? (
    // Native image preserves the canonical source and remains available without JS.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={192} height={224} fetchPriority="high" onError={() => setFailed(true)} />
  ) : <span aria-hidden="true">{name.split(/\s+/).map((part) => part[0]).join("")}</span>}</div>;
}
