import Link from "next/link";
import { Suspense } from "react";
import Certificates from "../shared/certificates";
import Resume from "../shared/resume";
import ProfileRoles from "../shared/profile-roles";
import SkillLevel from "../shared/skill-level";
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
  const introduction = view.profile.longIntroduction;
  const statement = view.about.personalStatement;
  return (
    <div className="executive-page executive-home">
      <section className="executive-hero" id="hero" aria-labelledby="executive-hero-title">
        <div className="executive-hero-copy">
          <p className="executive-kicker">{view.profile.designation} · {view.displayLocation}</p>
          <h1 id="executive-hero-title"><span>{view.profile.name}</span>{view.profile.headline}</h1>
          <ProfileRoles profile={view.profile} label={copy.contentSections.roles} />
          <p className="executive-hero-intro">{view.profile.shortIntroduction}</p>
          <div className="executive-actions">
            <a className="executive-button primary" href={`mailto:${view.contact.email}`}>{copy.actions.startConversation} <span aria-hidden="true">↗</span></a>
            {view.settings.features.resume && <a className="executive-button secondary" href={view.resume.url} target="_blank" rel="noreferrer">{view.resume.downloadLabel} <span aria-hidden="true">↗</span></a>}
          </div>
        </div>
        <aside className="executive-hero-brief" aria-label={home.overviewLabel}>
          <dl>
            <div><dt>{home.brief.experience}</dt><dd>{view.profile.experienceLabel}</dd></div>
            <div><dt>{home.brief.focus}</dt><dd>{view.profile.focusLabel}</dd></div>
            <div><dt>{home.brief.coreStack}</dt><dd>{view.skills.featured.join(" · ")}</dd></div>
            <div><dt>{home.brief.basedIn}</dt><dd>{view.displayLocation}</dd></div>
          </dl>
        </aside>
      </section>
      <section className="executive-section" id="projects" aria-labelledby="executive-projects-title">
        <div className="executive-section-heading">
          <div><p className="executive-kicker">{home.selectedWork.kicker}</p><h2 id="executive-projects-title">{home.selectedWork.heading}</h2></div>
          <Link className="executive-text-link" href="/project">{home.selectedWork.exploreAll} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="executive-projects">{view.featuredProjects.map((project, index) => <ExecutiveProjectCard key={project.id} project={project} index={index} copy={copy} detailed />)}</div>
      </section>
      <section className="executive-section executive-about" id="about" aria-labelledby="executive-about-title">
        <div><p className="executive-kicker">{home.about.kicker}</p><h2 id="executive-about-title">{view.about.summary}</h2></div>
        <div className="executive-about-copy"><p>{introduction}</p>{statement && !introduction.includes(statement) && <p>{statement}</p>}<p>{view.about.engineeringPhilosophy}</p><ExecutiveSocialLinks links={view.professionalSocials} /></div>
      </section>
      <section className="executive-section" id="skills" aria-labelledby="executive-skills-title">
        <div className="executive-section-heading"><div><p className="executive-kicker">{home.expertise.kicker}</p><h2 id="executive-skills-title">{home.expertise.heading}</h2></div></div>
        <div className="executive-expertise-grid">{view.skills.categories.map((category) => (
          <article key={category.id}><p className="executive-label">{category.label}</p><h3>{category.title}</h3><p>{category.summary}</p><ul className="executive-tech-list">{category.technologies.map((technology) => <li key={technology}>{technology}<SkillLevel name={technology} proficiency={view.skills.proficiency} template={copy.contentSections.proficiency} /></li>)}</ul></article>
        ))}</div>
        {additionalSkills.length > 0 && <div className="executive-additional-skills"><h3>{copy.contentSections.skillsAdditional}</h3><ul className="executive-tech-list">{additionalSkills.map((skill) => <li key={skill}>{skill}<SkillLevel name={skill} proficiency={view.skills.proficiency} template={copy.contentSections.proficiency} /></li>)}</ul></div>}
      </section>
      <section className="executive-section" id="experience" aria-labelledby="executive-experience-title">
        <div className="executive-section-heading"><div><p className="executive-kicker">{home.experience.kicker}</p><h2 id="executive-experience-title">{home.experience.heading}</h2></div></div>
        <ol className="executive-timeline">{view.experience.map((item, index) => (
          <li key={item.id}><span className="executive-timeline-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.role}</h3><p>{item.company} · {item.location}</p></div><p className="executive-duration">{item.duration.replace(/[()]/g, "")}</p>{item.description && <p>{item.description}</p>}{item.highlights.length > 0 && <ul className="executive-highlights">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}{item.technologies.length > 0 && <ul className="executive-tech-list executive-career-tech">{item.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>}</li>
        ))}</ol>
      </section>
      <section className="executive-section executive-education" id="education" aria-labelledby="executive-education-title">
        <div><p className="executive-kicker">{home.education.kicker}</p><h2 id="executive-education-title">{home.education.heading}</h2></div>
        <div>{view.education.map((item) => <article key={item.id}><p className="executive-label">{item.duration}</p><h3>{item.qualification}</h3><p>{item.institution}</p>{item.location && <p>{item.location}</p>}{item.description && <p>{item.description}</p>}</article>)}</div>
      </section>
      {view.awards.length > 0 && (
        <section className="executive-section executive-education" id="awards" aria-labelledby="executive-awards-title">
          <div><p className="executive-kicker">{home.awards.kicker}</p><h2 id="executive-awards-title">{home.awards.heading}</h2></div>
          <div>{view.awards.map((award) => <article key={award.id}><p className="executive-label">{award.duration}</p><h3>{award.title}</h3><p>{award.issuer}, {award.location}</p></article>)}</div>
        </section>
      )}
      <Certificates items={view.certificates} copy={copy.contentSections.certificates} theme="executive" />
      {view.settings.features.articles && <section className="executive-section executive-writing" id="writing" aria-labelledby="executive-writing-title"><div className="executive-section-heading"><div><p className="executive-kicker">{copy.blog.kicker}</p><h2 id="executive-writing-title">{copy.blog.heading}</h2></div><Link className="executive-text-link" href="/blog">{copy.navigation.writing} <span aria-hidden="true">→</span></Link></div><p>{copy.blog.intro}</p><Suspense fallback={<p>{copy.blogLoading.message}</p>}><ExecutiveWriting view={view} /></Suspense></section>}
      {view.settings.features.resume && <Resume resume={view.resume} copy={copy.contentSections.resume} theme="executive" />}
      <section className="executive-contact" id="contact" aria-labelledby="executive-contact-title">
        <div className="executive-contact-intro"><p className="executive-kicker">{home.contact.kicker}</p><h2 id="executive-contact-title">{view.contact.heading}</h2><p>{view.contact.introduction}</p><a className="executive-email" href={`mailto:${view.contact.email}`}>{view.contact.email}</a><p>{view.contact.location}</p></div>
        {view.settings.features.contactForm && view.contact.form.enabled && <ContactForm copy={copy.contactForm} />}
      </section>
    </div>
  );
}
