import "server-only";

import { buildCurrentPortfolioView } from "./current-view.mjs";
import { loadCanonicalPortfolio } from "./loader.mjs";

export async function getCurrentPortfolioView() {
  return buildCurrentPortfolioView(await loadCanonicalPortfolio());
}
