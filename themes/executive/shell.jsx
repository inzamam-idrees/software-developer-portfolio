import Link from "next/link";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveSocialLinks from "./social-links";

export default function ExecutiveShell({ portfolio, children }) {
  const view = createExecutivePresentation(portfolio);
  return (
    <div className="theme-executive" data-theme-id="executive">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="executive-header">
        <div className="executive-header-inner">
          <Link className="executive-brand" href="/" aria-label={`${view.profile.name} home`}>
            <span aria-hidden="true">II</span><span>{view.profile.name}</span>
          </Link>
          <nav className="executive-desktop-nav" aria-label="Main navigation">
            {view.navigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
            <a className="executive-nav-cta" href={`mailto:${view.contact.email}`}>Start a conversation</a>
          </nav>
          <details className="executive-mobile-nav">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              {view.navigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
              <Link href="/project">All projects</Link><Link href="/blog">Writing</Link>
            </nav>
          </details>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="executive-footer">
        <div className="executive-footer-grid">
          <div><p className="executive-kicker">Senior software engineer</p><p className="executive-footer-statement">{view.about.summary}</p></div>
          <ExecutiveSocialLinks links={view.professionalSocials} compact />
        </div>
        <div className="executive-footer-base">
          <p>© {new Date().getFullYear()} {view.profile.name}</p>
          <div><Link href="/project">Projects</Link><Link href="/blog">Writing</Link><a href={`mailto:${view.contact.email}`}>Email</a></div>
        </div>
      </footer>
    </div>
  );
}
