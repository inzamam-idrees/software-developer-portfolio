import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ProjectFocus from "../client/project-focus";
import ProjectEntry from "./project-entry";

export default function Projects({ view }) {
  const { copy } = view;
  const home = copy.home.projects;
  return (
    <section className="spatial-section" id="projects" aria-labelledby="spatial-projects-title">
      <div className="spatial-frame">
        <div className="spatial-section-head">
          <h2 id="spatial-projects-title" className="spatial-section-title">
            {home.heading}
          </h2>
          <p>{home.intro}</p>
        </div>
        <div className="spatial-side-layout">
          <ProjectFocus className="spatial-project-list">
            {view.featuredProjects.map((project) => (
              <ProjectEntry key={project.id} project={project} copy={copy} />
            ))}
          </ProjectFocus>
          <div className="spatial-side-column" aria-hidden="true">
            <div className="spatial-slot spatial-slot-side" data-spatial-slot="projects" />
          </div>
        </div>
        <Link className="spatial-button" href="/project">
          {formatCopy(home.exploreAll, { count: view.projects.length })}
        </Link>
      </div>
    </section>
  );
}
