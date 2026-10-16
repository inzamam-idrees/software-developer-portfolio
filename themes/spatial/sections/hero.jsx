import ModelPlan from "./model-plan";

export default function Hero({ view }) {
  const { profile, copy, contact, resume, settings, graph } = view;
  const hero = copy.home.hero;
  return (
    <section className="spatial-hero" aria-labelledby="spatial-hero-title">
      <div className="spatial-frame spatial-hero-grid">
        <div className="spatial-hero-copy">
          <p className="spatial-hero-role">{profile.designation}</p>
          <h1 id="spatial-hero-title">{profile.name}</h1>
          <p className="spatial-hero-headline">{profile.headline}</p>
          <p className="spatial-hero-intro">{profile.shortIntroduction}</p>
          <div className="spatial-actions">
            <a className="spatial-button is-primary" href={`mailto:${contact.email}`}>
              {hero.contactAction}
            </a>
            {settings.features.resume && (
              <a className="spatial-button" href={resume.url} target="_blank" rel="noreferrer">
                {hero.resumeAction}
              </a>
            )}
          </div>
        </div>
        <figure className="spatial-hero-model spatial-slot" data-spatial-slot="hero">
          <ModelPlan graph={graph} label={hero.modelDescription} />
        </figure>
      </div>
    </section>
  );
}
