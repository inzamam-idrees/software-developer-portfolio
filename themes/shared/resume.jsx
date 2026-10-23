import { FiFileText, FiArrowUpRight } from "react-icons/fi";
import { resumePreviewUrl } from "./resume-preview.mjs";

export default function Resume({ resume, copy, theme }) {
  const source = resumePreviewUrl(resume.url);
  const titleId = `${theme}-resume-title`;
  return <section id="resume" className="portfolio-content-section portfolio-resume" aria-labelledby={titleId}>
    <header className="portfolio-content-heading"><h2 id={titleId}>{copy.heading}</h2></header>
    <div className="portfolio-resume-panel"><div className="portfolio-resume-controls"><div><FiFileText aria-hidden="true" /><h3>{resume.title}</h3></div><a className="portfolio-content-action" href={resume.url} target="_blank" rel="noopener noreferrer">{copy.open}<FiArrowUpRight aria-hidden="true" /></a></div>
      {source && <><iframe src={source} title={copy.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><p className="portfolio-resume-fallback">{copy.previewFallback}</p></>}
    </div>
  </section>;
}
