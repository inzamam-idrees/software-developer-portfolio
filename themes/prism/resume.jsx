import Heading from "./heading";
import Icon from "./icon";
import { resumePreviewUrl } from "./resume-preview.mjs";

export default function Resume({ resume, designation, copy }) {
  const previewUrl = resumePreviewUrl(resume.url);
  return <section id="resume" className="prism-section prism-section-tint" aria-labelledby="prism-resume-title"><div className="prism-frame">
    <Heading copy={copy} id="prism-resume-title" centered icon="resume" />
    <div className="prism-card prism-resume-panel" data-prism-reveal>
      <div className="prism-resume"><span className="prism-symbol"><Icon name="resume" /></span><div><h3>{resume.title}</h3><p>{designation}</p></div><a className="prism-button prism-primary" href={resume.url} target="_blank" rel="noopener noreferrer" data-prism-magnetic>{copy.open}<Icon name="arrow" /></a></div>
      {previewUrl && <div className="prism-resume-viewer"><div className="prism-resume-viewer-bar"><span aria-hidden="true"><i /><i /><i /></span><p>{copy.viewer}</p></div><iframe src={previewUrl} title={copy.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>}
      {previewUrl && <p className="prism-resume-fallback">{copy.previewFallback}</p>}
    </div>
  </div></section>;
}
