import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import ChapterHeading from "../ui/chapter-heading";
export default function About({ profile, about, social, displayLocation, copy }) {
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
          <div className="about-story">
            <p className="body-copy">
              {about.personalStatement}
            </p>
            <p className="body-copy">
              {about.engineeringPhilosophy}
            </p>
          </div>
          <a
            className="text-link"
            href={social.linkedIn}
            target="_blank"
            rel="noreferrer"
          >
            {copy.journeyLink}
          </a>
        </div>
        <figure className="portrait">
          <Image
            src={profile.image}
            width={480}
            height={560}
            sizes="(max-width: 767px) 90vw, 360px"
            quality={85}
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
      </div>
    </section>
  );
}
