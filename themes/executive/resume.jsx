import { resumePreviewUrl } from "../shared/resume-preview.mjs";
import ExecutiveResumePreview from "./resume-preview";

export default function ExecutiveResume({ resume, copy }) {
  const labels = copy.resume;
  const source = resumePreviewUrl(resume.url);
  return <section id="resume" className="executive-section executive-resume" aria-labelledby="executive-resume-title">
    <div className="executive-resume-card">
      <div><h2 id="executive-resume-title">{copy.contentSections.resume.heading}</h2><p>{resume.title}</p><p className="executive-resume-summary">{labels.summary}</p>{resume.metadata?.lastUpdated && <p className="executive-resume-updated">{labels.updated}: {resume.metadata.lastUpdated}</p>}</div>
      <div className="executive-actions"><a className="executive-button secondary" href={resume.url} download target="_blank" rel="noreferrer">{labels.download}</a><a className="executive-text-link" href={resume.url} target="_blank" rel="noreferrer">{labels.open}</a></div>
      {source && <ExecutiveResumePreview source={source} labels={labels} shared={copy.contentSections.resume} />}
    </div>
  </section>;
}
