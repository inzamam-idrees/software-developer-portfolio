import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ProjectFocus from "../client/project-focus";
import AccentText from "./accent-text";
import ProjectEntry from "./project-entry";

export default function Projects({ view }) {
  const { copy } = view;
  const home = copy.home.projects;
  return (
    <section className="spatial-section spatial-projects-section" id="projects" aria-labelledby="spatial-projects-title">
      <div className="spatial-frame">
        <div className="spatial-section-head spatial-projects-heading">
          <div><p className="spatial-eyebrow">{home.eyebrow}</p><h2 id="spatial-projects-title" className="spatial-section-title"><AccentText>{home.heading}</AccentText></h2></div>
          <p>{home.intro}</p>
        </div>
        <ProjectFocus className="spatial-project-list">
          {view.featuredProjects.map((project, index) => <ProjectEntry key={project.id} project={project} copy={copy} featureIndex={index} />)}
        </ProjectFocus>
        <div className="spatial-projects-end"><Link className="spatial-button is-secondary" href="/project">{formatCopy(home.exploreAll, { count: view.projects.length })}<span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}
