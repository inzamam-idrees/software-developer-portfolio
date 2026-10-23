import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import {
  createSpatialPresentation,
  experiencePeriod,
} from "../../themes/spatial/presentation.mjs";

const canonical = await loadCanonicalPortfolio({ env: {} });
const portfolio = buildCurrentPortfolioView(canonical);

test("exposes every content item the sections render", () => {
  const view = createSpatialPresentation(portfolio);
  assert.equal(view.themeId, "spatial");
  for (const key of ["experience", "education", "awards", "projects", "featuredProjects"]) {
    assert.equal(view[key].length, portfolio[key].length, key);
  }
  assert.equal(view.skillGroups.length, portfolio.skills.categories.length);
  const categories = [...portfolio.skills.categories].sort((a, b) => a.order - b.order);
  view.skillGroups.forEach((group, index) => {
    assert.equal(group.id, categories[index].id);
    assert.equal(group.title, categories[index].title);
    assert.deepEqual(
      group.technologies.map((technology) => technology.label),
      categories[index].technologies,
    );
    for (const technology of group.technologies) {
      assert.ok(view.graph.nodes.some((node) => node.id === technology.nodeId));
    }
  });
  assert.ok(view.unmatchedTechnologies.some(({ label }) => label === "Material"));
  assert.ok(Object.isFrozen(view));
});

test("presentation tolerates zero featured projects", () => {
  const changed = structuredClone(portfolio);
  for (const project of changed.projects) {
    project.featured = false;
    project.featuredOrder = null;
  }
  changed.featuredProjects = [];
  const view = createSpatialPresentation(changed);
  assert.deepEqual(view.featuredProjects, []);
  assert.equal(view.projects.length, portfolio.projects.length);
});

test("contains no proficiency", () => {
  const view = createSpatialPresentation(portfolio);
  const serialized = JSON.stringify([view.skillGroups, view.unmatchedTechnologies, view.graph]);
  assert.doesNotMatch(serialized, /proficiency/);
});

test("experience periods use the copy label for current roles", () => {
  assert.equal(
    experiencePeriod({ startDate: "2019-01", endDate: null, current: true }, "Now"),
    "Jan 2019 – Now",
  );
  assert.equal(
    experiencePeriod({ startDate: "2019-01", endDate: "2021-06", current: false }, "Now"),
    "Jan 2019 – Jun 2021",
  );
  const view = createSpatialPresentation(portfolio);
  assert.equal(view.experience[0].period, experiencePeriod(portfolio.experience[0], view.copy.home.experience.present));
});
