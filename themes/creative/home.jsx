import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "@/app/components/homepage/contact/contact-form";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { formatMonth } from "@/lib/portfolio/current-view.mjs";
import ProfileRoles from "../shared/profile-roles";
import SkillLevel from "../shared/skill-level";
import { resumePreviewUrl } from "../shared/resume-preview.mjs";
import { createCreativePresentation } from "./presentation.mjs";
import Portrait from "./client/portrait";
import { HeroBackdrop, HeroForeground, NoteArrow } from "./art";
import ProjectCard from "./project-card";
import TechIcon from "./tech-icon";
import Articles from "./articles";
import Heading from "./heading";
import Icon from "./icon";

// ── Sections ──
function Hero({ view }) {
  const { copy, profile } = view;
  const hero = copy.home.hero;
  return <section className="creative-hero creative-frame" id="hero" aria-labelledby="creative-hero-title">
    <div className="creative-hero-copy">
      <p className="creative-badge">{profile.designation}</p>
      <h1 id="creative-hero-title">{hero.headline.map((word, index) => <span key={word} style={{ "--i": index }}>{word}{index < hero.headline.length - 1 && <i className="creative-dot" data-dot={index % 2} aria-hidden="true" />}</span>)}</h1>
      <p className="creative-hero-intro">{formatCopy(hero.intro, { name: profile.name, designation: profile.designation, experience: profile.experienceLabel })} {profile.shortIntroduction}</p>
      <div className="creative-actions">
        <a className="creative-button creative-button-primary" href="#projects">{hero.projects}</a>
        <a className="creative-button creative-button-light" href="#contact">{hero.contact}</a>
      </div>
    </div>
    <div className="creative-hero-art">
      <HeroBackdrop />
      <div className="creative-portrait-frame"><Portrait src={profile.image} alt={formatCopy(hero.portraitAlt, { name: profile.name })} initials={profile.name.split(/\s+/).map((part) => part[0]).join("")} /></div>
      <HeroForeground />
      <p className="creative-note"><span>{hero.note}</span><NoteArrow /></p>
    </div>
  </section>;
}

function TechnologyStrip({ view }) {
  if (!view.technologies.length) return null;
  return <section className="creative-frame creative-tech-strip" aria-label={view.copy.home.technologies.label}>
    <ul>{view.technologies.map((name, index) => <li key={name} data-reveal="up" style={{ "--i": index }}><TechIcon name={name} /><span>{name}</span></li>)}</ul>
  </section>;
}

function FeaturedProjects({ view }) {
  const copy = view.copy;
  return <section id="projects" className="creative-section creative-frame creative-featured" aria-labelledby="creative-projects-title">
    <Heading id="creative-projects-title" title={copy.home.projects.heading}><Link className="creative-text-link" href="/project">{copy.home.projects.all}<Icon name="right" /></Link></Heading>
    {view.homeProjects.length
      ? <div className="creative-project-grid">{view.homeProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} copy={copy} reveal />)}</div>
      : <p className="creative-card creative-empty">{copy.home.projects.empty}</p>}
  </section>;
}

function About({ view }) {
  const { copy, profile } = view;
  const about = copy.home.about;
  return <section id="about" className="creative-section creative-frame" aria-labelledby="creative-about-title">
    <div className="creative-about">
      <div>
        <Heading id="creative-about-title" label={about.label} title={view.about.summary || about.heading} />
        <p className="creative-lead" data-reveal="up">{profile.longIntroduction}</p>
      </div>
      <aside className="creative-card creative-about-card" data-reveal="right">
        {view.about.engineeringPhilosophy && <><h3>{about.philosophy}</h3><p>{view.about.engineeringPhilosophy}</p></>}
        <dl>
          <div><dt>{about.location}</dt><dd><Icon name="location" />{view.displayLocation}</dd></div>
          {profile.experienceLabel && <div><dt>{copy.home.experience.label}</dt><dd><Icon name="work" />{profile.experienceLabel}</dd></div>}
        </dl>
        <ProfileRoles profile={profile} label={copy.contentSections.roles} />
        {!!profile.traits?.length && <ul className="creative-traits">{profile.traits.map((trait) => <li key={trait.id}><Icon name="star" />{trait.label}</li>)}</ul>}
      </aside>
    </div>
  </section>;
}

