function ProjectLink({ href, children }) {
  return <a href={href} target="_blank" rel="noreferrer">{children} <span aria-hidden="true">↗</span></a>;
}

export default function ExecutiveProjectCard({ project, index, detailed = false }) {
  const links = Object.entries(project.links);
  return (
    <article className="executive-project">
      <div className="executive-project-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
      <div className="executive-project-main">
        <div className="executive-project-heading">
          <div>
            <p className="executive-kicker">{[project.category, project.role].filter(Boolean).join(" / ")}</p>
            <h3>{project.title}</h3>
          </div>
          {links.length > 0 && <div className="executive-project-links">{links.map(([kind, href]) => <ProjectLink href={href} key={kind}>{kind === "demo" ? "View project" : kind}</ProjectLink>)}</div>}
        </div>
        {detailed && project.problem && project.solution ? (
          <div className="executive-project-story">
            <div><p className="executive-label">Challenge</p><p>{project.problem}</p></div>
            <div><p className="executive-label">Approach</p><p>{project.solution}</p></div>
            {project.outcome && <div><p className="executive-label">Outcome</p><p>{project.outcome}</p></div>}
          </div>
        ) : <p className="executive-project-description">{project.longDescription || project.shortDescription}</p>}
        <ul className="executive-tech-list" aria-label={`${project.title} technologies`}>
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </div>
    </article>
  );
}
