import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ChapterHeading from "../ui/chapter-heading";
import ProjectSummary from "../ui/project-summary";
export default function SelectedWork({ projects, projectCount, copy }) {
  const section = copy.home.selectedWork;
  return (
    <section
      id="projects"
      className="chapter container work-section"
      aria-labelledby="projects-heading"
    >
      <ChapterHeading
        id="projects"
        number="01"
        label={section.label}
        title={section.heading}
        description={section.description}
      />
      {projects.map((project, index) => (
        <ProjectSummary
          key={project.id}
          project={project}
          visual={project.diagram}
          index={index}
          copy={copy}
          featured
        />
      ))}
      <Link className="button secondary" href="/project">
        {formatCopy(section.exploreAll, { count: projectCount })}
      </Link>
    </section>
  );
}
