import Image from "next/image";
import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { ProjectCover } from "./art";

export default function ProjectCard({ project, index, copy, headingLevel = 3, reveal = false }) {
  const Heading = `h${headingLevel}`;
  return <article className="creative-project-card" data-reveal={reveal ? "up" : undefined} style={reveal ? { "--i": index % 3 } : undefined}>
    <div className="creative-project-media">
      {project.image
        ? <Image src={project.image} alt="" width={640} height={400} sizes="(max-width: 767px) 92vw, 33vw" />
        : <ProjectCover title={project.title} variant={index} />}
    </div>
    <div className="creative-project-body">
      <Heading><Link href={`/project/${project.slug}`} className="creative-card-link">{project.title}</Link></Heading>
      <ul className="creative-project-tech" aria-label={formatCopy(copy.projects.technologiesLabel, { title: project.title })}>
        {project.technologies.slice(0, 3).map((name) => <li key={name}>{name}</li>)}
      </ul>
      <p className="creative-project-summary">{project.category ?? project.shortDescription}</p>
    </div>
  </article>;
}
