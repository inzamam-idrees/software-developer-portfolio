"use client";

import { useEffect, useRef, useState } from "react";

// A transparent "-cutout.webp" beside the canonical image is used when present.
const cutoutOf = (src) => (/\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, "-cutout.webp") : null);

export default function Portrait({ src, alt, initials }) {
  const [useCutout, setUseCutout] = useState(Boolean(cutoutOf(src ?? "")));
  const [failed, setFailed] = useState(!src);
  const ref = useRef(null);
  const fail = () => (useCutout ? setUseCutout(false) : setFailed(true));
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) fail();
  });
  if (failed) return <span className="creative-portrait-placeholder" aria-hidden="true">{initials}</span>;
  return (
    // Native image keeps the canonical source untouched and works without JS.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} className={useCutout ? "creative-portrait creative-portrait-cutout" : "creative-portrait"} src={useCutout ? cutoutOf(src) : src} alt={alt} width={800} height={800} fetchPriority="high" onError={fail} />
  );
}
