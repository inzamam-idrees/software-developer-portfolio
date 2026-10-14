import CodingFooter from "./footer";
import CodingNavigation from "./navigation";
import { createCodingView } from "./view.mjs";

export default function CodingShell({ portfolio, children }) {
  const view = createCodingView(portfolio);

  return (
    <div className="theme-coding" data-theme-id="coding">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="coding-page-frame mx-auto min-h-screen px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
        <CodingNavigation profile={view.profile} />
        <main className="coding-main" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <CodingFooter profile={view.profile} site={view.settings.site} />
    </div>
  );
}