function Experience({ view }) {
  const copy = view.copy.home.experience;
  if (!view.experience.length) return null;
  return <section id="experience" className="creative-section creative-tint" aria-labelledby="creative-experience-title"><div className="creative-frame">
    <Heading id="creative-experience-title" label={copy.label} title={copy.heading} />
    <ol className="creative-timeline" data-reveal="line">{view.experience.map((role) => {
      const [first, rest] = [role.highlights.slice(0, 3), role.highlights.slice(3)];
      return <li className="creative-card creative-role" key={role.id} data-reveal="up">
        <div className="creative-role-head">
          <div><h3>{role.role}</h3><p>{role.company}{role.location && <span> · {role.location}</span>}</p></div>
          <p className="creative-pill">{formatMonth(role.startDate)} – {role.current ? copy.present : formatMonth(role.endDate)}</p>
        </div>
        {role.description && <p>{role.description}</p>}
        {!!first.length && <ul className="creative-checks">{first.map((text, index) => <li key={index}><Icon name="check" /><span>{text}</span></li>)}</ul>}
        {!!rest.length && <details className="creative-more"><summary>{formatCopy(copy.more, { count: rest.length })}</summary><ul className="creative-checks">{rest.map((text, index) => <li key={index}><Icon name="check" /><span>{text}</span></li>)}</ul></details>}
        {!!role.technologies.length && <ul className="creative-tags">{role.technologies.map((name) => <li key={name}>{name}</li>)}</ul>}
      </li>;
    })}</ol>
  </div></section>;
}

function Skills({ view }) {
  const copy = view.copy.home.skills;
  if (!view.skillGroups.length) return null;
  return <section id="skills" className="creative-section creative-frame" aria-labelledby="creative-skills-title">
    <Heading id="creative-skills-title" label={copy.label} title={copy.heading} intro={copy.intro} />
    <div className="creative-skill-grid">{view.skillGroups.map((group, index) => <article className="creative-card creative-skill-group" key={group.id} data-reveal="up" style={{ "--i": index % 2 }}>
      <p className="creative-eyebrow">{group.label}</p>
      {group.title && <h3>{group.title}</h3>}
      {group.summary && <p>{group.summary}</p>}
      <ul>{group.technologies.map((name, index) => <li key={name} style={{ "--chip": index }}><TechIcon name={name} /><span>{name}</span><SkillLevel name={name} proficiency={view.skills.proficiency} template={view.copy.contentSections.proficiency} /></li>)}</ul>
    </article>)}</div>
  </section>;
}

function Education({ view }) {
  const copy = view.copy.home.education;
  if (!view.education.length && !view.awards.length) return null;
  return <section id="education" className="creative-section creative-tint" aria-labelledby="creative-education-title"><div className="creative-frame">
    <Heading id="creative-education-title" label={copy.label} title={copy.heading} />
    <div className="creative-education">
      {!!view.education.length && <ol className="creative-stack">{view.education.map((item, index) => <li className="creative-card creative-education-item" key={item.id} data-reveal="up" style={{ "--i": index }}><span className="creative-symbol"><Icon name="education" /></span><div><h3>{item.qualification}</h3><p>{item.institution}</p>{item.description && <p>{item.description}</p>}</div><p className="creative-pill">{item.duration}</p></li>)}</ol>}
      {!!view.awards.length && <div id="awards"><h3 className="creative-subheading">{copy.awards}</h3><ul className="creative-stack">{view.awards.map((item, index) => <li className="creative-card creative-award" key={item.id} data-reveal="right" style={{ "--i": index }}><span className="creative-symbol creative-symbol-warm"><Icon name="award" /></span><div><h4>{item.title}</h4><p>{[item.issuer, item.location].filter(Boolean).join(" · ")}</p><p className="creative-meta">{item.duration}</p></div></li>)}</ul></div>}
    </div>
  </div></section>;
}

