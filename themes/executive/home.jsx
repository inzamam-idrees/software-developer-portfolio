import Link from "next/link";
import { Suspense } from "react";
import { ExecutiveImpact } from "./impact.mjs";
import ExecutivePortrait from "./portrait";
import ExecutiveIcon from "./icon";
import Certificates from "./certificates";
import Resume from "./resume";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ExecutiveWriting from "./writing";
import ContactForm from "@/app/components/homepage/contact/contact-form";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveProjectCard from "./project-card";
import ExecutiveSocialLinks from "./social-links";

const statIcons = ["briefcase", "layers", "code", "award"];
const roleIcons = ["code", "briefcase", "spark"];

function Heading({ id, kicker, title, children }) {
  return (
    <div className="executive-section-heading">
      <div>
        <p className="executive-kicker">{kicker}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Last words of a heading take the gold accent; the full text stays one string for assistive tech. */
function Accent({ text, count = 2 }) {
  const words = text.split(/\s+/);
  const split = Math.max(words.length - count, 0);
  return <>{words.slice(0, split).join(" ")}{split > 0 ? " " : ""}<span className="executive-accent">{words.slice(split).join(" ")}</span></>;
}

export default function ExecutiveHome({ portfolio }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const home = copy.home;
  const headlineWords = view.profile.headline.split(/\s+/);
  const accentFrom = Math.max(headlineWords.length - 2, 0);
  const resumeOn = view.settings.features.resume;
  const roles = view.profile.roles.slice(0, 3);
  return (
    <div className="executive-home">
      <div className="executive-page">
        <section className="executive-hero" id="hero" aria-labelledby="executive-hero-title">
          <div className="executive-hero-copy">
            <p className="executive-identity">{view.profile.designation}</p>
            <h1 id="executive-hero-title">{headlineWords.map((word, index) => <span key={index}><span className={index >= accentFrom ? "executive-hero-word executive-accent" : "executive-hero-word"}>{word}</span>{" "}</span>)}</h1>
            <p className="executive-hero-intro">{view.positioning}</p>
            <div className="executive-actions">
              {resumeOn
                ? <a className="executive-button primary" href={view.resume.url} target="_blank" rel="noreferrer">{copy.actions.viewResume}</a>
                : <Link className="executive-button primary" href="/#projects">{copy.actions.viewProjects}</Link>}
              <Link className="executive-button secondary" href="/#contact">{copy.actions.contactMe}</Link>
            </div>
            <dl className="executive-stats">{view.stats.map((stat) => <div key={stat.label}><dd>{stat.value}</dd><dt>{stat.label}</dt></div>)}</dl>
          </div>
          <aside className="executive-hero-brief" aria-label={home.overviewLabel}>
            <div className="executive-portrait-stage">
              <span className="executive-portrait-ring" aria-hidden="true" />
              <ExecutivePortrait src={view.profile.image} name={view.profile.name} cutout priority />
            </div>
            <div className="executive-hero-side">
              <p className="executive-hand-note" aria-hidden="true">
                <span>{home.hero.note}</span>
                <svg viewBox="0 0 120 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path pathLength="1" d="M6 8c40-6 92 4 102 40M108 48l-12-9M108 48l9-13" /></svg>
              </p>
              <dl className="executive-experience-stamp">{view.stats.map((stat, index) => <div key={stat.label}><span className="executive-stat-icon"><ExecutiveIcon kind={statIcons[index % statIcons.length]} /></span><dd>{stat.value}</dd><dt>{stat.label}</dt></div>)}</dl>
            </div>
          </aside>
        </section>

        <section className="executive-section executive-about" id="about" aria-labelledby="executive-about-title">
          <div className="executive-about-photo"><ExecutivePortrait src={view.profile.image} name={view.profile.name} cutout /><span className="executive-signature" aria-hidden="true">{view.profile.name}</span></div>
          <div className="executive-about-copy">
            <p className="executive-kicker">{home.about.kicker}</p>
            <h2 id="executive-about-title"><Accent text={view.profile.designation} /></h2>
            <p>{view.aboutLead}</p>
            {(view.aboutMore || view.about.engineeringPhilosophy) && <details className="executive-read-more"><summary>{home.about.readMore}</summary>{view.aboutMore && <p>{view.aboutMore}</p>}{view.about.engineeringPhilosophy && <p>{view.about.engineeringPhilosophy}</p>}</details>}
            {roles.length > 0 && <ul className="executive-role-tiles" aria-label={copy.contentSections.roles}>{roles.map((role, index) => <li key={role}><span className="executive-stat-icon"><ExecutiveIcon kind={roleIcons[index % roleIcons.length]} /></span>{role}</li>)}</ul>}
          </div>
          <blockquote className="executive-quote"><p>{view.about.summary}</p><cite>{view.profile.name}</cite></blockquote>
        </section>

        <section className="executive-section executive-career" id="experience" aria-labelledby="executive-experience-title">
          <Heading id="executive-experience-title" kicker={home.experience.kicker} title={home.experience.heading} />
          <div className="executive-career-layout">
            <ol className="executive-timeline">{view.experience.map((item) => (
              <li key={item.id} id={`career-${item.id}`} data-role={item.id} tabIndex={-1}>
                <p className="executive-duration">{item.duration.replace(/[()]/g, "")}</p>
                <div className="executive-role-card">
                  <h3>{item.role}</h3>
                  <p className="executive-employer">{[item.company, item.location].filter(Boolean).join(" · ")}</p>
                  {item.description && <p>{item.description}</p>}
                  <ExecutiveImpact outcome={item.outcome} label={home.experience.impact} />
                  {item.primaryHighlights.length > 0 && <ul className="executive-highlights executive-primary-highlights">{item.primaryHighlights.map((highlight, index) => <li className={index === 0 ? "executive-role-lead" : undefined} key={highlight}>{highlight}</li>)}</ul>}
                  {item.moreHighlights.length > 0 && <details className="executive-role-disclosure"><summary>{formatCopy(home.experience.responsibilities, { count: item.moreHighlights.length })}</summary><ul className="executive-highlights">{item.moreHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></details>}
                  {item.primaryTechnologies.length > 0 && <ul className="executive-tech-list executive-career-tech">{item.primaryTechnologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>}
                  {item.moreTechnologies.length > 0 && <details className="executive-tech-disclosure"><summary>{formatCopy(home.experience.moreTechnologies, { count: item.moreTechnologies.length })}</summary><ul className="executive-tech-list">{item.moreTechnologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></details>}
                </div>
              </li>
            ))}</ol>
            <aside className="executive-code-card" aria-hidden="true">
              <ul>{view.codeLines.map(([label, value], index) => <li key={label} style={{ "--ex-line": index }}><span className="executive-code-comment">{"// "}{label}: {value}</span></li>)}</ul>
              <p className="executive-hand-note executive-hand-note-end"><span>{view.contact.heading}</span>
                <svg viewBox="0 0 120 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path pathLength="1" d="M10 6c-4 40 46 62 92 40M102 46l-14 2M102 46l-4-14" /></svg>
              </p>
            </aside>
          </div>
        </section>

        <section className="executive-section" id="projects" aria-labelledby="executive-projects-title">
          <Heading id="executive-projects-title" kicker={home.selectedWork.kicker} title={home.selectedWork.heading}>
            <Link className="executive-text-link" href="/project">{home.selectedWork.exploreAll}<ExecutiveIcon /></Link>
          </Heading>
          <div className="executive-projects">{view.featuredProjects.slice(0, 3).map((project) => <ExecutiveProjectCard key={project.id} project={project} copy={copy} />)}</div>
        </section>

        <section className="executive-section" id="skills" aria-labelledby="executive-skills-title">
          <Heading id="executive-skills-title" kicker={home.expertise.kicker} title={home.expertise.heading} />
          <ul className="executive-skill-tiles">{view.skillTiles.map((tile, index) => <li key={tile.name} style={{ "--ex-tile": index, "--ex-brand": tile.icon.color }}><span className="executive-skill-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d={tile.icon.path} /></svg></span><strong>{tile.name}</strong><small>{tile.label}</small></li>)}</ul>
          {view.skillMarquee.length > 0 && <div className="executive-marquee" aria-hidden="true"><ul>{[...view.skillMarquee, ...view.skillMarquee].map((tile, index) => <li key={index} style={{ "--ex-brand": tile.icon.color }}><svg viewBox="0 0 24 24" fill="currentColor"><path d={tile.icon.path} /></svg>{tile.name}</li>)}</ul></div>}
          <details className="executive-all-skills">
            <summary>{home.expertise.all}</summary>
            <div className="executive-expertise-grid">{view.skills.categories.map((category) => (
              <article key={category.id}><p className="executive-label">{category.label}</p><h3>{category.title}</h3><p>{category.summary}</p><ul className="executive-tech-list">{category.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul></article>
            ))}</div>
          </details>
        </section>

        {(view.education.length > 0 || view.awards.length > 0) && <div className="executive-background-columns">
          {view.education.length > 0 && <section className="executive-section" id="education" aria-labelledby="executive-education-title">
            <Heading id="executive-education-title" kicker={home.education.kicker} title={home.education.heading} />
            <ol className="executive-record-list">{view.education.map((item) => <li key={item.id}><span className="executive-stat-icon"><ExecutiveIcon kind="cap" /></span><div><h3>{item.qualification}</h3><p>{[item.institution, item.location].filter(Boolean).join(", ")}</p>{item.description && <p>{item.description}</p>}<p className="executive-label">{item.duration}</p></div></li>)}</ol>
          </section>}
          {view.awards.length > 0 && <section className="executive-section" id="awards" aria-labelledby="executive-awards-title">
            <Heading id="executive-awards-title" kicker={home.awards.kicker} title={home.awards.heading} />
            <ol className="executive-award-list">{view.awards.map((award) => <li key={award.id}><span className="executive-stat-icon"><ExecutiveIcon kind="award" /></span><h3>{award.title}</h3><p>{[award.issuer, award.location].filter(Boolean).join(", ")}</p><p className="executive-label">{award.duration}</p></li>)}</ol>
          </section>}
        </div>}

        <Certificates items={view.certificates} copy={copy} verifiedCount={view.verifiedCertificateCount} />
        {view.settings.features.articles && <Suspense fallback={<section className="executive-writing-strip executive-section" id="writing"><h2>{copy.blog.heading}</h2><p>{copy.blogLoading.message}</p></section>}><ExecutiveWriting view={view} /></Suspense>}
        {resumeOn && <Resume resume={view.resume} copy={copy} />}

        <section className="executive-contact" id="contact" aria-labelledby="executive-contact-title">
          <div className="executive-contact-intro">
            <p className="executive-kicker">{home.contact.kicker}</p>
            <h2 id="executive-contact-title">{view.contact.heading}</h2>
            <p>{view.contact.introduction}</p>
            <ul className="executive-contact-details">
              <li><span className="executive-stat-icon"><ExecutiveIcon kind="mail" /></span><a className="executive-email" href={`mailto:${view.contact.email}`}>{view.contact.email}</a></li>
              {view.contact.location && <li><span className="executive-stat-icon"><ExecutiveIcon kind="pin" /></span><span>{view.contact.location}</span></li>}
            </ul>
            <ExecutiveSocialLinks links={view.professionalSocials} />
            {resumeOn && <a className="executive-button secondary" href={view.resume.url} target="_blank" rel="noreferrer">{copy.actions.downloadCv}<ExecutiveIcon kind="download" /></a>}
          </div>
          {view.settings.features.contactForm && view.contact.form.enabled && <ContactForm copy={copy.contactForm} />}
        </section>
      </div>
    </div>
  );
}
