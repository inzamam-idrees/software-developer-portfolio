import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

export async function generateMetadata() {
  const { selection } = await getPortfolioRenderContext();
  return selection.mode === "preview"
    ? {
        robots: {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        },
      }
    : {};
}

export default async function PortfolioLayout({ children }) {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeShell } = await loadSelectedThemeSlot(
    selection.theme,
    "shell",
  );
  return <ThemeShell portfolio={portfolio}>{children}</ThemeShell>;
}
