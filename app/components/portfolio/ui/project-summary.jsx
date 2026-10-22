import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import { projectDetailSections } from "@/themes/shared/project-detail.mjs";
function publicUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export default function ProjectSummary({
  project,
  visual,
  index,
  copy,
  featured = false,
  detail = false,
}) {
  const labels = copy.project;
  const Heading = detail ? "h1" : featured ? "h3" : "h2";
  const demo = publicUrl(project.links.demo),
    code = publicUrl(project.links.source);
  return (
    <article
      className={`project-chapter ${featured ? "featured" : "compact-project"}`}
    >
      <div className="project-meta">
        <span className="eyebrow accent">
          {String(index + 1).padStart(2, "0")} /{" "}
          {project.category || labels.fallbackCategory}
        </span>
        <span className="eyebrow muted">{project.role}</span>
      </div>
      <div className="project-grid">
        <div className="project-copy" data-reveal>
          <Heading>
            {detail ? (
              project.title
            ) : (
              <Link href={projectPath(project)}>{project.title}</Link>
            )}
          </Heading>
          <p className="project-lead">
            {detail
              ? project.shortDescription
              : project.problem || project.shortDescription}
          </p>
          {detail && project.longDescription && (
            <div className="project-detail-list">
              <p className="eyebrow muted">{copy.projectDetail.overview}</p>
              <p>{project.longDescription}</p>
            </div>
          )}
          {project.solution && project.outcome && (
            <dl className="project-details">
              {detail && project.problem && (
                <div>
                  <dt>{labels.problem}</dt>
                  <dd>{project.problem}</dd>
                </div>
              )}
              <div>
                <dt>{labels.build}</dt>
                <dd>{project.solution}</dd>
              </div>
              <div>
                <dt>{labels.result}</dt>
                <dd>{project.outcome}</dd>
              </div>
            </dl>
          )}
          {projectDetailSections(project).map(({ kind, items }) => (
            <div className="project-detail-list" key={kind}>
              <p className="eyebrow muted">{labels[kind]}</p>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <ul
            className="technology-list"
            aria-label={formatCopy(copy.projects.technologiesLabel, {
              title: project.title,
            })}
          >
            {project.technologies.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          {(demo || code) && (
            <div className="project-links">
              {demo && (
                <a href={demo} target="_blank" rel="noreferrer">
                  {labels.visit} <FiArrowUpRight aria-hidden="true" />
                </a>
              )}
              {code && (
                <a href={code} target="_blank" rel="noreferrer">
                  {labels.source} <FiArrowUpRight aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
        {featured && (
          <div
            className={`system-diagram diagram-${project.id}`}
            aria-label={formatCopy(labels.diagram.label, { title: project.title })}
            role="img"
          >
            <div className="diagram-top">
              <span>{labels.diagram.title}</span>
              <span>
                {labels.diagram.codePrefix}
                {visual.mark}
              </span>
            </div>
            <div className="diagram-world" aria-hidden="true">
              <div className="diagram-orbit orbit-one" />
              <div className="diagram-orbit orbit-two" />
              <div className="diagram-core">
                <span>{visual.mark}</span>
                <small>
                  {labels.diagram.coreLead}
                  <br />
                  {labels.diagram.coreTrail}
                </small>
              </div>
              {visual.nodes.map((node, i) => (
                <span key={node} className={`diagram-node node-${i}`}>
                  {node}
                </span>
              ))}
            </div>
            <div className="diagram-bottom">
              <span>
                {labels.diagram.footer}{" "}
                {(visual.category || labels.fallbackCategory).toUpperCase()}
              </span>
              <span>↗</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
