import { createCreativePresentation } from "./presentation.mjs";
import Articles from "./articles";

export default function CreativeBlog({ portfolio }) {
  const view = createCreativePresentation(portfolio);
  const copy = view.copy;
  return <div className="creative-route creative-frame">
    <header className="creative-route-heading"><p className="creative-badge">{copy.blog.label}</p><h1>{copy.blog.heading}</h1><p className="creative-lead">{copy.blog.intro}</p></header>
    <Articles view={view} />
  </div>;
}
