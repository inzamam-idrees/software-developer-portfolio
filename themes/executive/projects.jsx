import Link from "next/link";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveProjectCard from "./project-card";

export default function ExecutiveProjects({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header">
        <p className="executive-kicker">Project archive · {String(view.projects.length).padStart(2, "0")} builds</p>
        <h1>Engineering work, in context.</h1>
        <p>Selected product, platform, and business-application work across frontend and backend systems.</p>
      </header>
      <div className="executive-projects executive-project-archive">{view.projects.map((project, index) => <ExecutiveProjectCard key={project.id} project={project} index={index} detailed={Boolean(project.problem && project.solution)} />)}</div>
      <aside className="executive-route-cta"><p className="executive-kicker">Have a project in mind?</p><h2>{view.contact.heading}</h2><Link className="executive-button primary" href="/#contact">Start a conversation <span aria-hidden="true">→</span></Link></aside>
    </div>
  );
}
