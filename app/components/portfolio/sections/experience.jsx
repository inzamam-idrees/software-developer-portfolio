import ChapterHeading from "../ui/chapter-heading";
export default function Experience({ experiences }) {
  return (
    <section
      id="experience"
      className="chapter container"
      aria-labelledby="experience-heading"
    >
      <ChapterHeading id="experience" number="04" title="The journey so far." />
      <ol className="career-timeline">
        {[...experiences].reverse().map((job, index) => (
          <li key={job.id} data-reveal>
            <span className="career-step">0{index + 1}</span>
            <div>
              <p className="eyebrow accent">
                {job.duration.replace(/[()]/g, "")}
              </p>
              <h3>{job.role}</h3>
              <p className="body-copy">
                {job.company} · {job.location}
              </p>
              {job.highlights.length > 0 && (
                <ul className="career-highlights">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
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