function Certificates({ view }) {
  const items = view.certificates;
  const copy = view.copy.contentSections.certificates;
  if (!items.length) return null;
  return <section id="certificates" className="creative-section creative-frame" aria-labelledby="creative-certificates-title">
    <Heading id="creative-certificates-title" label={view.copy.home.certificates.label} title={copy.heading} intro={copy.description} />
    {items.some((item) => item.title.startsWith("[TODO:")) && <p className="creative-note-text">{copy.placeholder}</p>}
    <div className="creative-certificate-grid">{items.map((item, index) => <article className="creative-card creative-certificate" key={item.id} data-reveal="up" style={{ "--i": index % 3 }}>
      <div className="creative-certificate-top">
        <span className="creative-symbol"><Icon name="award" /></span>
        <div><p className="creative-eyebrow">{item.issuer}</p>{item.issuedDate && <time dateTime={item.issuedDate}>{item.issuedDate.slice(0, 4)}</time>}</div>
        {item.status && <span className="creative-status" data-status={item.status}><Icon name={item.status === "in-progress" ? "clock" : item.status === "verified" ? "shield" : "check"} />{copy.statuses[item.status]}</span>}
      </div>
      <h3>{item.title}</h3>
      {item.description && <p>{item.description}</p>}
      {!!item.competencies?.length && <><p className="creative-meta">{copy.competencies}</p><ul className="creative-tags">{item.competencies.map((skill) => <li key={skill}>{skill}</li>)}</ul></>}
      {item.credentialId && <p className="creative-meta">{copy.credentialId}: {item.credentialId}</p>}
      {item.image && <Image className="creative-certificate-image" src={item.image} alt={item.title} width={640} height={400} unoptimized />}
      {item.credentialUrl && <a className="creative-text-link" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">{copy.credential}<Icon name="arrow" /></a>}
    </article>)}</div>
  </section>;
}

function Writing({ view }) {
  const copy = view.copy;
  if (!view.settings.features.articles) return null;
  return <section id="writing" className="creative-section creative-frame" aria-labelledby="creative-writing-title">
    <Heading id="creative-writing-title" label={copy.home.writing.label} title={copy.home.writing.heading}><Link className="creative-text-link" href="/blog">{copy.home.writing.all}<Icon name="right" /></Link></Heading>
    <Suspense fallback={<p className="creative-meta">{copy.blogLoading.message}</p>}><Articles view={view} limit={3} /></Suspense>
  </section>;
}

function Resume({ view }) {
  if (!view.resumeEnabled) return null;
  const copy = view.copy.contentSections.resume;
  const preview = resumePreviewUrl(view.resume.url);
  return <section id="resume" className="creative-section creative-tint" aria-labelledby="creative-resume-title"><div className="creative-frame">
    <Heading id="creative-resume-title" label={view.copy.home.resume.label} title={copy.heading} intro={view.copy.home.resume.intro}><a className="creative-button creative-button-primary" href={view.resume.url} target="_blank" rel="noopener noreferrer">{copy.open}<Icon name="arrow" /></a></Heading>
    {preview && <div className="creative-card creative-resume" data-reveal="up"><p className="creative-resume-bar"><Icon name="resume" />{view.resume.title}</p><iframe src={preview} title={copy.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><p className="creative-meta">{copy.previewFallback}</p></div>}
  </div></section>;
}

function Contact({ view }) {
  const { copy, contact } = view;
  const labels = copy.home.contact;
  const form = view.settings.features.contactForm && contact.form.enabled;
  return <section id="contact" className="creative-section creative-frame" aria-labelledby="creative-contact-title">
    <div className={form ? "creative-contact" : "creative-contact creative-contact-single"}>
      <div className="creative-contact-intro" data-reveal="up">
        <p className="creative-eyebrow">{labels.label}</p>
        <h2 id="creative-contact-title">{contact.heading}</h2>
        <p className="creative-lead">{contact.introduction}</p>
        {contact.availability && <p className="creative-availability"><span aria-hidden="true" />{contact.availability}</p>}
        <ul className="creative-channels">
          <li><span className="creative-symbol"><Icon name="email" /></span><div><p className="creative-meta">{labels.email}</p><a href={`mailto:${contact.email}`}>{contact.email}</a></div></li>
          {contact.phone && <li><span className="creative-symbol"><Icon name="phone" /></span><div><p className="creative-meta">{labels.phone}</p><a href={`tel:${contact.phone}`}>{contact.phone}</a></div></li>}
          {contact.location && <li><span className="creative-symbol"><Icon name="location" /></span><div><p className="creative-meta">{labels.location}</p><p>{contact.location}</p></div></li>}
        </ul>
        <div className="creative-actions">
          {view.resumeEnabled && <a className="creative-button creative-button-dark" href={view.resume.url} target="_blank" rel="noreferrer">{labels.resume}<Icon name="download" /></a>}
          <ul className="creative-socials">{view.socialLinks.map((item) => <li key={item.key}><a href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}><Icon name={item.key} /></a></li>)}</ul>
        </div>
      </div>
      {form && <div className="creative-card creative-form-card" data-reveal="right">
        <h3>{labels.message}</h3>
        <p className="creative-meta">{formatCopy(labels.delivery, { email: contact.email })}</p>
        <ContactForm copy={copy.contactForm} rows={4} placeholders={{ name: copy.contactForm.namePlaceholder, email: copy.contactForm.emailPlaceholder, message: copy.contactForm.messagePlaceholder }} submitIcon={<Icon name="send" />} />
      </div>}
    </div>
  </section>;
}

// ── Page ──
export default function CreativeHome({ portfolio }) {
  const view = createCreativePresentation(portfolio);
  return <>
    <Hero view={view} />
    <TechnologyStrip view={view} />
    <FeaturedProjects view={view} />
    <About view={view} />
    <Experience view={view} />
    <Skills view={view} />
    <Education view={view} />
    <Certificates view={view} />
    <Writing view={view} />
    <Resume view={view} />
    <Contact view={view} />
  </>;
}
