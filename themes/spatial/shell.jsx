import Link from "next/link";
import { buildContentNavigation } from "../shared/content-navigation.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import EditorialEffects from "./client/editorial-effects";
import Wayfinding from "./client/wayfinding";
import MobileMenu from "./client/mobile-menu";
import MotionProvider, { MotionControl } from "./client/motion";
import { createSpatialView } from "./view.mjs";

export default function SpatialShell({ portfolio, children }) {
  const view = createSpatialView(portfolio);
  const { copy, profile, settings } = view;
  const links = buildContentNavigation(view);
  const primaryLinks = links.filter((item) => ["projects", "about", "skills", "experience"].includes(item.id));
  const contactLink = links.find((item) => item.id === "contact");
  const routeLinks = [
    { href: "/project", label: copy.projects.heading },
    { href: "/blog", label: copy.blog.heading },
  ];

  return (
    <div
      className="theme-spatial"
      data-theme-id="spatial"
      id="spatial-top"
    >
      <link rel="stylesheet" href={themeStylesheetHref("spatial")} precedence="theme" />
      {["inter-tight", "inter"].map((font) => <link key={font} rel="preload" href={`/fonts/spatial/${font}-latin.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />)}
      <MotionProvider animationsEnabled={settings.features.animations}>
      <Wayfinding />
      <EditorialEffects />
      <div className="spatial-scroll-progress" aria-hidden="true"><span /></div>
      <a className="spatial-skip-link" href="#main-content">
        {copy.navigation.skipToContent}
      </a>
      <header className="spatial-header">
        <div className="spatial-frame spatial-header-inner">
          <Link
            className="spatial-wordmark"
            href="/"
            aria-label={formatCopy(copy.navigation.homeLink, { name: profile.name })}
          >
            <span>{profile.name}</span>
            <span aria-hidden="true">{copy.navigation.wordmarkRole}</span>
          </Link>
          <div className="spatial-header-tools">
            <nav className="spatial-nav" aria-label={copy.navigation.main}>
              {primaryLinks.map((item) => (
                <Link key={item.id} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            {contactLink && <Link className="spatial-nav-contact" href={contactLink.href}>{contactLink.label}<span aria-hidden="true">↗</span></Link>}
            <MotionControl copy={copy.motion} placement="header" />
            <MobileMenu summary={copy.navigation.menu} label={copy.navigation.mobile}>
                {[...links, ...routeLinks].map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
                <MotionControl copy={copy.motion} placement="menu" />
            </MobileMenu>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="spatial-footer">
        <div className="spatial-frame spatial-footer-inner">
          <p>
            © {new Date().getFullYear()} {settings.site.name}
          </p>
          <nav className="spatial-footer-links" aria-label={copy.navigation.footer}>
            {[...links, ...routeLinks].map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <a href={settings.site.repositoryUrl} target="_blank" rel="noreferrer">
              {copy.footer.source}
            </a>
            <a href="#spatial-top">{copy.footer.backToTop}</a>
          </nav>
        </div>
      </footer>
      </MotionProvider>
    </div>
  );
}
