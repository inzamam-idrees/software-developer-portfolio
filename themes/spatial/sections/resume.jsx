import SharedResume from "../../shared/resume";

export default function Resume({ view }) {
  return (
    <div className="spatial-frame spatial-content-section spatial-resume-viewer">
      <SharedResume resume={view.resume} copy={view.copy.contentSections.resume} theme="spatial" />
    </div>
  );
}
