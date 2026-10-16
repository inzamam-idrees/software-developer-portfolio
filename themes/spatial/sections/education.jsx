export default function Education({ view }) {
  const copy = view.copy.home.education;
  return (
    <section className="spatial-section" id="education" aria-labelledby="spatial-education-title">
      <div className="spatial-frame spatial-two-lists">
        <div>
          <h2 id="spatial-education-title" className="spatial-section-title">
            {copy.heading}
          </h2>
          <ol className="spatial-record-list">
            {view.education.map((item) => (
              <li key={item.id}>
                <p className="spatial-record-period">{item.duration}</p>
                <h3>{item.qualification}</h3>
                <p>{item.institution}</p>
                {item.description && <p>{item.description}</p>}
              </li>
            ))}
          </ol>
        </div>
        {view.awards.length > 0 && (
          <div id="awards">
            <h2 className="spatial-section-title">{copy.awardsHeading}</h2>
            <ol className="spatial-record-list">
              {view.awards.map((award) => (
                <li key={award.id}>
                  <p className="spatial-record-period">{award.duration}</p>
                  <h3>{award.title}</h3>
                  <p>{award.issuer}</p>
                  <p>{award.location}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
