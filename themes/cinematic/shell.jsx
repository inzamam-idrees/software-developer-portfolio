import { buildContentNavigation } from "../shared/content-navigation.mjs";
import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { createCinematicView } from "./view.mjs";

export default function CinematicShell({ portfolio, children }) {
  const view = createCinematicView(portfolio);
  // The header keeps the primary navigation entries; the footer and sections cover the rest.
  const primary = new Set(view.settings.navigation.items.map((item) => item.id));
  const links = [
    { id: "hero", label: view.copy.navigation.home, href: "/#hero" },
    ...buildContentNavigation(view).filter((link) => primary.has(link.id)),
  ];

  return (
    <div className="theme-cinematic" data-theme-id="cinematic">
      <link rel="stylesheet" href={themeStylesheetHref("cinematic")} precedence="theme" />
      <a className="skip-link" href="#main-content">
        {view.copy.navigation.skipToContent}
      </a>
      <Navbar
        profile={view.profile}
        links={links}
        copy={view.copy.navigation}
        cta={{ label: view.copy.navigation.letsTalk, href: "/#contact" }}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer
        profile={view.profile}
        site={view.settings.site}
        copy={{ navigation: view.copy.navigation, footer: view.copy.footer }}
      />
    </div>
  );
}
