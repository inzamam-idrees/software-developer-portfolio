import Link from "next/link";
import { Archivo } from "next/font/google";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import MobileMenu from "./client/mobile-menu";
import MotionProvider, { MotionControl } from "./client/motion";
import { createSpatialView } from "./view.mjs";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: false,
  variable: "--sp-font",
});

export default function SpatialShell({ portfolio, children }) {
  const view = createSpatialView(portfolio);
  const { copy, profile, settings } = view;
  const links = settings.navigation.items
    .filter((item) => item.enabled)
    .sort((left, right) => left.order - right.order);
  const routeLinks = [
    { href: "/project", label: copy.projects.heading },
    { href: "/blog", label: copy.blog.heading },
  ];

  return (
    <div
      className={`theme-spatial ${archivo.variable}`}
      data-theme-id="spatial"
      id="spatial-top"
    >
      <link rel="stylesheet" href={themeStylesheetHref("spatial")} precedence="theme" />
      <MotionProvider animationsEnabled={settings.features.animations}>
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
              {links.map((item) => (
                <Link key={item.id} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
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
            {routeLinks.map((item) => (
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
