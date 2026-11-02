import { Suspense } from "react";
import { createSiennaPresentation } from "./presentation.mjs";
import { SectionHeading } from "./sections";
import { Articles } from "./writing";

// ── Blog: every article in the home teaser's grid ──
export default function SiennaBlog({ portfolio }) {
  const view = createSiennaPresentation(portfolio);
  const copy = view.copy;
  return <div className="sienna-container sienna-route sienna-writing">
    <SectionHeading id="sienna-blog-title" level={1} label={copy.blog.label} title={copy.blog.heading} text={copy.blog.intro} />
    <Suspense fallback={<p className="sienna-section-text">{copy.blogLoading.message}</p>}>
      <Articles view={view} />
    </Suspense>
  </div>;
}
