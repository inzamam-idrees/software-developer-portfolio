import Link from "next/link";
import { projectPath } from "@/lib/portfolio/projects.mjs";
import LoadMore from "./client/load-more";
import { SectionHeading } from "./sections";

// ── Constants ──
// Reference grid: the intro is the first masonry item, then a batch of cards.
const BATCH = 6;
// Flat covers (no project image) vary in height so the columns stagger like
// the reference's product photos. Tones cycle in CSS by data-tone.
const COVER_RATIOS = ["4 / 5", "1 / 1", "4 / 3", "1 / 1", "4 / 5", "4 / 3"];
const TONES = 6;

/** Project image, or a flat-colour cover with the category and title. */
export function WorkCover({ project, index, ratio = true }) {
  if (project.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.image} alt="" width={800} height={600} loading="lazy" decoding="async" />;
  }
  return <span className="sienna-work-cover" data-tone={index % TONES} style={ratio ? { aspectRatio: COVER_RATIOS[index % COVER_RATIOS.length] } : undefined} aria-hidden="true">
    {project.category && <span className="sienna-work-cover-kicker">{project.category}</span>}
    <span className="sienna-work-cover-title">{project.title}</span>
  </span>;
}

function WorkCard({ project, index }) {
  return <Link className="sienna-work-card" href={projectPath(project)}>
    <figure className="sienna-work-banner"><WorkCover project={project} index={index} /></figure>
    <span className="sienna-work-content">
      <span className="sienna-h4 sienna-work-title">{project.title}</span>
      {project.category && <span className="sienna-work-meta">{project.category}</span>}
    </span>
  </Link>;
}

/** Masonry list with the heading as its first item; cards past `batch` wait for Load more. */
export function WorkList({ projects, heading, batch = Infinity, loadMore }) {
  const listId = heading.id + "-list";
  return <>
    <ul className="sienna-work-list" id={listId}>
      <li><SectionHeading {...heading} /></li>
      {projects.map((project, index) => <li key={project.id} className={index >= batch ? "sienna-work-extra" : undefined} data-reveal="up" style={{ "--i": index % 3 }}>
        <WorkCard project={project} index={index} />
      </li>)}
    </ul>
    {projects.length > batch && <LoadMore list={listId} batch={batch} label={loadMore} />}
  </>;
}

// ── My Works (reference .project) ──
export default function Works({ view }) {
  const works = view.copy.home.projects;
  const projects = view.orderedProjects;
  return <section className="sienna-section sienna-works" id="projects" aria-labelledby="sienna-works-title">
    <WorkList projects={projects} batch={BATCH} loadMore={works.loadMore} heading={{ id: "sienna-works-title", label: works.label, title: works.heading, text: projects.length ? works.intro : works.empty }} />
  </section>;
}
