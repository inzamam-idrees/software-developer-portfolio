import Link from "next/link";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { createExecutivePresentation } from "./presentation.mjs";
import ExecutiveSocialLinks from "./social-links";

export default function ExecutiveShell({ portfolio, children }) {
  const view = createExecutivePresentation(portfolio);
  const copy = view.copy;
  return (
    <div className="theme-executive" data-theme-id="executive">
      <link rel="stylesheet" href={themeStylesheetHref("executive")} precedence="theme" />
      <a className="skip-link" href="#main-content">{copy.navigation.skipToContent}</a>
      <header className="executive-header">
        <div className="executive-header-inner">
          <Link className="executive-brand" href="/" aria-label={formatCopy(copy.navigation.homeLink, { name: view.profile.name })}>
            <span aria-hidden="true">{view.monogram}</span><span>{view.profile.name}</span>
          </Link>
          <nav className="executive-desktop-nav" aria-label={copy.navigation.main}>
            {view.navigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
            <a className="executive-nav-cta" href={`mailto:${view.contact.email}`}>{copy.actions.startConversation}</a>
          </nav>
          <details className="executive-mobile-nav">
            <summary>{copy.navigation.menu}</summary>
            <nav aria-label={copy.navigation.mobile}>
              {view.navigation.map((item) => <Link href={item.href} key={item.id}>{item.label}</Link>)}
              <Link href="/project">{copy.navigation.allProjects}</Link><Link href="/blog">{copy.navigation.writing}</Link>
            </nav>
          </details>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="executive-footer">
        <div className="executive-footer-grid">
          <div><p className="executive-kicker">{view.profile.designation}</p><p className="executive-footer-statement">{view.about.summary}</p></div>
          <ExecutiveSocialLinks links={view.professionalSocials} compact />
        </div>
        <div className="executive-footer-base">
          <p>© {new Date().getFullYear()} {view.profile.name}</p>
          <div><Link href="/project">{copy.footer.projects}</Link><Link href="/blog">{copy.footer.writing}</Link><a href={`mailto:${view.contact.email}`}>{copy.footer.email}</a></div>
        </div>
      </footer>
    </div>
  );
}
