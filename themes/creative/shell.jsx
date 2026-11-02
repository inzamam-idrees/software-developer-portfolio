import Link from "next/link";
import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createCreativePresentation } from "./presentation.mjs";
import MobileNavigation from "./client/navigation";
import DesktopNavigation from "./client/desktop-navigation";
import Motion from "./client/motion";
import { BrandMark } from "./art";
import Icon from "./icon";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--creative-sans" });
const script = Caveat({ subsets: ["latin"], display: "swap", preload: false, weight: ["500"], variable: "--creative-script" });

export default function CreativeShell({ portfolio, children }) {
  const view = createCreativePresentation(portfolio);
  const { copy, profile } = view;
  const resume = view.resumeEnabled ? { href: view.resume.url, label: copy.navigation.download } : null;
  const brand = <Link className="creative-brand" href="/" aria-label={formatCopy(copy.navigation.homeLink, { name: profile.name })}><BrandMark /><span>{profile.name}</span></Link>;
  return <div className={`theme-creative ${sans.variable} ${script.variable}`} data-theme-id="creative" data-motion={view.settings.features.animations ? "on" : "off"}>
    <link rel="stylesheet" href={themeStylesheetHref("creative")} precedence="theme" />
    <a className="creative-skip" href="#main-content">{copy.navigation.skipToContent}</a>
    <header className="creative-header">
      <div className="creative-nav-bar creative-frame">
        {brand}
        <DesktopNavigation links={view.navigation} label={copy.navigation.main} />
        <div className="creative-nav-actions">
          {resume && <a className="creative-button creative-button-dark creative-nav-cv" href={resume.href} target="_blank" rel="noreferrer">{resume.label}</a>}
          <MobileNavigation links={view.navigation} copy={copy.navigation} resume={resume} />
        </div>
      </div>
    </header>
    <Motion enabled={view.settings.features.animations} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="creative-footer">
      <div className="creative-frame creative-footer-grid">
        <div className="creative-footer-intro">{brand}<p>{profile.shortIntroduction}</p></div>
        <nav aria-label={copy.navigation.footer}>
          <p className="creative-eyebrow">{copy.footer.navigation}</p>
          <ul>{view.sectionNavigation.map((item) => <li key={item.id}><Link href={item.href}>{item.label}</Link></li>)}<li><Link href="/project">{copy.navigation.items.projects}</Link></li>{view.settings.features.articles && <li><Link href="/blog">{copy.navigation.items.blog}</Link></li>}</ul>
        </nav>
        <div>
          <p className="creative-eyebrow">{copy.footer.connect}</p>
          <ul className="creative-socials">{view.socialLinks.map((item) => <li key={item.key}><a href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}><Icon name={item.key} /></a></li>)}<li><a href={`mailto:${view.contact.email}`} aria-label={copy.home.contact.email}><Icon name="email" /></a></li></ul>
        </div>
      </div>
      <div className="creative-frame creative-footer-base"><p>© {new Date().getFullYear()} {profile.name}</p><a href="#main-content">{copy.footer.backToTop}<Icon name="up" /></a></div>
    </footer>
  </div>;
}
