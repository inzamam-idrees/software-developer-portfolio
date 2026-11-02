import { createSiennaPresentation } from "./presentation.mjs";
import { WorkList } from "./works";

// ── All projects: the home grid without a batch limit ──
export default function SiennaProjects({ portfolio }) {
  const view = createSiennaPresentation(portfolio);
  const copy = view.copy.projects;
  return <div className="sienna-container sienna-route sienna-works">
    <WorkList projects={view.orderedProjects} heading={{ id: "sienna-projects-title", level: 1, label: copy.label, title: copy.heading, text: copy.intro }} />
  </div>;
}
