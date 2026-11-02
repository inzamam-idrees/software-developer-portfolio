import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { resumePreviewUrl } from "../shared/resume-preview.mjs";
import ProfileRoles from "../shared/profile-roles";
import { AboutPortrait } from "./splash";
import SkillsTabs from "./client/skills-tabs";
import TechIcon from "./tech-icon";
import Icon from "./icon";

// ── Shared heading (rotated subtitle on desktop, as the reference) ──
// The label is a flow item (vertical text at >=992px) beside the main column,
// so its length always pushes the following content down instead of overlapping.
function HeadingParts({ id, title, text, level = 2 }) {
  const Title = level === 1 ? "h1" : "h2";
  return <>
    <Title id={id} className="sienna-h3 sienna-section-title" data-reveal="up">{title}</Title>
    {text && <p className="sienna-section-text" data-reveal="up">{text}</p>}
  </>;
}

export function SectionLabel({ children }) {
  return <p className="sienna-section-subtitle">{children}</p>;
}

export function SectionHeading({ children, label, ...heading }) {
  return <div className="sienna-section-content">
    <SectionLabel>{label}</SectionLabel>
    <div className="sienna-section-main">
      <HeadingParts {...heading} />
      {children}
    </div>
  </div>;
}

// ── About ──
export function About({ view }) {
  const { copy, profile } = view;
  const about = copy.home.about;
  return <section className="sienna-section sienna-about" id="about" aria-labelledby="sienna-about-title">
    <figure className="sienna-about-banner" data-reveal="left">
      <AboutPortrait src={view.aboutImage} cutout={view.aboutCutout} alt={formatCopy(copy.home.hero.portraitAlt, { name: profile.name })} />
    </figure>
    <SectionHeading id="sienna-about-title" label={about.label} title={view.about.summary || about.heading} text={view.about.personalStatement || profile.longIntroduction}>
      <ProfileRoles profile={profile} label={copy.contentSections.roles} />
      <div className="sienna-btn-group" data-reveal="up">
        <a className="sienna-btn sienna-btn-secondary" href="#contact">{about.hire}</a>
        {view.resumeEnabled && view.resume?.url && <a className="sienna-btn sienna-btn-primary" href={view.resume.url} target="_blank" rel="noopener noreferrer">{about.download}</a>}
      </div>
    </SectionHeading>
  </section>;
}

// ── Skills ──
// Only the first panel staggers in on scroll; panels opened later fade in as a
// whole, so a tab switch never waits on an observer to reveal hidden tiles.
function SkillTile({ name, level, template, index, reveal }) {
  return <li data-reveal={reveal ? "pop" : undefined} style={reveal ? { "--i": index % 12 } : undefined}>
    <div className="sienna-skill-card">
      <span className="sienna-tooltip" aria-hidden="true">{name}{level != null && <small>{formatCopy(template, { level })}</small>}</span>
      <TechIcon name={name} />
      <span className="sienna-sr-only">{name}{level != null && <>{" "}{formatCopy(template, { level })}</>}</span>
    </div>
  </li>;
}

export function Skills({ view }) {
  const { copy } = view;
  const skills = copy.home.skills;
  if (!view.skillGroups.length) return null;
  const tabs = view.skillGroups.map((group, panel) => ({
    id: group.id,
    label: group.label,
    panel: <>
      <h3 className="sienna-skills-panel-title">{group.label}</h3>
      <ul className="sienna-skills-list">
        {group.skills.map((name, index) => <SkillTile key={name} name={name} index={index} reveal={panel === 0} level={view.skills.proficiency?.[name]} template={copy.contentSections.proficiency} />)}
      </ul>
    </>,
  }));
  return <section className="sienna-section sienna-skills" id="skills" aria-labelledby="sienna-skills-title">
    {/* The toggle sits inside the heading block, as in the reference. */}
    <SkillsTabs label={skills.tabs} tabs={tabs} subtitle={<SectionLabel>{skills.label}</SectionLabel>} heading={<HeadingParts id="sienna-skills-title" title={skills.heading} text={skills.intro} />} />
  </section>;
}

// ── Experience ──
// The first points stay visible; the rest sit in a native disclosure so long
// roles stay compact and everything remains reachable without JavaScript.
const VISIBLE_HIGHLIGHTS = 4;

function Highlights({ items = [], copy }) {
  if (!items.length) return null;
  const list = (entries) => <ul className="sienna-timeline-highlights">{entries.map((text) => <li key={text}>{text}</li>)}</ul>;
  const rest = items.slice(VISIBLE_HIGHLIGHTS);
  return <>
    {list(items.slice(0, VISIBLE_HIGHLIGHTS))}
    {!!rest.length && <details className="sienna-more">
      <summary><span className="sienna-more-closed">{formatCopy(copy.more, { count: rest.length })}</span><span className="sienna-more-open">{copy.less}</span><Icon name="chevron" /></summary>
      {list(rest)}
    </details>}
  </>;
}

export function Experience({ view }) {
  const experience = view.copy.home.experience;
  if (!view.timeline.length) return null;
  return <section className="sienna-section sienna-experience" id="experience" aria-labelledby="sienna-experience-title">
    <SectionHeading id="sienna-experience-title" label={experience.label} title={experience.heading} text={experience.intro} />
    <ol className="sienna-timeline">
      {view.timeline.map((item, index) => <li key={item.id} className="sienna-timeline-item" data-reveal="up" style={{ "--i": index }}>
        <article className="sienna-card sienna-timeline-card">
          <header className="sienna-timeline-head">
            <span className="sienna-card-icon sienna-card-icon-sm"><Icon name="work" /></span>
            <div>
              <h3 className="sienna-h4 sienna-timeline-role">{item.role}</h3>
              <p className="sienna-timeline-company">{item.company}{item.location && <span>{item.location}</span>}</p>
            </div>
            <p className="sienna-timeline-period"><time dateTime={item.startDate}>{item.period[0]}</time>{" – "}{item.current || !item.endDate ? <span>{item.period[1]}</span> : <time dateTime={item.endDate}>{item.period[1]}</time>}</p>
          </header>
          {item.description && <p className="sienna-section-text">{item.description}</p>}
          <Highlights items={item.highlights} copy={experience} />
          {!!item.technologies?.length && <ul className="sienna-chips">{item.technologies.map((name) => <li key={name}>{name}</li>)}</ul>}
        </article>
      </li>)}
    </ol>
  </section>;
}

