import assert from "node:assert/strict";
import test from "node:test";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";

test("builds the current Cinematic view entirely from canonical content", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const view = buildCurrentPortfolioView(canonical);

  assert.equal(view.profile, canonical.content.profile);
  assert.equal(view.about, canonical.content.about);
  assert.equal(view.resume, canonical.content.resume);
  assert.equal(view.social, canonical.content.social);
  assert.equal(view.contact, canonical.content.contact);
  assert.equal(view.projects, canonical.content.projects);
  assert.equal(view.skills, canonical.content.skills);
  assert.equal(view.articles, canonical.content.articles);
  assert.equal(view.settings, canonical.settings);
  assert.equal(view.displayLocation, "Lahore, Pakistan");
  assert.deepEqual(
    view.featuredProjects.map((project) => project.id),
    canonical.content.projects
      .filter((project) => project.featured)
      .sort((left, right) => left.featuredOrder - right.featuredOrder)
      .map((project) => project.id),
  );
  assert.equal(view.experience[0].duration, "(Jul 2022 - Present)");
  assert.equal(view.education[0].duration, "2014 - 2018");
});
