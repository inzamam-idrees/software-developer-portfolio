import assert from "node:assert/strict";
import test from "node:test";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import {
  createCinematicPresentation,
  projectDetailSections,
} from "../../themes/cinematic/presentation.mjs";

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

test("Cinematic featured diagrams follow featured order and tolerate missing data", async () => {
  const view = buildCurrentPortfolioView(
    await loadCanonicalPortfolio({ env: {} }),
  );
  const { featuredProjects } = createCinematicPresentation(view);

  assert.deepEqual(featuredProjects[0].diagram, {
    mark: "01",
    nodes: [],
    category: null,
  });
  assert.deepEqual(featuredProjects[1].diagram, {
    mark: "02",
    nodes: ["ASSETS", "LDAP", "AUDIT"],
    category: "Enterprise systems",
  });
});

test("Cinematic project detail sections omit empty lists", () => {
  assert.deepEqual(
    projectDetailSections({ features: [], responsibilities: ["b"] }),
    [{ kind: "responsibilities", items: ["b"] }],
  );
});
