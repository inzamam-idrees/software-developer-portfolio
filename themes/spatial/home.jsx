import { Suspense } from "react";
import Certificates from "../shared/certificates";
import SelectionProvider from "./client/selection";
import SpatialStage from "./client/stage";
import About from "./sections/about";
import Contact from "./sections/contact";
import Education from "./sections/education";
import Experience from "./sections/experience";
import Hero from "./sections/hero";
import Projects from "./sections/projects";
import Resume from "./sections/resume";
import Skills from "./sections/skills";
import Writing, { WritingFallback } from "./sections/writing";
import { createSpatialPresentation } from "./presentation.mjs";

export default function SpatialHome({ portfolio }) {
  const view = createSpatialPresentation(portfolio);
  const { features } = view.settings;
  return (
    <SelectionProvider graph={view.graph}>
      <Hero view={view} />
      <About view={view} />
      <Experience view={view} />
      <Skills view={view} />
      <Projects view={view} />
      <Education view={view} />
      <div className="spatial-frame spatial-content-section">
        <Certificates items={view.certificates} copy={view.copy.contentSections.certificates} theme="spatial" />
      </div>
      {features.articles && (
        <Suspense fallback={<WritingFallback copy={view.copy.home.writing} profileUrl={view.social.dev} />}>
          <Writing view={view} />
        </Suspense>
      )}
      {features.resume && <Resume view={view} />}
      <Contact view={view} />
      <SpatialStage
        graph={view.graph}
        featured={view.featuredProjects.map(({ id, title, category, technologies }) => ({
          id,
          title,
          category,
          technologies,
        }))}
        roles={view.experience.map(({ id }) => ({ id }))}
        features={features}
      />
    </SelectionProvider>
  );
}
