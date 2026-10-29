"use client";

import { useEffect, useRef, useState } from "react";

// A transparent "-cutout.webp" beside the canonical image is used when present.
const cutoutOf = (src) => (/\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, "-cutout.webp") : null);

export default function ExecutivePortrait({ src, name, cutout = false, priority = false }) {
  const [failed, setFailed] = useState(false);
  const [useCutout, setUseCutout] = useState(cutout && Boolean(cutoutOf(src ?? "")));
  const ref = useRef(null);
  const current = useCutout ? cutoutOf(src) : src;
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) { if (useCutout) setUseCutout(false); else setFailed(true); }
  }, [useCutout]);
  return <div className={useCutout ? "executive-portrait executive-portrait-cutout" : "executive-portrait"}>{src && !failed ? (
    // Native image preserves the canonical source and remains available without JS.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={current} alt={name} width={800} height={800} fetchPriority={priority ? "high" : undefined} loading={priority ? undefined : "lazy"} onError={() => { if (useCutout) setUseCutout(false); else setFailed(true); }} />
  ) : <span aria-hidden="true">{name.split(/\s+/).map((part) => part[0]).join("")}</span>}</div>;
}
