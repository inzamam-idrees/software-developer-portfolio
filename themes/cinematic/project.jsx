import Link from "next/link";
import ProjectSummary from "@/app/components/portfolio/ui/project-summary";
import { createCinematicView } from "./view.mjs";

export default function CinematicProject({ portfolio, project }) {
  const { projects, copy } = createCinematicView(portfolio);
  const index = projects.findIndex((candidate) => candidate.id === project.id);

  return (
    <div className="container route-page">
      <Link href="/project" className="text-link">
        {copy.projectDetail.backToProjects}
      </Link>
      <ProjectSummary project={project} index={index} copy={copy} detail />
      <Link href="/#contact" className="button primary">
        {copy.projects.contactAction}
      </Link>
    </div>
  );
}