// ── Education and awards ──
export function Education({ view }) {
  const education = view.copy.home.education;
  if (!view.education.length && !view.awards.length) return null;
  const items = (list, icon, render) => <ul className="sienna-info-list">{list.map((item, index) => <li key={item.id} data-reveal="up" style={{ "--i": index }}>
    <article className="sienna-card sienna-info-card"><span className="sienna-card-icon sienna-card-icon-sm"><Icon name={icon} /></span><div>{render(item)}</div></article>
  </li>)}</ul>;
  return <section className="sienna-section sienna-education" id="education" aria-labelledby="sienna-education-title">
    <SectionHeading id="sienna-education-title" label={education.label} title={education.heading} text={education.intro} />
    <div className="sienna-education-grid">
      {!!view.education.length && <div>
        <h3 className="sienna-h4 sienna-group-title">{education.label}</h3>
        {items([...view.education].sort((a, b) => a.order - b.order), "education", (item) => <>
          <h4 className="sienna-h4">{item.qualification}</h4>
          <p className="sienna-info-meta">{item.institution}</p>
          <p className="sienna-info-period">{item.duration}</p>
          {item.description && <p className="sienna-info-text">{item.description}</p>}
        </>)}
      </div>}
      {!!view.awards.length && <div id="awards">
        <h3 className="sienna-h4 sienna-group-title">{education.awards}</h3>
        {items([...view.awards].sort((a, b) => a.order - b.order), "trophy", (item) => <>
          <h4 className="sienna-h4">{item.title}</h4>
          <p className="sienna-info-meta">{[item.issuer, item.location].filter(Boolean).join(" · ")}</p>
          <p className="sienna-info-period">{item.duration}</p>
        </>)}
      </div>}
    </div>
  </section>;
}

// ── Certificates (canonical records, Sienna styling) ──
export function Certificates({ view }) {
  const copy = view.copy.contentSections.certificates;
  const section = view.copy.home.certificates;
  if (!view.certificates.length) return null;
  const statusIcon = { "in-progress": "clock", completed: "check", verified: "shield" };
  return <section className="sienna-section sienna-certificates" id="certificates" aria-labelledby="sienna-certificates-title">
    <SectionHeading id="sienna-certificates-title" label={section.label} title={section.heading} text={copy.description} />
    <div className="sienna-section-body">
      {view.certificates.some((item) => item.title.startsWith("[TODO:")) && <p className="sienna-section-text">{copy.placeholder}</p>}
      <ul className="sienna-cert-grid">
        {view.certificates.map((item, index) => <li key={item.id} data-reveal="up" style={{ "--i": index }}>
          <article className="sienna-card sienna-cert-card">
            <div className="sienna-cert-top">
              <span className="sienna-card-icon sienna-card-icon-sm"><Icon name="award" /></span>
              <p className="sienna-cert-issuer">{item.issuer}{item.issuedDate && <time dateTime={item.issuedDate}>{item.issuedDate.slice(0, 4)}</time>}</p>
              {item.status && <span className="sienna-cert-status" data-status={item.status}><Icon name={statusIcon[item.status]} />{copy.statuses[item.status]}</span>}
            </div>
            <h3 className="sienna-h4">{item.title}</h3>
            {item.description && <p className="sienna-info-text">{item.description}</p>}
            {!!item.competencies?.length && <div className="sienna-cert-skills"><h4>{copy.competencies}</h4><ul className="sienna-chips">{item.competencies.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
            {item.credentialId && <p className="sienna-cert-id">{copy.credentialId}: {item.credentialId}</p>}
            {item.image && /* eslint-disable-next-line @next/next/no-img-element */ <img className="sienna-cert-image" src={item.image} alt={item.title} width={640} height={400} loading="lazy" decoding="async" />}
            {item.credentialUrl && <a className="sienna-text-link sienna-cert-link" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">{copy.credential}<Icon name="open" /></a>}
          </article>
        </li>)}
      </ul>
    </div>
  </section>;
}

// ── Résumé preview (canonical document, embed URL from the shared helper) ──
export function Resume({ view }) {
  if (!view.resumeEnabled || !view.resume?.url) return null;
  const copy = view.copy.contentSections.resume;
  const section = view.copy.home.resume;
  const preview = resumePreviewUrl(view.resume.url);
  return <section className="sienna-section sienna-resume" id="resume" aria-labelledby="sienna-resume-title">
    <SectionHeading id="sienna-resume-title" label={section.label} title={section.heading} />
    <div className="sienna-card sienna-resume-card" data-reveal="up">
      <div className="sienna-resume-bar">
        <span className="sienna-card-icon sienna-card-icon-sm"><Icon name="resume" /></span>
        <h3 className="sienna-h4">{view.resume.title}</h3>
        <a className="sienna-btn sienna-btn-secondary" href={view.resume.url} target="_blank" rel="noopener noreferrer">{copy.open}</a>
      </div>
      {preview && <>
        <iframe className="sienna-resume-frame" src={preview} title={copy.viewer} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        <p className="sienna-info-text">{copy.previewFallback}</p>
      </>}
    </div>
  </section>;
}
