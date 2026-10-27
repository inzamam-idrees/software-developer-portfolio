import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveProjectCard from "./project-card";

export default function ExecutiveProjects({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  return (
    <div className="executive-page executive-route-page">
      <header className="executive-route-header">
        <p className="executive-kicker">{formatCopy(copy.projects.kicker, { count: String(view.projects.length).padStart(2, "0") })}</p>
        <h1>{copy.projects.heading}</h1>
        <p>{copy.projects.intro}</p>
      </header>
      <div className="executive-projects executive-project-archive">{view.projects.map((project, index) => <ExecutiveProjectCard key={project.id} project={project} index={index} copy={copy} detailed={Boolean(project.problem && project.solution)} />)}</div>
      <aside className="executive-route-cta"><p className="executive-kicker">{copy.projects.ctaKicker}</p><h2>{view.contact.heading}</h2><Link className="executive-button primary" href="/#contact">{copy.actions.startConversation}</Link></aside>
    </div>
  );
}
