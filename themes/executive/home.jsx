import Link from "next/link";
import { ExecutiveImpact } from "./impact.mjs";
import ExecutivePortrait from "./portrait";
import ExecutiveIcon from "./icon";
import { Suspense } from "react";
import Certificates from "./certificates";
import Resume from "./resume";
import ProfileRoles from "../shared/profile-roles";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ExecutiveWriting from "./writing";
import ContactForm from "@/app/components/homepage/contact/contact-form";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveProjectCard from "./project-card";
import ExecutiveSocialLinks from "./social-links";

export default function ExecutiveHome({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const home = copy.home;
  const categorizedSkills = new Set(view.skills.categories.flatMap((category) => category.technologies));
  const additionalSkills = view.skills.all.filter((skill) => !categorizedSkills.has(skill));
  return (
    <div className="executive-home">
      <div className="executive-chapter executive-chapter-career"><div className="executive-page">
      <section className="executive-hero" id="hero" aria-labelledby="executive-hero-title">
        <div className="executive-hero-copy">
          <p className="executive-identity">{view.profile.designation}</p>
          <h1 id="executive-hero-title">{view.profile.headline.split(/\s+/).map((word, index) => <span key={index}><span className="executive-hero-word">{word}</span>{" "}</span>)}</h1>
          <p className="executive-hero-intro">{view.positioning}</p>
          <div className="executive-actions">
            <a className="executive-button primary" href={`mailto:${view.contact.email}`}>{copy.actions.startConversation}<ExecutiveIcon /></a>
            {view.settings.features.resume && <a className="executive-button secondary" href={view.resume.url} target="_blank" rel="noreferrer">{view.resume.downloadLabel}<ExecutiveIcon kind="download" /></a>}
          </div>
          <ul className="executive-hero-stack" aria-label={home.proof.stack}>{view.proofStack.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        </div>
        <aside className="executive-hero-brief" aria-label={home.overviewLabel}>
          <ExecutivePortrait src={view.profile.image} name={view.profile.name} />
          <div className="executive-portrait-caption"><p>{view.profile.name}</p><p>{view.displayLocation}</p></div>
          <dl className="executive-experience-stamp"><div><dt>{home.brief.experience}</dt><dd>{view.profile.experienceLabel}</dd></div><div><dt>{home.brief.focus}</dt><dd>{view.profile.focusLabel}</dd></div></dl>
        </aside>
        <dl className="executive-proof">
          {view.proofEmployers.length > 0 && <div><dt>{home.proof.employers}</dt><dd>{view.proofEmployers.map((company) => <span key={company}>{company}</span>)}</dd></div>}
        </dl>
      </section>

      </div></div>
      <div className="executive-chapter executive-chapter-work"><div className="executive-page">
      <section className="executive-section" id="projects" aria-labelledby="executive-projects-title">
        <div className="executive-section-heading">
          <div><h2 id="executive-projects-title">{home.selectedWork.heading}</h2></div>
          <Link className="executive-text-link" href="/project">{home.selectedWork.exploreAll}</Link>
        </div>
        <div className="executive-projects">{view.featuredProjects.map((project, index) => <ExecutiveProjectCard key={project.id} project={project} index={index} copy={copy} detailed />)}</div>
      </section>
      </div></div>
      <div className="executive-chapter executive-chapter-experience"><div className="executive-page">
      <section className="executive-section executive-career" id="experience" aria-labelledby="executive-experience-title">
        <div className="executive-career-guide">
          <h2 id="executive-experience-title">{home.experience.heading}</h2>
          <p>{home.experience.intro}</p>
          <nav aria-label={home.experience.navigationLabel}>{view.experience.map((item) => <a href={`#career-${item.id}`} key={item.id} data-role-link={item.id}>{item.company}</a>)}</nav>
          <div className="executive-progress" aria-hidden="true"><span /></div>
        </div>
        <ol className="executive-timeline">{view.experience.map((item) => (
          <li key={item.id} id={`career-${item.id}`} data-role={item.id} tabIndex={-1}>
            <p className="executive-duration">{item.duration.replace(/[()]/g, "")}</p>
            <h3>{item.role}</h3><p className="executive-employer">{item.company}</p><p>{item.location}</p>
            {item.description && <p>{item.description}</p>}
            <ExecutiveImpact outcome={item.outcome} label={home.experience.impact} />
            {item.primaryHighlights.length > 0 && <ul className="executive-highlights executive-primary-highlights">{item.primaryHighlights.map((highlight, index) => <li className={index === 0 ? "executive-role-lead" : undefined} key={highlight}>{highlight}</li>)}</ul>}
            {item.moreHighlights.length > 0 && <details className="executive-role-disclosure"><summary>{formatCopy(home.experience.responsibilities, { count: item.moreHighlights.length })}</summary><ul className="executive-highlights">{item.moreHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></details>}
            {item.primaryTechnologies.length > 0 && <ul className="executive-tech-list executive-career-tech">{item.primaryTechnologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>}
            {item.moreTechnologies.length > 0 && <details className="executive-tech-disclosure"><summary>{formatCopy(home.experience.moreTechnologies, { count: item.moreTechnologies.length })}</summary><ul className="executive-tech-list">{item.moreTechnologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></details>}
          </li>
        ))}</ol>
        <div className="executive-career-close"><a className="executive-button secondary" href={`mailto:${view.contact.email}`}>{copy.actions.startConversation}</a></div>
      </section>
      </div></div>
      <div className="executive-chapter executive-chapter-background"><div className="executive-page">
      <section className="executive-section" id="skills" aria-labelledby="executive-skills-title">
        <div className="executive-section-heading"><div><h2 id="executive-skills-title">{home.expertise.heading}</h2></div></div>
        <div className="executive-expertise-grid">{view.skills.categories.map((category) => (
          <article key={category.id}><p className="executive-label">{category.label}</p><h3>{category.title}</h3><p>{category.summary}</p><ul className="executive-tech-list">{category.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></article>
        ))}</div>
        {additionalSkills.length > 0 && <div className="executive-additional-skills"><h3>{copy.contentSections.skillsAdditional}</h3><ul className="executive-tech-list">{additionalSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
      </section>
      <section className="executive-section executive-background" id="background" aria-labelledby="executive-background-title">
        <h2 id="executive-background-title">{home.background.heading}</h2>
        <div className="executive-biography" id="about">
          <h3>{view.about.summary}</h3>
          <ProfileRoles profile={view.profile} label={copy.contentSections.roles} />
          <div className="executive-biography-copy"><p>{view.profile.longIntroduction}</p>{view.about.personalStatement && !view.profile.longIntroduction.includes(view.about.personalStatement) && <p>{view.about.personalStatement}</p>}<p>{view.about.engineeringPhilosophy}</p></div>
          <ExecutiveSocialLinks links={view.professionalSocials} />
        </div>
        <div className="executive-background-columns">
          {view.education.length > 0 && <div id="education" aria-labelledby="executive-education-title"><h3 id="executive-education-title">{home.education.heading}</h3>{view.education.map((item) => <article key={item.id}><p className="executive-label">{item.duration}</p><h4>{item.qualification}</h4><p>{item.institution}</p>{item.location && <p>{item.location}</p>}{item.description && <p>{item.description}</p>}</article>)}</div>}
          {view.awards.length > 0 && <div id="awards" aria-labelledby="executive-awards-title"><h3 id="executive-awards-title">{home.awards.heading}</h3>{view.awards.map((award) => <article key={award.id}><p className="executive-label">{award.duration}</p><h4>{award.title}</h4><p>{award.issuer}, {award.location}</p></article>)}</div>}
        </div>
      </section>
      <Certificates items={view.certificates} copy={copy} verifiedCount={view.verifiedCertificateCount} />
      </div></div>
      <div className="executive-chapter executive-chapter-closing"><div className="executive-page">
      {view.settings.features.articles && <Suspense fallback={<section className="executive-writing-strip executive-section" id="writing"><h2>{copy.blog.heading}</h2><p>{copy.blogLoading.message}</p></section>}><ExecutiveWriting view={view} /></Suspense>}
      {view.settings.features.resume && <Resume resume={view.resume} copy={copy} />}
      <section className="executive-contact" id="contact" aria-labelledby="executive-contact-title">
        <div className="executive-contact-intro"><h2 id="executive-contact-title">{view.contact.heading}</h2><p>{view.contact.introduction}</p><a className="executive-email" href={`mailto:${view.contact.email}`}>{view.contact.email}</a><p>{view.contact.location}</p></div>
        {view.settings.features.contactForm && view.contact.form.enabled && <ContactForm copy={copy.contactForm} />}
      </section>
      </div></div>
    </div>
  );
}
