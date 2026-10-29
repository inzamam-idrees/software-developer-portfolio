import Link from "next/link";
import ExecutiveIcon from "./icon";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import { projectLinkLabel } from "./presentation.mjs";
import { demoScreenshot } from "./demo-media.mjs";

export default function ExecutiveProjectCard({ project, copy }) {
  const labels = copy.project;
  const href = projectPath(project);
  return (
    <article className="executive-project">
      <Link className="executive-project-media" href={href} tabIndex={-1} aria-hidden="true">
        {
          // Canonical cover image, or a sample demo URL until one is supplied; fixed ratio keeps the grid even.
          // eslint-disable-next-line @next/next/no-img-element
        }
        <img src={project.image || demoScreenshot(project.title)} alt="" width={960} height={600} loading="lazy" />
      </Link>
      <div className="executive-project-body">
        {(project.category || project.role) && <p className="executive-label">{[project.category, project.role].filter(Boolean).join(" / ")}</p>}
        <div className="executive-project-title"><h3><Link href={href}>{project.title}</Link></h3><Link className="executive-circle-link" href={href} tabIndex={-1} aria-hidden="true"><ExecutiveIcon /></Link></div>
        <p className="executive-project-description">{project.shortDescription}</p>
        {project.outcome && <p className="executive-project-outcome"><strong>{labels.outcome}</strong>{project.outcome}</p>}
        <ul className="executive-tech-list" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>{project.technologies.slice(0, 6).map((technology) => <li key={technology}>{technology}</li>)}</ul>
        <div className="executive-project-links">
          <Link href={href}>{labels.expand}<ExecutiveIcon /></Link>
          {Object.entries(project.links).map(([kind, url]) => <a href={url} target="_blank" rel="noreferrer" key={kind}>{projectLinkLabel(kind, labels)}<ExecutiveIcon kind="external" /></a>)}
        </div>
      </div>
    </article>
  );
}
