import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectDetailSections } from "../shared/project-detail.mjs";
import Icon from "./icon";

export default function ProjectContent({ project, copy, detailed = false, modal = false, onPreview, titleId }) {
  const labels = copy.project;
  const SectionHeading = detailed ? "h2" : "h4";
  const Heading = detailed ? "h1" : "h3";
  return <div className="prism-project-layout">
    <div>
      {(project.category || project.date) && <div className="prism-project-meta">{project.category && <span className="prism-project-category">{project.category}</span>}{project.date && <span className="prism-label">{project.date}</span>}</div>}
      <Heading id={titleId}>{project.title}</Heading>
      <p className="prism-project-subtitle">{project.shortDescription}</p>
      {project.longDescription && <p>{project.longDescription}</p>}
      {detailed && ["problem", "solution", "outcome"].map((key) => project[key] && <section className="prism-story" key={key}><h2>{labels[key]}</h2><p>{project[key]}</p></section>)}
      {projectDetailSections(project).filter(({ kind }) => detailed || kind === "features").map(({ kind, items }) => <section className="prism-story" key={kind}><SectionHeading className={detailed ? undefined : "prism-sr-only"}>{labels[kind]}</SectionHeading><ul className="prism-check-list">{items.map((item, index) => <li key={index}><Icon name="check" /><span>{item}</span></li>)}</ul></section>)}
      <p className="prism-label">{labels.stack}</p>
      <ul className="prism-tags" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>{project.technologies.map((name) => <li key={name}>{name}</li>)}</ul>
      <div className="prism-actions">
        {project.links.source && <a className="prism-button" href={project.links.source} target="_blank" rel="noreferrer"><Icon name="github" />{labels.source}</a>}
        {project.links.demo && <a className="prism-button prism-primary" href={project.links.demo} target="_blank" rel="noreferrer">{labels.visit}<Icon name="arrow" /></a>}
        {onPreview && <button type="button" className="prism-button prism-primary" onClick={onPreview} data-prism-magnetic><Icon name="layers" />{labels.preview}</button>}
        {!detailed && (modal || !onPreview) && <Link className={modal ? "prism-button prism-primary" : "prism-button"} href={`/project/${project.slug}`}>{labels.details}<Icon name="arrow" /></Link>}
      </div>
    </div>
    {detailed && <aside className="prism-card prism-project-aside"><p className="prism-label">{labels.role}</p><p>{project.role}</p><p className="prism-label">{labels.stack}</p><ul className="prism-check-list">{project.technologies.map((name) => <li key={name}><Icon name="check" />{name}</li>)}</ul></aside>}
  </div>;
}
