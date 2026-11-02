import Image from "next/image";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import SceneFallback from "../scene/scene-fallback";
import IntroTour from "../ui/intro-tour";
import Stats from "../ui/stats";
import { FiArrowRight } from "react-icons/fi";

// ── Code card ──
function CodeCard({ profile, displayLocation, copy }) {
  const entries = [
    [copy.codeKeys.name, profile.name],
    [copy.codeKeys.role, profile.designation],
    [copy.codeKeys.location, displayLocation],
    [copy.codeKeys.focus, profile.focusLabel],
  ];
  return (
    <figure className="hero-code" aria-label={copy.codeLabel}>
      <pre>
        <code>
          <span className="code-keyword">{copy.codeKeyword}</span>{" "}
          <span className="code-variable">{copy.codeVariable}</span> {"= {"}
          {entries.map(([key, value]) => (
            <span key={key} className="code-line">
              {"  "}
              <span className="code-key">{key}</span>
              {": "}
              <span className="code-string">{JSON.stringify(value)}</span>
              {","}
            </span>
          ))}
          <span className="code-line">{"};"}</span>
        </code>
      </pre>
    </figure>
  );
}

export default function Hero({ profile, skills, stats, displayLocation, copy }) {
  const [firstName, ...restName] = profile.name.split(" ");
  return (
    <section id="hero" className="hero container" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-traits eyebrow" data-reveal>
            {profile.traits.map((trait) => (
              <span key={trait.id}>{trait.label}</span>
            ))}
          </p>
          <h1 id="hero-title" data-reveal>
            <span className="name-first">{firstName}</span>
            {restName.length > 0 && <span className="name-last">{restName.join(" ")}</span>}
          </h1>
          <p className="hero-designation" data-reveal>{profile.designation}</p>
          <p className="hero-description" data-reveal>
            {profile.shortIntroduction}
          </p>
          <div className="actions" data-reveal>
            <a className="button primary" href="#projects">
              {copy.primaryAction} <FiArrowRight aria-hidden="true" />
            </a>
            <IntroTour label={copy.watchIntro} stopLabel={copy.stopIntro} />
          </div>
          <Stats stats={stats} className="hero-stats" />
          <a href="#about" className="scroll-cue">
            <span className="scroll-mouse" aria-hidden="true" />
            {copy.scrollLabel}
          </a>
        </div>
        <div className="hero-visual">
          <div className="hero-fallback" aria-hidden="true">
            <SceneFallback />
          </div>
          <div className="hero-platform" aria-hidden="true" />
          <Image
            className="hero-portrait"
            src="/inzamam_profile-cutout.webp"
            width={800}
            height={800}
            priority
            sizes="(max-width: 767px) 80vw, 520px"
            alt={formatCopy(copy.portraitAlt, {
              name: profile.name,
              designation: profile.designation,
            })}
          />
          <ul className="hero-chips" aria-label={copy.chipsLabel}>
            {skills.categories.map((group, index) => (
              <li key={group.id} className={`hero-chip chip-${index}`}>
                {group.label}
              </li>
            ))}
          </ul>
          <CodeCard profile={profile} displayLocation={displayLocation} copy={copy} />
        </div>
      </div>
    </section>
  );
}
