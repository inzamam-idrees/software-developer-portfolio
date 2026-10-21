import CodingFooter from "./footer";
import CodingNavigation from "./navigation";
import { createCodingView } from "./view.mjs";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";

export default function CodingShell({ portfolio, children }) {
  const view = createCodingView(portfolio);

  return (
    <div className="theme-coding" data-theme-id="coding">
      <link rel="stylesheet" href={themeStylesheetHref("coding")} precedence="theme" />
      <a className="skip-link" href="#main-content">
        {view.copy.navigation.skipToContent}
      </a>
      <div className="coding-page-frame mx-auto min-h-screen px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
        <CodingNavigation profile={view.profile} copy={view.copy.navigation} />
        <main className="coding-main" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <CodingFooter
        profile={view.profile}
        site={view.settings.site}
        copy={view.copy.footer}
      />
    </div>
  );
}
