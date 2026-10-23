import "server-only";

import { cache } from "react";
import { buildCurrentPortfolioView } from "./current-view.mjs";
import { loadCanonicalPortfolio } from "./loader.mjs";

// Layout, page, metadata and admin state all ask for the portfolio during one
// request; cache() keeps that to a single read and validation per request.
const loadPortfolio = cache(() => loadCanonicalPortfolio());

export const getCurrentPortfolioView = cache(async () =>
  buildCurrentPortfolioView(await loadPortfolio()),
);
