import { getPortfolioRenderContext } from "@/lib/portfolio/render-context.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";

export default async function PortfolioLayout({ children }) {
  const { portfolio, selection } = await getPortfolioRenderContext();
  const { default: ThemeShell } = await loadSelectedThemeSlot(
    selection.theme,
    "shell",
  );
  return <ThemeShell portfolio={portfolio}>{children}</ThemeShell>;
}
