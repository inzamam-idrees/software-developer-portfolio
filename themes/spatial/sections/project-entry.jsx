import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectDetailSections } from "../presentation.mjs";

export default function ProjectEntry({ project, copy, headingLevel = 3, detailed = false }) {
  const Heading = `h${headingLevel}`;
  const editorial = [
    [copy.project.problem, project.problem],
    [copy.project.solution, project.solution],
    [copy.project.outcome, project.outcome],
  ].filter(([, value]) => value);
  return (
    <article className="spatial-project" id={`project-${project.id}`} data-project-id={`project:${project.id}`}>
      <div className="spatial-project-head">
        {project.category && <p className="spatial-project-category">{project.category}</p>}
        <Heading>{project.title}</Heading>
        <p className="spatial-project-role">{project.role}</p>
      </div>
      <p className="spatial-project-summary">{project.shortDescription}</p>
      {editorial.length > 0 && (
        <dl className="spatial-project-story">
          {editorial.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {detailed &&
        projectDetailSections(project).map((section) => (
          <div key={section.kind} className="spatial-project-detail">
            <p className="spatial-project-detail-title">{copy.project[section.kind]}</p>
            <ul className="spatial-bullets">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      <ul
        className="spatial-tags"
        aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}
      >
        {project.technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
      {(project.links.demo || project.links.source) && (
        <p className="spatial-project-links">
          {project.links.demo && (
            <a className="spatial-text-link" href={project.links.demo} target="_blank" rel="noreferrer">
              {copy.project.visit}
            </a>
          )}
          {project.links.source && (
            <a className="spatial-text-link" href={project.links.source} target="_blank" rel="noreferrer">
              {copy.project.source}
            </a>
          )}
        </p>
      )}
    </article>
  );
}
