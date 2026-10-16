import { formatCopy } from "@/lib/portfolio/format-copy.mjs";

export default function Experience({ view }) {
  const copy = view.copy.home.experience;
  return (
    <section className="spatial-section" id="experience" aria-labelledby="spatial-experience-title">
      <div className="spatial-frame">
        <h2 id="spatial-experience-title" className="spatial-section-title">
          {copy.heading}
        </h2>
        <div className="spatial-side-layout">
          <ol className="spatial-timeline">
            {view.experience.map((role) => (
              <li key={role.id} className="spatial-role" data-role-id={`role:${role.id}`}>
                <div className="spatial-role-meta">
                  <p className="spatial-role-period">{role.period}</p>
                  <p>{role.location}</p>
                </div>
                <div className="spatial-role-body">
                  <h3>{role.role}</h3>
                  <p className="spatial-role-company">{role.company}</p>
                  {role.description && <p>{role.description}</p>}
                  {role.highlights.length > 0 && (
                    <ul className="spatial-bullets">
                      {role.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  {role.technologies.length > 0 && (
                    <ul
                      className="spatial-tags"
                      aria-label={formatCopy(copy.technologiesLabel, { role: role.role })}
                    >
                      {role.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="spatial-side-column" aria-hidden="true">
            <div className="spatial-slot spatial-slot-side" data-spatial-slot="experience" />
          </div>
        </div>
      </div>
    </section>
  );
}
