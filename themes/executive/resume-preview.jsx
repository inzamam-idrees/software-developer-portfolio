"use client";

import { useState } from "react";

export default function ExecutiveResumePreview({ source, labels, shared }) {
  const [loaded, setLoaded] = useState(false);
  return <details className="executive-resume-preview" onToggle={(event) => { if (event.currentTarget.open) setLoaded(true); }}>
    <summary>{labels.preview}</summary>
    {loaded && <iframe src={source} title={shared.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
    <noscript><p>{labels.noScriptPreview}</p><a className="executive-text-link" href={source} target="executive-resume-viewer">{labels.loadPreview}</a><iframe name="executive-resume-viewer" title={shared.viewer} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></noscript>
    <p className="executive-resume-fallback">{shared.previewFallback}</p>
  </details>;
}
