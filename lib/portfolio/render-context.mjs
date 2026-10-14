import "server-only";

import { getAdminRequestState } from "../admin/server.mjs";
import { resolveThemeSelection, ThemeSelectionError } from "../themes/selection.mjs";
import { getCurrentPortfolioView } from "./server.mjs";

export async function getPortfolioRenderContext() {
  const portfolio = await getCurrentPortfolioView();
  const admin = await getAdminRequestState();

  try {
    const selection = resolveThemeSelection({
      settings: portfolio.settings,
      previewThemeId: admin.preview?.themeId,
      authorized: Boolean(admin.session),
    });
    return { portfolio, selection };
  } catch (error) {
    if (!(error instanceof ThemeSelectionError)) throw error;
    return {
      portfolio,
      selection: resolveThemeSelection({ settings: portfolio.settings }),
    };
  }
}
