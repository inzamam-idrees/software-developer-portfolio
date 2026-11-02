import { createCreativePresentation } from "./presentation.mjs";
import ProjectCard from "./project-card";

export default function CreativeProjects({ portfolio }) {
  const view = createCreativePresentation(portfolio);
  const copy = view.copy;
  return <div className="creative-route creative-frame">
    <header className="creative-route-heading"><p className="creative-badge">{copy.projects.label}</p><h1>{copy.projects.heading}</h1><p className="creative-lead">{copy.projects.intro}</p></header>
    {view.projects.length
      ? <div className="creative-project-grid">{view.projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} copy={copy} headingLevel={2} reveal />)}</div>
      : <p className="creative-card creative-empty">{copy.home.projects.empty}</p>}
  </div>;
}
