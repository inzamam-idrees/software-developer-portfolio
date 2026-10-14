import Link from "next/link";
import ContactForm from "@/app/components/homepage/contact/contact-form";
import PersonJsonLd from "@/themes/shared/person-json-ld";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveProjectCard from "./project-card";
import ExecutiveSocialLinks from "./social-links";

export default function ExecutiveHome({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  return (
    <div className="executive-page executive-home">
      <PersonJsonLd portfolio={view} />
      <section className="executive-hero" id="hero" aria-labelledby="executive-hero-title">
        <div className="executive-hero-copy">
          <p className="executive-kicker">{view.profile.designation} · {view.displayLocation}</p>
          <h1 id="executive-hero-title"><span>{view.profile.name}</span>{view.profile.headline}</h1>
          <p className="executive-hero-intro">{view.profile.shortIntroduction}</p>
          <div className="executive-actions">
            <a className="executive-button primary" href={`mailto:${view.contact.email}`}>Start a conversation <span aria-hidden="true">↗</span></a>
            {view.settings.features.resume && <a className="executive-button secondary" href={view.resume.url} target="_blank" rel="noreferrer">{view.resume.downloadLabel} <span aria-hidden="true">↗</span></a>}
          </div>
        </div>
        <aside className="executive-hero-brief" aria-label="Professional overview">
          <dl>
            <div><dt>Experience</dt><dd>{view.profile.experienceLabel}</dd></div>
            <div><dt>Focus</dt><dd>{view.profile.focusLabel}</dd></div>
            <div><dt>Core stack</dt><dd>{view.skills.featured.join(" · ")}</dd></div>
            <div><dt>Based in</dt><dd>{view.displayLocation}</dd></div>
          </dl>
        </aside>
      </section>
      <section className="executive-section" id="projects" aria-labelledby="executive-projects-title">
        <div className="executive-section-heading">
          <div><p className="executive-kicker">Selected work</p><h2 id="executive-projects-title">Systems built for real operations.</h2></div>
          <Link className="executive-text-link" href="/project">Explore all projects <span aria-hidden="true">→</span></Link>
        </div>
        <div className="executive-projects">{view.featuredProjects.map((project, index) => <ExecutiveProjectCard key={project.id} project={project} index={index} detailed />)}</div>
      </section>
      <section className="executive-section executive-about" id="about" aria-labelledby="executive-about-title">
        <div><p className="executive-kicker">About</p><h2 id="executive-about-title">{view.about.summary}</h2></div>
        <div className="executive-about-copy"><p>{view.about.personalStatement}</p><p>{view.about.engineeringPhilosophy}</p><ExecutiveSocialLinks links={view.professionalSocials} /></div>
      </section>
      <section className="executive-section" id="skills" aria-labelledby="executive-skills-title">
        <div className="executive-section-heading"><div><p className="executive-kicker">Technical expertise</p><h2 id="executive-skills-title">A full-stack practice, organized by outcome.</h2></div></div>
        <div className="executive-expertise-grid">{view.skills.categories.map((category) => (
          <article key={category.id}><p className="executive-label">{category.label}</p><h3>{category.title}</h3><p>{category.summary}</p><ul className="executive-tech-list">{category.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></article>
        ))}</div>
      </section>
      <section className="executive-section" id="experience" aria-labelledby="executive-experience-title">
        <div className="executive-section-heading"><div><p className="executive-kicker">Professional experience</p><h2 id="executive-experience-title">Progression through product engineering.</h2></div></div>
        <ol className="executive-timeline">{view.experience.map((item, index) => (
          <li key={item.id}><span className="executive-timeline-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.role}</h3><p>{item.company}</p></div><p className="executive-duration">{item.duration.replace(/[()]/g, "")}</p>{item.description && <p>{item.description}</p>}</li>
        ))}</ol>
      </section>
      <section className="executive-section executive-education" id="education" aria-labelledby="executive-education-title">
        <div><p className="executive-kicker">Education</p><h2 id="executive-education-title">Foundations in software engineering.</h2></div>
        <div>{view.education.map((item) => <article key={item.id}><p className="executive-label">{item.duration}</p><h3>{item.qualification}</h3><p>{item.institution}</p></article>)}</div>
      </section>
      <section className="executive-contact" id="contact" aria-labelledby="executive-contact-title">
        <div className="executive-contact-intro"><p className="executive-kicker">Contact</p><h2 id="executive-contact-title">{view.contact.heading}</h2><p>{view.contact.introduction}</p><a className="executive-email" href={`mailto:${view.contact.email}`}>{view.contact.email}</a><p>{view.contact.location}</p></div>
        {view.settings.features.contactForm && view.contact.form.enabled && <ContactForm />}
      </section>
    </div>
  );
}
