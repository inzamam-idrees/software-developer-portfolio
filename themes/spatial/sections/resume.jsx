import { resumePreviewUrl } from "../../shared/resume-preview.mjs";

export default function Resume({ view }) {
  const { resume, copy } = view;
  const labels = copy.contentSections.resume;
  const source = resumePreviewUrl(resume.url);
  return (
    <section className="spatial-section spatial-resume" id="resume" aria-labelledby="spatial-resume-title">
      <div className="spatial-frame">
        <div className="spatial-section-head">
          <div><h2 className="spatial-section-title" id="spatial-resume-title">{labels.heading}</h2><p>{copy.home.resume.body}</p></div>
          <a className="spatial-button" href={resume.url} target="_blank" rel="noopener noreferrer">{labels.open}<span aria-hidden="true">↗</span></a>
        </div>
        <div className="spatial-resume-document">
          <div className="spatial-resume-toolbar"><span>{resume.title}</span><span aria-hidden="true">↗</span></div>
          {source && <iframe src={source} title={labels.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
          <p className="spatial-resume-fallback">{labels.previewFallback} <a href={resume.url} target="_blank" rel="noopener noreferrer">{resume.downloadLabel}</a></p>
        </div>
      </div>
    </section>
  );
}
