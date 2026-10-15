import { Suspense } from "react";
import ExperienceShell from "@/app/components/portfolio/motion/experience-shell";
import About from "@/app/components/portfolio/sections/about";
import ContactSection from "@/app/components/portfolio/sections/contact";
import Education from "@/app/components/portfolio/sections/education";
import Experience from "@/app/components/portfolio/sections/experience";
import Expertise from "@/app/components/portfolio/sections/expertise";
import Hero from "@/app/components/portfolio/sections/hero";
import SelectedWork from "@/app/components/portfolio/sections/selected-work";
import Writing from "@/app/components/portfolio/sections/writing";
import PersonJsonLd from "@/themes/shared/person-json-ld";
import { createCinematicPresentation } from "./presentation.mjs";

export default function CinematicHome({ portfolio }) {
  const view = createCinematicPresentation(portfolio);

  return (
    <ExperienceShell>
      <PersonJsonLd portfolio={view} />
      <Hero
        profile={view.profile}
        resume={view.resume}
        skills={view.skills}
        displayLocation={view.displayLocation}
      />
      <SelectedWork
        projects={view.featuredProjects}
        projectCount={view.projects.length}
      />
      <About
        profile={view.profile}
        about={view.about}
        social={view.social}
        displayLocation={view.displayLocation}
      />
      <Expertise skills={view.skills} />
      <Experience experiences={view.experience} />
      <Education educations={view.education} awards={view.awards} />
      <Suspense
        fallback={
          <section className="chapter container" aria-label="Loading writing">
            <p className="body-copy">Loading the notebook…</p>
          </section>
        }
      >
        <Writing articles={view.articles} social={view.social} />
      </Suspense>
      <ContactSection contact={view.contact} social={view.social} />
    </ExperienceShell>
  );
}
