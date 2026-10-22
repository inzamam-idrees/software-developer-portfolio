import { createPrismPresentation } from "./presentation.mjs";
import Articles from "./articles";

export default function PrismBlog({ portfolio }) {
  const view = createPrismPresentation(portfolio);
  return <div className="prism-route prism-frame"><header className="prism-heading prism-centered"><p className="prism-kicker">{view.copy.blog.label}</p><h1 className="prism-gradient">{view.copy.blog.heading}</h1><p>{view.copy.blog.intro}</p></header><Articles view={view} /></div>;
}
