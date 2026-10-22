import Link from "next/link";
import { createPrismPresentation } from "./presentation.mjs";
import ProjectContent from "./project-content";
import Icon from "./icon";

export default function PrismProject({ portfolio, project }) {
  const view = createPrismPresentation(portfolio);
  return <div className="prism-route prism-frame"><Link className="prism-button prism-back" href="/project"><Icon name="previous" />{view.copy.projectDetail.backToProjects}</Link><article className="prism-card prism-project"><ProjectContent project={project} copy={view.copy} detailed /></article></div>;
}
