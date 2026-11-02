import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createSiennaPresentation } from "./presentation.mjs";
import Splash, { ShirtTone, SplashForeground } from "./splash";
import Icon from "./icon";
import { About, Certificates, Education, Experience, Resume, Skills } from "./sections";
import Works from "./works";
import { Writing } from "./writing";
import Contact from "./contact";

// ── Hero figure ──
// Native images: they work without JS and keep the canonical paths untouched.
/* eslint-disable @next/next/no-img-element */
function HeroFigure({ portrait, alt }) {
  if (portrait.kind === "artwork") {
    return <figure className="sienna-hero-banner sienna-hero-banner-artwork">
      <span className="sienna-hero-float">
        <img className="sienna-hero-artwork" src={portrait.src} alt={alt} width={1363} height={1154} fetchPriority="high" />
      </span>
    </figure>;
  }
  const cutout = portrait.kind === "cutout";
  return <figure className="sienna-hero-banner">
    <Splash variant="hero" />
    {cutout && <ShirtTone id="sienna-shirt-tone" />}
    <span className="sienna-hero-float">
      <img className={cutout ? "sienna-hero-portrait sienna-hero-cutout" : "sienna-hero-portrait sienna-hero-photo"} src={portrait.src} alt={alt} width={800} height={800} fetchPriority="high" />
      {/* Untinted copy above the collar keeps face highlights out of the shirt tone. */}
      {cutout && <img className="sienna-hero-portrait sienna-hero-face" src={portrait.src} alt="" width={800} height={800} aria-hidden="true" />}
    </span>
    {cutout && <SplashForeground variant="hero" />}
  </figure>;
}
/* eslint-enable @next/next/no-img-element */

// ── Sections ──
function Hero({ view }) {
  const { copy, profile, portrait } = view;
  const hero = copy.home.hero;
  return <section className="sienna-hero" id="home" aria-labelledby="sienna-hero-title">
    <HeroFigure portrait={portrait} alt={formatCopy(hero.portraitAlt, { name: profile.name })} />
    <div className={portrait.kind === "photo" ? "sienna-hero-content sienna-hero-content-scrim" : "sienna-hero-content"}>
      <span className="sienna-hero-scrim" aria-hidden="true" />
      <h1 id="sienna-hero-title" className="sienna-h2 sienna-hero-title" style={{ "--i": 0 }}>{profile.headline}</h1>
      <a href="#contact" className="sienna-btn sienna-btn-primary" style={{ "--i": 1 }}>{hero.cta}</a>
    </div>
    {!!view.socialLinks.length && <ul className="sienna-hero-social" aria-label={hero.social}>
      {view.socialLinks.map((item, index) => <li key={item.key} style={{ "--i": index }}>
        <a href={item.href} className="sienna-hero-social-link" target="_blank" rel="noreferrer" aria-label={item.label}>
          <Icon name={item.key} />
          <span className="sienna-tooltip" aria-hidden="true">{item.label}</span>
        </a>
      </li>)}
    </ul>}
    <a href="#stats" className="sienna-scroll-down">{hero.scroll}</a>
  </section>;
}

function Stats({ view }) {
  const stats = view.copy.home.stats;
  if (!view.stats.length) return null;
  return <section className="sienna-stats" id="stats" aria-labelledby="sienna-stats-title">
    <h2 id="sienna-stats-title" className="sienna-sr-only">{stats.label}</h2>
    <ul className="sienna-stats-list">
      {view.stats.map((item, index) => <li key={item.id} data-reveal="up" style={{ "--i": index }}>
        <a href={item.href} className="sienna-stats-card">
          <span className="sienna-card-icon"><Icon name={item.icon} /></span>
          <span className="sienna-h2 sienna-stats-title">
            <span className="sienna-stats-number"><span data-count={item.value} aria-hidden="true">{item.value}</span><span className="sienna-sr-only">{item.value}</span>{item.plus && stats.plus}</span>
            <strong>{item.label}</strong>
          </span>
          <Icon name="chevron" className="sienna-stats-chevron" />
        </a>
      </li>)}
    </ul>
  </section>;
}

export default function SiennaHome({ portfolio }) {
  const view = createSiennaPresentation(portfolio);
  return <article className="sienna-container">
    <Hero view={view} />
    <Stats view={view} />
    <About view={view} />
    <Skills view={view} />
    <Works view={view} />
    <Experience view={view} />
    <Education view={view} />
    <Certificates view={view} />
    <Resume view={view} />
    <Writing view={view} />
    <Contact view={view} />
  </article>;
}
