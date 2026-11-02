import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectDetailSections } from "../shared/project-detail.mjs";
import { createSiennaPresentation } from "./presentation.mjs";
import { SectionHeading } from "./sections";
import { WorkCover } from "./works";
import Icon from "./icon";

// ── Project detail ──
// Reference grammar: heading block with the rotated label beside the cover,
// then the write-up with a card holding role and stack.
export default function SiennaProject({ portfolio, project }) {
  const view = createSiennaPresentation(portfolio);
  const copy = view.copy;
  const labels = copy.project;
  const index = Math.max(0, view.orderedProjects.findIndex((item) => item.id === project.id));
  const links = project.links ?? {};
  return <div className="sienna-container sienna-route">
    <Link className="sienna-back" href="/project"><Icon name="back" />{copy.projectDetail.backToProjects}</Link>
    <article className="sienna-project" aria-labelledby="sienna-project-title">
      <header className="sienna-project-head">
        <SectionHeading id="sienna-project-title" level={1} label={project.category || labels.details} title={project.title} text={project.shortDescription}>
          {(links.demo || links.source) && <div className="sienna-btn-group" data-reveal="up">
            {links.demo && <a className="sienna-btn sienna-btn-secondary" href={links.demo} target="_blank" rel="noopener noreferrer">{labels.visit}</a>}
            {links.source && <a className="sienna-btn sienna-btn-primary" href={links.source} target="_blank" rel="noopener noreferrer">{labels.source}</a>}
          </div>}
        </SectionHeading>
        <figure className="sienna-project-cover" data-reveal="up"><WorkCover project={project} index={index} ratio={false} /></figure>
      </header>
      <div className="sienna-project-body">
        <div className="sienna-project-main">
          {project.longDescription && <section><h2 className="sienna-h4 sienna-group-title">{copy.projectDetail.overview}</h2><p className="sienna-section-text">{project.longDescription}</p></section>}
          {["problem", "solution", "outcome"].map((key) => project[key] && <section key={key}><h2 className="sienna-h4 sienna-group-title">{labels[key]}</h2><p className="sienna-section-text">{project[key]}</p></section>)}
          {projectDetailSections(project).map(({ kind, items }) => <section key={kind}>
            <h2 className="sienna-h4 sienna-group-title">{labels[kind]}</h2>
            <ul className="sienna-timeline-highlights">{items.map((item, position) => <li key={position}>{item}</li>)}</ul>
          </section>)}
        </div>
        <aside className="sienna-card sienna-project-aside" data-reveal="up">
          {project.role && <><h2 className="sienna-group-title">{labels.role}</h2><p className="sienna-project-role">{project.role}</p></>}
          {!!project.technologies?.length && <>
            <h2 className="sienna-group-title">{labels.stack}</h2>
            <ul className="sienna-chips" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>{project.technologies.map((name) => <li key={name}>{name}</li>)}</ul>
          </>}
        </aside>
      </div>
    </article>
  </div>;
}
