import ChapterHeading from "../ui/chapter-heading";
export default function Experience({ experiences, copy }) {
  return (
    <section
      id="experience"
      className="chapter container"
      aria-labelledby="experience-heading"
    >
      <ChapterHeading
        id="experience"
        number="05"
        label={copy.label}
        title={copy.heading}
      />
      <ol
        className="career-timeline"
        style={{ "--n": experiences.length }}
        data-stair={experiences.length <= 4 ? "" : undefined}
      >
        <svg className="career-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 96 C 28 96, 30 62, 52 66 S 78 24, 100 8" />
        </svg>
        {[...experiences].reverse().map((job, index) => (
          <li key={job.id} data-reveal data-career-step style={{ "--i": index }}>
            <span className="career-step">0{index + 1}</span>
            <div>
              <p className="eyebrow accent">
                {job.duration.replace(/[()]/g, "")}
              </p>
              <h3>{job.role}</h3>
              <p className="body-copy">
                {job.company} · {job.location}
              </p>
              {job.description && <p className="body-copy">{job.description}</p>}
              {job.highlights.length > 0 && (
                <ul className="career-highlights">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
              {job.technologies.length > 0 && (
                <ul className="technology-list">
                  {job.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              )}
            </div>
            <span className="career-line" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </section>
  );
}
