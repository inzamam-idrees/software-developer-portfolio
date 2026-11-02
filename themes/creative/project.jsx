import Image from "next/image";
import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectDetailSections } from "../shared/project-detail.mjs";
import { createCreativePresentation } from "./presentation.mjs";
import { ProjectCover } from "./art";
import Icon from "./icon";

export default function CreativeProject({ portfolio, project }) {
  const view = createCreativePresentation(portfolio);
  const copy = view.copy;
  const labels = copy.project;
  const index = Math.max(0, view.projects.findIndex((item) => item.id === project.id));
  return <div className="creative-route creative-frame">
    <Link className="creative-text-link creative-back" href="/project"><Icon name="previous" />{copy.projectDetail.backToProjects}</Link>
    <article className="creative-project-detail">
      <header className="creative-route-heading">
        {(project.category || project.date) && <p className="creative-badge">{[project.category, project.date].filter(Boolean).join(" · ")}</p>}
        <h1>{project.title}</h1>
        <p className="creative-lead">{project.shortDescription}</p>
        <div className="creative-actions">
          {project.links.demo && <a className="creative-button creative-button-primary" href={project.links.demo} target="_blank" rel="noreferrer">{labels.visit}<Icon name="arrow" /></a>}
          {project.links.source && <a className="creative-button creative-button-light" href={project.links.source} target="_blank" rel="noreferrer"><Icon name="github" />{labels.source}</a>}
        </div>
      </header>
      <div className="creative-project-media creative-project-hero">
        {project.image ? <Image src={project.image} alt="" width={1200} height={720} sizes="(max-width: 1024px) 92vw, 1100px" priority /> : <ProjectCover title={project.title} variant={index} />}
      </div>
      <div className="creative-project-columns">
        <div>
          <h2 className="creative-subheading">{copy.projectDetail.overview}</h2>
          {project.longDescription && <p>{project.longDescription}</p>}
          {["problem", "solution", "outcome"].map((key) => project[key] && <section key={key}><h2 className="creative-subheading">{labels[key]}</h2><p>{project[key]}</p></section>)}
          {projectDetailSections(project).map(({ kind, items }) => <section key={kind}><h2 className="creative-subheading">{labels[kind]}</h2><ul className="creative-checks">{items.map((item, position) => <li key={position}><Icon name="check" /><span>{item}</span></li>)}</ul></section>)}
        </div>
        <aside className="creative-card creative-project-aside">
          {project.role && <><p className="creative-eyebrow">{labels.role}</p><p>{project.role}</p></>}
          <p className="creative-eyebrow">{labels.stack}</p>
          <ul className="creative-tags" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>{project.technologies.map((name) => <li key={name}>{name}</li>)}</ul>
        </aside>
      </div>
    </article>
  </div>;
}
