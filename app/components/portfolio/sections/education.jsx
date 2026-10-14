import ChapterHeading from "../ui/chapter-heading";
export default function Education({ educations }) {
  return (
    <section
      id="education"
      className="chapter container education-section"
      aria-labelledby="education-heading"
    >
      <ChapterHeading
        id="education"
        number="05"
        title="A foundation in engineering."
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
    </section>
  );
}
