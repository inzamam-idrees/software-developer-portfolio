import Footer from "@/app/components/footer";
import Navbar from "@/app/components/navbar";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { createCinematicView } from "./view.mjs";

export default function CinematicShell({ portfolio, children }) {
  const view = createCinematicView(portfolio);
  const links = view.settings.navigation.items.filter((item) => item.enabled);

  return (
    <div className="theme-cinematic" data-theme-id="cinematic">
      <link rel="stylesheet" href={themeStylesheetHref("cinematic")} precedence="theme" />
      <a className="skip-link" href="#main-content">
        {view.copy.navigation.skipToContent}
      </a>
      <Navbar profile={view.profile} links={links} copy={view.copy.navigation} />
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
