import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createPrismPresentation } from "./presentation.mjs";
import Scramble from "./client/scramble";
import Controls from "./client/controls";
import Navigation from "./client/navigation";
import Icon from "./icon";

const heading = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--prism-heading-font" });

export default function PrismShell({ portfolio, children }) {
  const view = createPrismPresentation(portfolio);
  const { copy } = view;
  return <div className={`theme-prism ${heading.variable}`} data-theme-id="prism">
    <link rel="stylesheet" href={themeStylesheetHref("prism")} precedence="theme" />
    <Controls copy={{ navigation: copy.navigation, motion: copy.motion, project: copy.project }} enabled={view.settings.features.animations}>
      <a className="prism-skip" href="#main-content">{copy.navigation.skipToContent}</a>
      <header className="prism-header">
        <div className="prism-header-inner prism-frame">
          <Link className="prism-brand" href="/" aria-label={formatCopy(copy.navigation.homeLink, { name: view.profile.name })}>
            <span className="prism-monogram" aria-hidden="true"><Scramble text={view.monogram} initial /></span><span>{view.profile.name}<small>{view.profile.designation}</small></span>
          </Link>
          <Navigation links={view.navigation} copy={copy} resume={view.settings.features.resume ? view.resume : null} name={view.profile.name} monogram={view.monogram} />
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="prism-footer prism-frame">
        <div className="prism-footer-grid">
          <div><Link className="prism-brand" href="/"><span className="prism-monogram" aria-hidden="true">{view.monogram}</span>{view.profile.name}</Link>
            <p>{view.profile.shortIntroduction}</p>
            <div className="prism-socials">{view.socialLinks.map((item) => <a className="prism-icon-button" key={item.key} href={item.href} aria-label={item.label} target="_blank" rel="noreferrer" data-prism-magnetic><Icon name={item.key} /></a>)}</div>
          </div>
          <div><p className="prism-label">{copy.footer.navigation}</p><nav aria-label={copy.navigation.footer}>{view.navigation.map((item) => <Link key={item.id} href={item.href}>{item.label}</Link>)}<Link href="/project">{copy.home.projects.all}</Link><Link href="/blog">{copy.home.writing.all}</Link></nav></div>
          <div className="prism-footer-tools"><a className="prism-button" href="#hero" data-prism-magnetic>{copy.footer.backToTop}<Icon name="up" /></a><a href={view.settings.site.repositoryUrl} target="_blank" rel="noreferrer">{copy.footer.source}</a></div>
        </div>
        <div className="prism-footer-base"><p>© {new Date().getFullYear()} {view.profile.name}</p><p>{view.profile.designation}</p></div>
      </footer>
    </Controls>
  </div>;
}
