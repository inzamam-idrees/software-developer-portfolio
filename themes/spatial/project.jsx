import Link from "next/link";
import ProjectEntry from "./sections/project-entry";
import { createSpatialView } from "./view.mjs";

export default function SpatialProject({ portfolio, project }) {
  const { copy } = createSpatialView(portfolio);
  return (
    <div className="spatial-frame spatial-route">
      <header className="spatial-route-head">
        <Link className="spatial-text-link" href="/project">
          {copy.projectDetail.backToProjects}
        </Link>
      </header>
      <div className="spatial-project-list">
        <ProjectEntry project={project} copy={copy} headingLevel={1} detailed standalone />
      </div>
      <Link className="spatial-button is-primary" href="/#contact">
        {copy.projects.contactAction}
      </Link>
    </div>
  );
}
