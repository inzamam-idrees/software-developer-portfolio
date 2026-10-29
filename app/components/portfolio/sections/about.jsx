import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ProfileRoles from "@/themes/shared/profile-roles";
import ChapterHeading from "../ui/chapter-heading";
import Stats from "../ui/stats";
export default function About({ profile, about, social, stats, resume, displayLocation, copy, actions, rolesLabel }) {
  return (
    <section
      id="about"
      className="chapter container"
      aria-labelledby="about-heading"
    >
      <div className="about-grid">
        <div data-reveal>
          <ChapterHeading id="about" number="02" label={copy.label} title={copy.heading} />
          <p className="about-lead">
            {about.summary}
          </p>
          <p className="body-copy">{about.engineeringPhilosophy}</p>
          <ProfileRoles profile={profile} label={rolesLabel} />
          <details className="about-story">
            <summary>{copy.readMore}</summary>
            {profile.longIntroduction && (
              <p className="body-copy">{profile.longIntroduction}</p>
            )}
            {about.personalStatement && !profile.longIntroduction?.includes(about.personalStatement) && (
              <p className="body-copy">{about.personalStatement}</p>
            )}
          </details>
          <div className="actions">
            {resume && (
              <a className="button primary" href={resume.url} target="_blank" rel="noreferrer">
                {actions.resumeAction}
              </a>
            )}
            <a className="button secondary" href="#contact">
              {actions.contactAction}
            </a>
            <a className="text-link" href={social.linkedIn} target="_blank" rel="noreferrer">
              {copy.journeyLink}
            </a>
          </div>
        </div>
        <figure className="portrait">
          {profile.headline && (
            <p className="portrait-note" aria-hidden="true">
              {profile.headline}
            </p>
          )}
          <Image
            src="/inzamam_profile-cutout.webp"
            width={800}
            height={800}
            sizes="(max-width: 767px) 80vw, 420px"
            alt={formatCopy(copy.portraitAlt, {
              name: profile.name,
              designation: profile.designation,
            })}
          />
          <figcaption>
            <span>{profile.name}</span>
            <span>{displayLocation.toUpperCase()}</span>
          </figcaption>
        </figure>
        <Stats stats={stats} className="about-stats" />
      </div>
    </section>
  );
}
