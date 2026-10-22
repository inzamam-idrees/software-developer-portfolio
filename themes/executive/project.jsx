import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createExecutivePresentation, projectDetailSections, projectLinkLabel } from "./presentation.mjs";

export default function ExecutiveProject({ portfolio, project }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const labels = copy.project;
  const story = [
    [labels.challenge, project.problem],
    [labels.approach, project.solution],
    [labels.outcome, project.outcome],
  ].filter(([, value]) => value);
  const links = Object.entries(project.links);
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header">
        <p className="executive-back"><Link className="executive-text-link" href="/project">{copy.projectDetail.backToProjects}</Link></p>
        <p className="executive-kicker">{[project.category, project.role].filter(Boolean).join(" / ")}</p>
        <h1>{project.title}</h1>
        <p>{project.shortDescription}</p>
      </header>
      <article className="executive-project-main executive-project-page">
        {project.longDescription && (
          <div className="executive-project-details">
            <p className="executive-label">{copy.projectDetail.overview}</p>
            <p className="executive-project-description">{project.longDescription}</p>
          </div>
        )}
        {story.length > 0 && (
          <div className="executive-project-story">
            {story.map(([label, value]) => <div key={label}><p className="executive-label">{label}</p><p>{value}</p></div>)}
          </div>
        )}
        {projectDetailSections(project).map(({ kind, items }) => (
          <div className="executive-project-details" key={kind}>
            <p className="executive-label">{labels[kind]}</p>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
        <ul className="executive-tech-list" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>
          {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
        </ul>
        {links.length > 0 && <div className="executive-project-links executive-project-page-links">{links.map(([kind, href]) => <a href={href} target="_blank" rel="noreferrer" key={kind}>{projectLinkLabel(kind, labels)} <span aria-hidden="true">↗</span></a>)}</div>}
      </article>
      <aside className="executive-route-cta"><p className="executive-kicker">{copy.projects.ctaKicker}</p><h2>{view.contact.heading}</h2><Link className="executive-button primary" href="/#contact">{copy.actions.startConversation} <span aria-hidden="true">→</span></Link></aside>
    </div>
  );
}
