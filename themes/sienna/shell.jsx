import { Poppins, Roboto, Saira_Stencil_One } from "next/font/google";
import { themeStylesheetHref } from "@/lib/themes/stylesheets.mjs";
import { formatCopy } from "@/lib/portfolio/format-copy.mjs";
import { createSiennaPresentation } from "./presentation.mjs";
import { COLOR_SCRIPT } from "./color-script.mjs";
import SiennaHeader from "./client/header";
import Motion from "./client/motion";
import Icon from "./icon";

// ── Fonts (reference families; self-hosted by next/font, no theme preload) ──
const stencil = Saira_Stencil_One({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--sienna-font-stencil" });
const poppins = Poppins({ subsets: ["latin"], weight: "700", display: "swap", preload: false, variable: "--sienna-font-poppins" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false, variable: "--sienna-font-roboto" });

function Copyright({ template, year, name }) {
  const [before, after = ""] = template.split("{name}").map((part) => formatCopy(part, { year }));
  return <p className="sienna-copyright">{before}<span>{name}</span>{after}</p>;
}

export default function SiennaShell({ portfolio, children }) {
  const view = createSiennaPresentation(portfolio);
  const { copy, profile } = view;
  return <div
    id="top"
    className={`theme-sienna ${stencil.variable} ${poppins.variable} ${roboto.variable}`}
    data-theme-id="sienna"
    data-mode="dark"
    data-motion={view.settings.features.animations ? "on" : "off"}
    suppressHydrationWarning
  >
    <script dangerouslySetInnerHTML={{ __html: COLOR_SCRIPT }} />
    <link rel="stylesheet" href={themeStylesheetHref("sienna")} precedence="theme" />
    <a className="sienna-skip" href="#main-content">{copy.navigation.skipToContent}</a>
    <SiennaHeader
      brand={view.brand}
      homeLabel={formatCopy(copy.navigation.homeLink, { name: profile.name })}
      links={view.navigation}
      suffix={copy.navigation.suffix}
      copy={copy.navigation}
    />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="sienna-footer">
      <div className="sienna-container">
        <p className="sienna-logo">{view.brand}<span aria-hidden="true">{copy.navigation.suffix}</span></p>
        <Copyright template={copy.footer.copyright} year={view.year} name={profile.name} />
      </div>
    </footer>
    <a href="#top" className="sienna-go-top" aria-label={copy.backToTop} title={copy.backToTop}><Icon name="up" /></a>
    <Motion enabled={view.settings.features.animations} />
  </div>;
}
