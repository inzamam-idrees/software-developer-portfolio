import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ProjectEntry from "./sections/project-entry";
import { createSpatialPresentation } from "./presentation.mjs";

export default function SpatialProjects({ portfolio }) {
  const view = createSpatialPresentation(portfolio);
  const { copy } = view;
  return (
    <div className="spatial-frame spatial-route">
      <header className="spatial-route-head">
        <p className="spatial-route-count">
          {formatCopy(copy.projects.count, { count: view.projects.length })}
        </p>
        <h1>{copy.projects.heading}</h1>
      </header>
      <div className="spatial-project-list">
        {view.projects.map((project) => (
          <ProjectEntry key={project.id} project={project} copy={copy} headingLevel={2} detailed />
        ))}
      </div>
      <Link className="spatial-button is-primary" href="/#contact">
        {copy.projects.contactAction}
      </Link>
    </div>
  );
}
