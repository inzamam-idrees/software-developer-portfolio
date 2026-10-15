import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ProjectSummary from "@/app/components/portfolio/ui/project-summary";
import { createCinematicView } from "./view.mjs";

export default function CinematicProjects({ portfolio }) {
  const { projects, copy } = createCinematicView(portfolio);

  return (
    <div className="container route-page">
      <p className="eyebrow accent">
        {formatCopy(copy.projects.eyebrow, {
          count: String(projects.length).padStart(2, "0"),
        })}
      </p>
      <h1>{copy.projects.heading}</h1>
      {projects.map((project, index) => (
        <ProjectSummary
          key={project.id}
          project={project}
          index={index}
          copy={copy}
        />
      ))}
      <Link href="/#contact" className="button primary">
        {copy.projects.contactAction}
      </Link>
    </div>
  );
}
