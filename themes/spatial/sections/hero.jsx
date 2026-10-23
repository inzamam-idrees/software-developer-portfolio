import AccentText from "./accent-text";
import OrbitPortrait from "./orbit-portrait";

export default function Hero({ view }) {
  const { profile, copy, contact, resume, settings } = view;
  const hero = copy.home.hero;
  const experience = profile.experienceLabel.match(/^(\d+)(.*)$/);
  const stats = [
    { value: experience?.[1], suffix: experience?.[2]?.trim().startsWith("+") ? "+" : "", label: hero.stats.experience, fallback: profile.experienceLabel },
    { value: view.experience.length, label: hero.stats.roles },
    { value: view.projects.length, label: hero.stats.projects },
  ];
  const technologies = [...new Set(view.skillGroups.flatMap((group) => group.technologies.map((technology) => technology.label)))].slice(0, 12);
  return (
    <section id="hero" className="spatial-hero" aria-labelledby="spatial-hero-title">
      <div className="spatial-frame">
        <div className="spatial-hero-grid">
          <div className="spatial-hero-copy">
            <p className="spatial-hero-role">{profile.designation}</p>
            <h1 id="spatial-hero-title" aria-label={profile.name}>
              {profile.name.split(/\s+/).map((word, index) => <span className="spatial-mask" key={`${word}-${index}`} aria-hidden="true"><span style={{ animationDelay: `${index * 90}ms` }}>{word}</span></span>)}
            </h1>
            <p className="spatial-hero-headline"><AccentText>{profile.headline}</AccentText></p>
            <p className="spatial-hero-intro">{profile.shortIntroduction}</p>
            <div className="spatial-actions">
              <a className="spatial-button is-primary" href={`mailto:${contact.email}`}>
                {hero.contactAction}<span aria-hidden="true">↗</span>
              </a>
              {settings.features.resume && <a className="spatial-button is-secondary" href={resume.url} target="_blank" rel="noreferrer">{hero.resumeAction}<span aria-hidden="true">↗</span></a>}
            </div>
            <dl className="spatial-hero-stats">
              {stats.map((stat) => <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value !== undefined && stat.value !== null ? <><span data-count-target={stat.value}>{stat.value}</span>{stat.suffix}</> : stat.fallback}</dd>
              </div>)}
            </dl>
          </div>
          <div className="spatial-hero-visual">
            <OrbitPortrait profile={profile} copy={copy} location={view.displayLocation} />
          </div>
        </div>
        <div className="spatial-stack-strip" aria-label={hero.stackLabel}>
          <p>{hero.stackLabel}</p>
          <div className="spatial-stack-window"><div className="spatial-stack-track">
            <ul>{technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
            <ul aria-hidden="true">{technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
          </div></div>
        </div>
      </div>
    </section>
  );
}
