import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import ProjectVisual from "./project-visual";
import { projectDetailSections } from "../presentation.mjs";

export default function ProjectEntry({
  project,
  copy,
  headingLevel = 3,
  detailed = false,
  standalone = false,
  featureIndex = null,
}) {
  const Heading = `h${headingLevel}`;
  const editorial = [
    [copy.project.problem, project.problem || (featureIndex !== null ? copy.home.projects.missingProblem : null)],
    [copy.project.solution, project.solution || (featureIndex !== null ? copy.home.projects.missingApproach : null)],
    [copy.project.outcome, project.outcome || (featureIndex !== null ? copy.home.projects.missingOutcome : null)],
  ].filter(([, value]) => value);
  return (
    <article className={`spatial-project ${featureIndex !== null ? "spatial-project-feature" : ""}`} data-feature-index={featureIndex} id={`project-${project.id}`} data-project-id={`project:${project.id}`}>
      {featureIndex !== null && <div className="spatial-project-visual"><ProjectVisual project={project} /><span className="spatial-project-number" aria-hidden="true">{String(featureIndex + 1).padStart(2, "0")}</span></div>}
      <div className="spatial-project-main">
      <div className="spatial-project-head">
        {project.category && <p className="spatial-project-category">{project.category}</p>}
        <Heading>
          {standalone ? project.title : <Link href={projectPath(project)}>{project.title}</Link>}
        </Heading>
        <p className="spatial-project-role">{project.role}</p>
      </div>
      <p className="spatial-project-summary">{project.shortDescription}</p>
      {standalone && project.longDescription && (
        <div className="spatial-project-detail">
          <p className="spatial-project-detail-title">{copy.projectDetail.overview}</p>
          <p>{project.longDescription}</p>
        </div>
      )}
      {featureIndex !== null && <Link className="spatial-feature-link" href={projectPath(project)}>{copy.home.projects.viewDetail}<span aria-hidden="true">↗</span></Link>}
      </div>
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
