import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import ChapterHeading from "../ui/chapter-heading";
import ProjectCarousel from "../ui/project-carousel";

function publicUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function SelectedWork({ projects, projectCount, copy }) {
  const section = copy.home.selectedWork;
  const items = projects.map((project) => ({
    id: project.id,
    title: project.title,
    image: project.image ?? null,
    category: project.category || copy.project.fallbackCategory,
    lead: project.problem || project.shortDescription,
    technologies: project.technologies,
    technologiesLabel: formatCopy(copy.projects.technologiesLabel, { title: project.title }),
    href: projectPath(project),
    demo: publicUrl(project.links.demo),
    source: publicUrl(project.links.source),
  }));
  const labels = {
    label: section.carouselLabel,
    previous: section.previous,
    next: section.next,
    details: section.details,
    position: section.position,
    visit: copy.project.visit,
    source: copy.project.source,
  };
  return (
    <section
      id="projects"
      className="chapter container work-section"
      aria-labelledby="projects-heading"
    >
      <div className="work-layout">
        <div className="work-intro">
          <ChapterHeading
            id="projects"
            number="04"
            label={section.label}
            title={section.heading}
            description={section.description}
          />
          <Link className="button secondary" href="/project">
            {formatCopy(section.exploreAll, { count: projectCount })}
          </Link>
        </div>
        <ProjectCarousel items={items} labels={labels} />
      </div>
    </section>
  );
}
