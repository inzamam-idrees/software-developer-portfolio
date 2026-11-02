import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveEnhancement from "./enhancement";
import ExecutiveMotionControl from "./motion-control";
import ExecutiveIcon from "./icon";
import { reading, display, script } from "./fonts";
import ExecutiveSocialLinks from "./social-links";

export default function ExecutiveShell({ portfolio, children }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  const homeLabel = formatCopy(copy.navigation.homeLink, { name: view.profile.name });
  return (
    <div className={`theme-executive ${reading.variable} ${display.variable} ${script.variable}`} data-theme-id="executive">
      <link rel="stylesheet" href={themeStylesheetHref("executive")} precedence="theme" />
      <a className="skip-link" href="#main-content">{copy.navigation.skipToContent}</a>
      <header className="executive-header">
        <div className="executive-header-inner">
          <Link className="executive-brand" href="/" aria-label={homeLabel}>
            <span className="executive-monogram" aria-hidden="true">{view.monogram}</span>
            <span className="executive-brand-name">{view.profile.name}</span>
          </Link>
          <nav className="executive-desktop-nav" aria-label={copy.navigation.main}>
            {view.siteNavigation.map((item) => <Link href={item.href} key={item.id} data-section-link={item.id}>{item.label}</Link>)}
          </nav>
          <div className="executive-header-actions">
            <ExecutiveMotionControl copy={copy.motion} />
            {view.settings.features.resume && <a className="executive-button secondary executive-nav-cta" href={view.resume.url} target="_blank" rel="noreferrer">{copy.actions.downloadCv}<ExecutiveIcon kind="download" /></a>}
            <details className="executive-mobile-nav">
              <summary>{copy.navigation.menu}</summary>
              <nav aria-label={copy.navigation.mobile}>
                {view.siteNavigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
                <Link href="/project">{copy.navigation.allProjects}</Link>
                {view.settings.features.resume && <a href={view.resume.url} target="_blank" rel="noreferrer">{copy.actions.downloadCv}</a>}
              </nav>
            </details>
          </div>
        </div>
      </header>
      <ExecutiveEnhancement />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="executive-footer">
        <div className="executive-footer-grid">
          <div>
            <Link className="executive-brand" href="/" aria-label={homeLabel}><span className="executive-monogram" aria-hidden="true">{view.monogram}</span><span className="executive-brand-name">{view.profile.name}</span></Link>
            <p className="executive-footer-statement">{view.about.summary}</p>
          </div>
          <nav aria-label={copy.navigation.footer} className="executive-footer-nav">
            {view.siteNavigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
          </nav>
          <ExecutiveSocialLinks links={view.professionalSocials} compact />
        </div>
        <div className="executive-footer-base">
          <p>© {new Date().getFullYear()} {view.profile.name}</p>
          <div><Link href="/project">{copy.footer.projects}</Link><Link href="/blog">{copy.footer.writing}</Link><a href={`mailto:${view.contact.email}`}>{copy.footer.email}</a></div>
          <Link className="executive-back-to-top" href="/#hero">{copy.actions.backToTop}<ExecutiveIcon kind="up" /></Link>
        </div>
      </footer>
    </div>
  );
}
