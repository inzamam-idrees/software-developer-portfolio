import SceneFallback from "../scene/scene-fallback";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";

export default function Hero({ profile, resume, skills, displayLocation }) {
  const [headlineLead, headlineEmphasis] = profile.headline.split(/\s+with\s+/i);
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
            <br />
            with <span className="serif-word">{headlineEmphasis}</span>
          </h1>
          <p className="hero-description" data-reveal>
            {profile.shortIntroduction}
          </p>
          <div className="actions" data-reveal>
            <a className="button primary" href="#projects">
              Explore my work <FiArrowDownRight aria-hidden="true" />
            </a>
            <a
              className="button secondary"
              href={resume.url}
              target="_blank"
              rel="noreferrer"
            >
              Résumé <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <SceneFallback />
          <span className="visual-caption">
            SYSTEM_01 <span>INTERFACE → INFRASTRUCTURE</span>
          </span>
        </div>
      </div>
      <div className="hero-bottom">
        <p>
          Frontend precision.
          <br />
          <span className="muted">Full-stack perspective.</span>
        </p>
        <div className="hero-tech">
          {skills.featured.join(" / ").toUpperCase()}
        </div>
        <a href="#projects" className="scroll-cue">
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
