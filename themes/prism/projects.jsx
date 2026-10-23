import { createPrismPresentation } from "./presentation.mjs";
import ProjectShowcase from "./client/projects";

export default function PrismProjects({ portfolio }) {
  const view = createPrismPresentation(portfolio);
  return <div className="prism-route prism-frame"><header className="prism-heading"><p className="prism-kicker">{view.copy.projects.label}</p><h1 className="prism-gradient">{view.copy.projects.heading}</h1><p>{view.copy.projects.intro}</p></header><ProjectShowcase projects={view.projects} copy={view.copy} archive /></div>;
}
