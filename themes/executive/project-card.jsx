import Link from "next/link";
import ExecutiveIcon from "./icon";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import { projectDetailSections, projectLinkLabel } from "./presentation.mjs";

export default function ExecutiveProjectCard({ project, copy, detailed = false }) {
  const labels = copy.project;
  return (
    <article className="executive-project">
      <div className="executive-project-heading">
        <p className="executive-label">{project.category}</p>
        <h3><Link href={projectPath(project)}>{project.title}</Link></h3>
        {project.role && <p className="executive-project-role">{project.role}</p>}
      </div>
      <div className="executive-project-main">
        <p className="executive-project-description">{project.shortDescription}</p>
        {project.outcome && <p className="executive-project-outcome"><strong>{labels.outcome}</strong>{project.outcome}</p>}
        <ul className="executive-tech-list" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        <details className="executive-project-disclosure">
          <summary><span>{labels.expand}</span><ExecutiveIcon /></summary>
          <div className="executive-disclosure-grid"><div className="executive-disclosure-body">
          {detailed && <div className="executive-project-story">
            {[[labels.challenge, project.problem], [labels.approach, project.solution]].filter(([, value]) => value).map(([label, value]) => <div key={label}><h4>{label}</h4><p>{value}</p></div>)}
          </div>}
          {project.longDescription && <p>{project.longDescription}</p>}
          {projectDetailSections(project).map(({ kind, items }) => <div className="executive-project-details" key={kind}><h4>{labels[kind]}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
          <div className="executive-project-links"><Link href={projectPath(project)}>{labels.viewProject}</Link>{Object.entries(project.links).map(([kind, href]) => <a href={href} target="_blank" rel="noreferrer" key={kind}>{projectLinkLabel(kind, labels)}</a>)}</div>
          </div></div>
        </details>
      </div>
    </article>
  );
}
