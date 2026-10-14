import Link from "next/link";
import ProjectSummary from "@/app/components/portfolio/ui/project-summary";
import { createCinematicView } from "./view.mjs";

export default function CinematicProjects({ portfolio }) {
  const { projects } = createCinematicView(portfolio);

  return (
    <div className="container route-page">
      <p className="eyebrow accent">
        PROJECT ARCHIVE / {String(projects.length).padStart(2, "0")} BUILDS
      </p>
      <h1>Work, in detail.</h1>
      {projects.map((project, index) => (
        <ProjectSummary key={project.id} project={project} index={index} />
      ))}
      <Link href="/#contact" className="button primary">
        Let’s talk about your project ↗
      </Link>
    </div>
  );
}
