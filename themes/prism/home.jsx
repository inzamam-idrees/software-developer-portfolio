import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "@/app/components/homepage/contact/contact-form";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { formatMonth } from "@/lib/portfolio/current-view.mjs";
import { createPrismPresentation } from "./presentation.mjs";
import Scramble from "./client/scramble";
import Heading from "./heading";
import Icon from "./icon";
import Skills from "./client/skills";
import ProjectShowcase from "./client/projects";
import ContactChannel from "./client/contact-channel";
import Articles from "./articles";

export default function PrismHome({ portfolio }) {
  const view = createPrismPresentation(portfolio);
  const { copy, profile } = view;
  const home = copy.home;
  return <>
    <section className="prism-hero prism-frame" id="hero" aria-labelledby="prism-hero-title">
      <div className="prism-hero-copy" data-prism-reveal="hero-copy">
        {profile.availability && <p className="prism-kicker prism-availability"><span />{profile.availability}</p>}
        <p className="prism-label prism-greeting">{home.hero.greeting}</p>
        <h1 className="prism-gradient" id="prism-hero-title"><Scramble text={profile.name} initial /></h1>
        <p className="prism-role">{home.hero.specialized} <span>{view.roles[0]}</span></p>
        <p className="prism-hero-intro">{profile.shortIntroduction}</p>
        <div className="prism-actions">
          <a className="prism-button prism-primary" href="#projects" data-prism-magnetic>{home.hero.projects}<Icon name="next" /></a>
          {view.settings.features.resume && <a className="prism-button" href={view.resume.url} target="_blank" rel="noreferrer" data-prism-magnetic><Icon name="resume" />{view.resume.downloadLabel}</a>}
          <a className="prism-text-button" href="#contact" data-prism-magnetic><Icon name="email" />{home.hero.contact}</a>
        </div>
        <div className="prism-hero-socials"><span className="prism-label">{home.hero.connect}</span><div className="prism-socials">{view.socialLinks.slice(0, 2).map((item) => <a key={item.key} href={item.href} target="_blank" rel="noreferrer" className="prism-icon-button" aria-label={item.label}><Icon name={item.key} /></a>)}<a className="prism-icon-button" href={`mailto:${view.contact.email}`} aria-label={home.contact.email}><Icon name="email" /></a></div></div>
      </div>
      <figure className="prism-portrait" data-prism-tilt={14} data-prism-reveal="portrait">
        <Image src={profile.image} alt={formatCopy(home.hero.portraitAlt, { name: profile.name })} width={600} height={650} priority sizes="(max-width: 900px) 90vw, 40vw" />
        {view.portraitBadges.map((badge, index) => <figcaption className={`prism-floating-badge prism-badge-${index}`} key={index}><Icon name={index ? "code" : "layers"} />{badge}</figcaption>)}
      </figure>
      <a className="prism-scroll-cue" href="#about"><span>{home.hero.scroll}</span><span className="prism-scroll-mouse" aria-hidden="true" /></a>
    </section>
    <section id="about" className="prism-section prism-frame" aria-labelledby="prism-about-title">
      <Heading copy={home.about} id="prism-about-title" centered />
      <div className="prism-about-grid">
        <article className="prism-card" data-prism-reveal data-prism-tilt><div className="prism-card-title"><span className="prism-symbol"><Icon name="layers" /></span><h3>{home.about.summary}</h3></div><p className="prism-body-large">{profile.longIntroduction}</p><p>{view.about.summary}</p><div className="prism-focus-cards">{view.skills.categories.map((group, index) => <div key={group.id}><h4>{String(index + 1).padStart(2, "0")}. {group.label}</h4><p>{group.summary}</p></div>)}</div></article>
        <aside className="prism-about-aside">
          <div id="education">{view.education.map((item) => <article className="prism-card prism-about-education" key={item.id} data-prism-reveal="right" data-prism-tilt={8}>
            <div className="prism-card-title"><span className="prism-symbol"><Icon name="education" /></span><div><p className="prism-label">{home.education.label}</p><h3>{item.institution}</h3></div></div>
            <h4>{item.qualification}</h4><p className="prism-label">{item.duration}</p>{item.description && <p>{item.description}</p>}
          </article>)}</div>
          <article className="prism-card prism-about-mindset" data-prism-reveal="right"><div className="prism-card-title"><Icon name="layers" /><h3>{home.about.philosophy}</h3></div><p>{view.about.engineeringPhilosophy}</p><p className="prism-label"><Icon name="location" />{view.displayLocation}</p></article>
        </aside>
      </div>
    </section>
    <section id="skills" className="prism-section prism-section-tint" aria-labelledby="prism-skills-title"><div className="prism-frame"><Heading copy={home.skills} id="prism-skills-title" centered icon="code" /></div><Skills groups={view.skillGroups} featured={view.skills.all.slice(0, 20)} proficiency={view.skills.proficiency} copy={home.skills} /><div></div></section>
    <section id="projects" className="prism-section prism-frame" aria-labelledby="prism-projects-title"><ProjectShowcase projects={view.featuredProjects} copy={copy} heading={home.projects} /><div className="prism-section-action"><Link className="prism-button" href="/project">{home.projects.all}<Icon name="arrow" /></Link></div></section>
    <section id="experience" className="prism-section prism-section-tint" aria-labelledby="prism-experience-title"><div className="prism-frame"><Heading copy={home.experience} id="prism-experience-title" centered /><ol className="prism-career">{view.experience.map((role) => <li className="prism-card" key={role.id} data-prism-reveal data-prism-tilt><div className="prism-career-head"><span className="prism-symbol"><Icon name="layers" /></span><div><h3>{role.role}</h3><p>{role.company} · {role.location}</p></div><p className="prism-label">{formatMonth(role.startDate)} – {role.current ? home.experience.present : formatMonth(role.endDate)}</p></div>{role.description && <p>{role.description}</p>}<ul className="prism-check-list">{role.highlights.map((text, index) => <li key={index}><Icon name="check" /><span>{text}</span></li>)}</ul><ul className="prism-tags">{role.technologies.map((text) => <li key={text}>{text}</li>)}</ul></li>)}</ol></div></section>
    {view.awards.length > 0 && <section id="awards" className="prism-section prism-frame" aria-labelledby="prism-awards-title"><Heading copy={{ label: home.education.label, heading: home.education.awards }} id="prism-awards-title" centered /><div className="prism-credentials-grid">{view.awards.map((item) => <article className="prism-card" key={item.id} data-prism-reveal><span className="prism-symbol"><Icon name="certificates" /></span><p className="prism-label">{item.duration}</p><h3>{item.title}</h3><p>{item.issuer} · {item.location}</p></article>)}</div></section>}
    {view.certificates.length > 0 && <section id="certificates" className="prism-section prism-section-tint" aria-labelledby="prism-certificates-title"><div className="prism-frame"><Heading copy={home.certificates} id="prism-certificates-title" centered icon="certificates" />{view.certificates.some((item) => item.title.startsWith("[TODO:")) && <p className="prism-placeholder-note">{home.certificates.placeholder}</p>}<div className="prism-credentials-grid">{view.certificates.map((item, index) => <article className="prism-card prism-certificate" key={item.id} data-prism-reveal="card" data-prism-delay={index * 100} data-prism-tilt={7}><div className="prism-card-title"><span className="prism-symbol"><Icon name="certificates" /></span><p className="prism-label">{item.issuer}</p></div><h3>{item.title}</h3>{item.issuedDate && <p><span>{home.certificates.issued}</span> <time dateTime={item.issuedDate}>{item.issuedDate}</time></p>}{item.credentialId && <p>{home.certificates.credentialId}: {item.credentialId}</p>}{item.image && <Image src={item.image} alt={item.title} width={640} height={400} unoptimized className="prism-certificate-image" />}{item.credentialUrl && <a className="prism-button" href={item.credentialUrl} target="_blank" rel="noreferrer">{home.certificates.credential}<Icon name="arrow" /></a>}</article>)}</div></div></section>}
    {view.settings.features.articles && <section id="writing" className="prism-section prism-frame" aria-labelledby="prism-writing-title"><Heading copy={home.writing} id="prism-writing-title" centered icon="writing" /><Suspense fallback={<p>{copy.blogLoading.message}</p>}><Articles view={view} limit={3} /></Suspense><div className="prism-section-action"><Link className="prism-button" href="/blog">{home.writing.all}<Icon name="arrow" /></Link></div></section>}
    {view.settings.features.resume && <section id="resume" className="prism-section prism-section-tint" aria-labelledby="prism-resume-title"><div className="prism-frame"><Heading copy={home.resume} id="prism-resume-title" centered icon="resume" /><div className="prism-card prism-resume" data-prism-reveal><span className="prism-symbol"><Icon name="resume" /></span><div><h3>{view.resume.title}</h3><p>{profile.designation}</p></div><a className="prism-button prism-primary" href={view.resume.url} target="_blank" rel="noreferrer" data-prism-magnetic>{home.resume.open}<Icon name="arrow" /></a></div></div></section>}
    <section id="contact" className="prism-section prism-frame" aria-labelledby="prism-contact-title"><Heading copy={{ label: home.contact.label, heading: view.contact.heading, intro: view.contact.introduction }} id="prism-contact-title" centered icon="email" /><div className="prism-contact-grid"><div><h3>{home.contact.channels}</h3><p className="prism-channel-instruction">{home.contact.channelHint}</p><ContactChannel kind="email" label={home.contact.email} value={view.contact.email} href={`mailto:${view.contact.email}`} copy={home.contact} />{view.contact.phone && <ContactChannel kind="phone" label={home.contact.phone} value={view.contact.phone} href={`tel:${view.contact.phone}`} copy={home.contact} />}{view.socialLinks.map((item) => <ContactChannel key={item.key} kind={item.key} label={item.label} value={item.href.replace(/^https?:\/\//, "")} href={item.href} copy={home.contact} />)}</div>{view.settings.features.contactForm && view.contact.form.enabled && <div className="prism-card" data-prism-reveal="right" data-prism-tilt={4}><div className="prism-card-title"><span className="prism-symbol"><Icon name="email" /></span><div><h3>{home.contact.message}</h3><p className="prism-label">{formatCopy(home.contact.delivery, { email: view.contact.email })}</p></div></div><ContactForm copy={copy.contactForm} rows={4} placeholders={{ name: copy.contactForm.namePlaceholder, email: copy.contactForm.emailPlaceholder, message: copy.contactForm.messagePlaceholder }} submitIcon={<Icon name="send" />} /></div>}</div></section>
  </>;
}
