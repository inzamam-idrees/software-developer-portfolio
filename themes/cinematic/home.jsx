import { Suspense } from "react";
import Certificates from "../shared/certificates";
import Resume from "../shared/resume";
import ExperienceShell from "@/app/components/portfolio/motion/experience-shell";
import About from "@/app/components/portfolio/sections/about";
import ContactSection from "@/app/components/portfolio/sections/contact";
import Education from "@/app/components/portfolio/sections/education";
import Experience from "@/app/components/portfolio/sections/experience";
import Expertise from "@/app/components/portfolio/sections/expertise";
import Hero from "@/app/components/portfolio/sections/hero";
import SelectedWork from "@/app/components/portfolio/sections/selected-work";
import Writing from "@/app/components/portfolio/sections/writing";
import { createCinematicPresentation } from "./presentation.mjs";

export default function CinematicHome({ portfolio }) {
  const view = createCinematicPresentation(portfolio);
  const copy = view.copy;
  const home = copy.home;

  return (
    <ExperienceShell motionCopy={copy.motion}>
      <Hero
        profile={view.profile}
        resume={view.settings.features.resume ? view.resume : null}
        skills={view.skills}
        displayLocation={view.displayLocation}
        copy={home.hero}
        rolesLabel={copy.contentSections.roles}
      />
      <SelectedWork
        projects={view.featuredProjects}
        projectCount={view.projects.length}
        copy={copy}
      />
      <About
        profile={view.profile}
        about={view.about}
        social={view.social}
        displayLocation={view.displayLocation}
        copy={home.about}
      />
      <Expertise skills={view.skills} copy={home.expertise} additionalLabel={copy.contentSections.skillsAdditional} proficiencyTemplate={copy.contentSections.proficiency} />
      <Experience experiences={view.experience} copy={home.experience} />
      <Education
        educations={view.education}
        awards={view.awards}
        copy={home.education}
      />
      <Certificates items={view.certificates} copy={copy.contentSections.certificates} theme="cinematic" />
      {view.settings.features.articles && <Suspense
        fallback={
          <section
            className="chapter container"
            aria-label={home.writing.loadingLabel}
          >
            <p className="body-copy">{home.writing.loading}</p>
          </section>
        }
      >
        <Writing
          articles={view.articles}
          social={view.social}
          copy={home.writing}
          blogCopy={copy.blog}
        />
      </Suspense>}
      {view.settings.features.resume && (
        <Resume resume={view.resume} copy={copy.contentSections.resume} theme="cinematic" />
      )}
      <ContactSection contact={view.contact} social={view.social} copy={copy} formEnabled={view.settings.features.contactForm && view.contact.form.enabled} />
    </ExperienceShell>
  );
}
