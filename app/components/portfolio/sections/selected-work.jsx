import Link from "next/link";
import ChapterHeading from "../ui/chapter-heading";
import ProjectSummary from "../ui/project-summary";
export default function SelectedWork({ projects, projectCount }) {
  return (
    <section
      id="projects"
      className="chapter container work-section"
      aria-labelledby="projects-heading"
    >
      <ChapterHeading
        id="projects"
        number="01"
        title="Built for the real world."
        description="A selection of platforms connecting complex business needs with thoughtful software."
      />
      {projects.map((project, index) => (
        <ProjectSummary
          key={project.id}
          project={project}
          visual={project.diagram}
          index={index}
          featured
        />
      ))}
      <Link className="button secondary" href="/project">
        Explore all {projectCount} projects ↗
      </Link>
    </section>
  );
}
