import { FiArrowUpRight } from "react-icons/fi";
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
  editorial,
  index,
  featured = false,
}) {
  const Heading = featured ? "h3" : "h2";
  const demo = publicUrl(project.demo),
    code = publicUrl(project.code);
  return (
    <article
      className={`project-chapter ${featured ? "featured" : "compact-project"}`}
    >
      <div className="project-meta">
        <span className="eyebrow accent">
          {String(index + 1).padStart(2, "0")} /{" "}
          {editorial?.category || "Selected application"}
        </span>
        <span className="eyebrow muted">{project.role}</span>
      </div>
      <div className="project-grid">
        <div className="project-copy" data-reveal>
          <Heading>{project.name}</Heading>
          <p className="project-lead">
            {editorial?.problem || project.description}
          </p>
          {editorial && (
            <dl className="project-details">
              <div>
                <dt>THE BUILD</dt>
                <dd>{editorial.solution}</dd>
              </div>
              <div>
                <dt>THE RESULT</dt>
                <dd>{editorial.outcome}</dd>
              </div>
            </dl>
          )}
          <ul
            className="technology-list"
            aria-label={`${project.name} technologies`}
          >
            {[...new Set(project.tools)].map((tool) => (
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
            aria-label={`${project.name}: conceptual system diagram, not a product screenshot`}
            role="img"
          >
            <div className="diagram-top">
              <span>ARCHITECTURE STUDY</span>
              <span>SYS_{editorial.mark}</span>
            </div>
            <div className="diagram-world" aria-hidden="true">
              <div className="diagram-orbit orbit-one" />
              <div className="diagram-orbit orbit-two" />
              <div className="diagram-core">
                <span>{editorial.mark}</span>
                <small>
                  CONNECTED
                  <br />
                  BY DESIGN
                </small>
              </div>
              {editorial.nodes.map((node, i) => (
                <span key={node} className={`diagram-node node-${i}`}>
                  {node}
                </span>
              ))}
            </div>
            <div className="diagram-bottom">
              <span>
                CONCEPTUAL SYSTEM / {editorial.category.toUpperCase()}
              </span>
              <span>↗</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
