import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import { projectDetailSections, projectLinkLabel } from "./presentation.mjs";

function ProjectLink({ href, children }) {
  return <a href={href} target="_blank" rel="noreferrer">{children} <span aria-hidden="true">↗</span></a>;
}

export default function ExecutiveProjectCard({ project, index, copy, detailed = false }) {
  const labels = copy.project;
  const links = Object.entries(project.links);
  return (
    <article className="executive-project">
      <div className="executive-project-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
      <div className="executive-project-main">
        <div className="executive-project-heading">
          <div>
            <p className="executive-kicker">{[project.category, project.role].filter(Boolean).join(" / ")}</p>
            <h3><Link href={projectPath(project)}>{project.title}</Link></h3>
          </div>
          {links.length > 0 && <div className="executive-project-links">{links.map(([kind, href]) => <ProjectLink href={href} key={kind}>{projectLinkLabel(kind, labels)}</ProjectLink>)}</div>}
        </div>
        {detailed && project.problem && project.solution ? (
          <div className="executive-project-story">
            <div><p className="executive-label">{labels.challenge}</p><p>{project.problem}</p></div>
            <div><p className="executive-label">{labels.approach}</p><p>{project.solution}</p></div>
            {project.outcome && <div><p className="executive-label">{labels.outcome}</p><p>{project.outcome}</p></div>}
          </div>
        ) : <p className="executive-project-description">{project.longDescription || project.shortDescription}</p>}
        {detailed && projectDetailSections(project).map(({ kind, items }) => (
          <div className="executive-project-details" key={kind}>
            <p className="executive-label">{labels[kind]}</p>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
        <ul className="executive-tech-list" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
      </div>
    </article>
  );
}
