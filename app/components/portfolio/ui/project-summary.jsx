import { FiArrowUpRight } from "react-icons/fi";
import { projectDetailSections } from "@/themes/shared/project-detail.mjs";

const detailLabels = { features: "KEY FEATURES", responsibilities: "MY ROLE" };
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
  featured = false,
}) {
  const Heading = featured ? "h3" : "h2";
  const demo = publicUrl(project.links.demo),
    code = publicUrl(project.links.source);
  return (
    <article
      className={`project-chapter ${featured ? "featured" : "compact-project"}`}
    >
      <div className="project-meta">
        <span className="eyebrow accent">
          {String(index + 1).padStart(2, "0")} /{" "}
          {project.category || "Selected application"}
        </span>
        <span className="eyebrow muted">{project.role}</span>
      </div>
      <div className="project-grid">
        <div className="project-copy" data-reveal>
          <Heading>{project.title}</Heading>
          <p className="project-lead">
            {project.problem || project.shortDescription}
          </p>
          {project.solution && project.outcome && (
            <dl className="project-details">
              <div>
                <dt>THE BUILD</dt>
                <dd>{project.solution}</dd>
              </div>
              <div>
                <dt>THE RESULT</dt>
                <dd>{project.outcome}</dd>
              </div>
            </dl>
          )}
          {projectDetailSections(project).map(({ kind, items }) => (
            <div className="project-detail-list" key={kind}>
              <p className="eyebrow muted">{detailLabels[kind]}</p>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <ul
            className="technology-list"
            aria-label={`${project.title} technologies`}
          >
            {project.technologies.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          {(demo || code) && (
            <div className="project-links">
              {demo && (
                <a href={demo} target="_blank" rel="noreferrer">
                  Visit project <FiArrowUpRight aria-hidden="true" />
                </a>
              )}
              {code && (
                <a href={code} target="_blank" rel="noreferrer">
                  View source <FiArrowUpRight aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
        {featured && (
          <div
            className={`system-diagram diagram-${project.id}`}
            aria-label={`${project.title}: conceptual system diagram, not a product screenshot`}
            role="img"
          >
            <div className="diagram-top">
              <span>ARCHITECTURE STUDY</span>
              <span>SYS_{visual.mark}</span>
            </div>
            <div className="diagram-world" aria-hidden="true">
              <div className="diagram-orbit orbit-one" />
              <div className="diagram-orbit orbit-two" />
              <div className="diagram-core">
                <span>{visual.mark}</span>
                <small>
                  CONNECTED
                  <br />
                  BY DESIGN
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
                CONCEPTUAL SYSTEM /{" "}
                {(visual.category || "Selected application").toUpperCase()}
              </span>
              <span>↗</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
