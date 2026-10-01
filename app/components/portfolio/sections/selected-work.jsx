import Link from "next/link";
import { projectsData } from "@/utils/data/projects-data";
import {
  featuredProjectIds,
  projectEditorial,
} from "@/utils/data/portfolio-content";
import ChapterHeading from "../ui/chapter-heading";
import ProjectSummary from "../ui/project-summary";
export default function SelectedWork() {
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
      {featuredProjectIds.map((id, index) => (
        <ProjectSummary
          key={id}
          project={projectsData.find((p) => p.id === id)}
          editorial={projectEditorial[id]}
          index={index}
          featured
        />
      ))}
      <Link className="button secondary" href="/project">
        Explore all eight projects ↗
      </Link>
    </section>
  );
}
