import ChapterHeading from "../ui/chapter-heading";
export default function Education({ educations, awards, copy }) {
  return (
    <section
      id="education"
      className="chapter container education-section"
      aria-labelledby="education-heading"
    >
      <ChapterHeading
        id="education"
        number="05"
        label={copy.label}
        title={copy.heading}
      />
      <div className="education-list">
        {educations.map((e) => (
          <article key={e.id}>
            <p className="eyebrow muted">{e.duration}</p>
            <h3>{e.qualification}</h3>
            <p className="body-copy">{e.institution}</p>
          </article>
        ))}
      </div>
      {awards.length > 0 && (
        <div className="awards-block" aria-labelledby="awards-heading">
          <h3 id="awards-heading" className="eyebrow accent">
            {copy.awardsHeading}
          </h3>
          <ul className="education-list awards-list">
            {awards.map((award) => (
              <li key={award.id}>
                <p className="eyebrow muted">{award.duration}</p>
                <h4>{award.title}</h4>
                <p className="body-copy">{award.issuer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
