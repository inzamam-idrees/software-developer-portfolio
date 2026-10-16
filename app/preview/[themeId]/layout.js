import PreviewBar from "@/app/admin/preview-bar";
import { listPreviewableThemes } from "@/lib/themes/selection.mjs";
import { loadSelectedThemeSlot } from "@/lib/themes/registry.mjs";
import { requirePreview } from "./preview-context";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { themeId } = await params;
  const theme = listPreviewableThemes().find((candidate) => candidate.id === themeId);
  return {
    title: `Preview: ${theme?.label ?? themeId}`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    alternates: { canonical: null },
    openGraph: null,
    twitter: null,
  };
}

export default async function ThemePreviewLayout({ children, params }) {
  const { portfolio, selection } = await requirePreview(params);
  const { default: ThemeShell } = await loadSelectedThemeSlot(selection.theme, "shell");
  const themes = listPreviewableThemes().map(({ id, label }) => ({ id, label }));
  return (
    <>
      <ThemeShell portfolio={portfolio}>{children}</ThemeShell>
      <PreviewBar
        themeId={selection.theme.id}
        themes={themes}
        activeThemeId={portfolio.settings.theme.activeTheme}
      />
    </>
  );
}
