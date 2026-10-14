import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";

test("loads the bundled canonical portfolio when PORTFOLIO_DATA_DIR is unset", async () => {
  const portfolio = await loadCanonicalPortfolio({ env: {} });

  assert.ok(portfolio.content.profile.name);
  assert.ok(portfolio.content.projects.length > 0);
  assert.ok(portfolio.content.experience.length > 0);
  assert.ok(portfolio.content.education.length > 0);
  assert.ok(portfolio.content.skills.categories.length > 0);
  assert.ok(portfolio.content.skills.all.includes("Figma"));
  assert.equal(
    portfolio.content.profile.resumeId,
    portfolio.content.resume.id,
  );
  assert.ok(portfolio.settings.site.publicRoutes.includes("/"));
});

test("keeps featured selection independent from the complete project archive order", async () => {
  const portfolio = await loadCanonicalPortfolio({ env: {} });
  const archive = portfolio.content.projects.map((project) => project.id);
  const featured = portfolio.content.projects
    .filter((project) => project.featured)
    .sort((left, right) => left.featuredOrder - right.featuredOrder)
    .map((project) => project.id);

  assert.notDeepEqual(featured, archive.slice(0, featured.length));
  assert.equal(new Set(featured).size, featured.length);
});
