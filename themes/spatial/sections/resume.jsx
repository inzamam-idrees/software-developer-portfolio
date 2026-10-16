export default function Resume({ view }) {
  const copy = view.copy.home.resume;
  return (
    <section className="spatial-section spatial-resume" id="resume" aria-labelledby="spatial-resume-title">
      <div className="spatial-frame spatial-resume-inner">
        <div>
          <h2 id="spatial-resume-title" className="spatial-section-title">
            {copy.heading}
          </h2>
          <p>{copy.body}</p>
        </div>
        <a className="spatial-button" href={view.resume.url} target="_blank" rel="noreferrer">
          {view.resume.downloadLabel}
        </a>
      </div>
    </section>
  );
}
