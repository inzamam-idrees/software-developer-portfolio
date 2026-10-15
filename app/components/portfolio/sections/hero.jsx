import { splitHeadline } from "@/lib/portfolio/format-copy.mjs";
import SceneFallback from "../scene/scene-fallback";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";

export default function Hero({ profile, resume, skills, displayLocation, copy }) {
  const connector = copy.headlineConnector;
  const [headlineLead, headlineEmphasis] = splitHeadline(
    profile.headline,
    connector,
  );
  return (
    <section id="hero" className="hero container" aria-labelledby="hero-title">
      <div className="hero-top hero-metadata">
        <p className="eyebrow">
          <span className="status-dot" aria-hidden="true" />
          {profile.experienceLabel.toUpperCase()} <span aria-hidden="true">/</span>{" "}
          {profile.focusLabel.toUpperCase()}
        </p>
        <p className="eyebrow hero-coordinate">
          {profile.designation} <span aria-hidden="true">/</span>{" "}
          {displayLocation.toUpperCase()}
        </p>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-name">{profile.name}</p>
          <h1 id="hero-title" data-reveal>
            {headlineLead}
            {headlineEmphasis && (
              <>
                <br />
                {connector}{" "}
                <span className="serif-word">{headlineEmphasis}</span>
              </>
            )}
          </h1>
          <p className="hero-description" data-reveal>
            {profile.shortIntroduction}
          </p>
          <div className="actions" data-reveal>
            <a className="button primary" href="#projects">
              {copy.primaryAction} <FiArrowDownRight aria-hidden="true" />
            </a>
            <a
              className="button secondary"
              href={resume.url}
              target="_blank"
              rel="noreferrer"
            >
              {copy.resumeAction} <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <SceneFallback />
          <span className="visual-caption">
            {copy.visualCaption} <span>{copy.visualCaptionDetail}</span>
          </span>
        </div>
      </div>
      <div className="hero-bottom">
        <p>
          {copy.closingLead}
          <br />
          <span className="muted">{copy.closingMuted}</span>
        </p>
        <div className="hero-tech">
          {skills.featured.join(" / ").toUpperCase()}
        </div>
        <a href="#projects" className="scroll-cue">
          {copy.scrollCue} <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
