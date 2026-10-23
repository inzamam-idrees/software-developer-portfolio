import "server-only";

import { getAdminRequestState } from "../admin/server.mjs";
import { resolveThemeSelection, ThemeSelectionError } from "../themes/selection.mjs";
import { getCurrentPortfolioView } from "./server.mjs";

/**
 * Render context for the public routes. It always resolves the active theme and
 * never reads cookies or headers, so the routes render statically and no visitor,
 * signed in or not, can see a preview on them.
 */
export async function getPortfolioRenderContext() {
  const portfolio = await getCurrentPortfolioView();
  return {
    portfolio,
    selection: resolveThemeSelection({ settings: portfolio.settings }),
  };
}

/**
 * Render context for the admin-only `/preview/[themeId]` routes. The theme comes
 * from the URL, never from a cookie, so the public routes keep the active theme.
 * Returns `{ status }` of "unauthorized" or "unavailable" instead of a selection.
 */
export async function getPreviewRenderContext(themeId) {
  const portfolio = await getCurrentPortfolioView();
  const admin = await getAdminRequestState();
  if (!admin.session) return { status: "unauthorized" };
  try {
    const selection = resolveThemeSelection({
      settings: portfolio.settings,
      previewThemeId: themeId,
      authorized: true,
    });
    return { status: "ok", portfolio, selection };
  } catch (error) {
    if (!(error instanceof ThemeSelectionError)) throw error;
    return { status: "unavailable" };
  }
}
