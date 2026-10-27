import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { createCodingView } from "../../themes/coding/view.mjs";
import { createCinematicView } from "../../themes/cinematic/view.mjs";
import { createExecutiveView } from "../../themes/executive/view.mjs";
import { createSpatialView } from "../../themes/spatial/view.mjs";

import { createPrismView } from "../../themes/prism/view.mjs";

const themeViews = [
  ["coding", createCodingView],
  ["cinematic", createCinematicView],
  ["executive", createExecutiveView],
  ["spatial", createSpatialView],
  ["prism", createPrismView],
];

test("one canonical fixture projects into every registered theme without mutation", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const portfolio = buildCurrentPortfolioView(canonical);
  const before = JSON.stringify(portfolio);

  for (const [themeId, createView] of themeViews) {
    const view = createView(portfolio);
    assert.equal(view.themeId, themeId);
    assert.equal(view.profile, portfolio.profile);
    assert.equal(view.projects, portfolio.projects);
    assert.equal(view.experience, portfolio.experience);
    assert.equal(view.education, portfolio.education);
    assert.equal(view.skills, portfolio.skills);
    assert.equal(view.resume, portfolio.resume);
    assert.equal(view.certificates, portfolio.certificates);
    assert.equal(view.social, portfolio.social);
    assert.equal(view.contact, portfolio.contact);
  }

  assert.equal(JSON.stringify(portfolio), before);
});

test("changing canonical identity, project, and experience reaches all themes", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const portfolio = buildCurrentPortfolioView(canonical);
  const changed = structuredClone(portfolio);
  changed.profile.name = "CANONICAL FIXTURE NAME";
  changed.projects[0].title = "Canonical fixture project";
  changed.experience[0].role = "Canonical fixture role";

  for (const [, createView] of themeViews) {
    const view = createView(changed);
    assert.equal(view.profile.name, "CANONICAL FIXTURE NAME");
    assert.equal(view.projects[0].title, "Canonical fixture project");
    assert.equal(view.experience[0].role, "Canonical fixture role");
  }
});

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : [target];
    }),
  );
  return nested.flat();
}

test("theme modules contain no editable content stores or legacy data imports", async () => {
  const themeRoot = path.resolve("themes");
  const files = await listFiles(themeRoot);
  assert.deepEqual(
    files.filter((file) => file.endsWith(".json")),
    [],
    "theme-local JSON content stores are forbidden",
  );

  for (const file of files.filter((candidate) => /\.[cm]?jsx?$/.test(candidate))) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /utils\/data\//, `${file} bypasses canonical data`);
    assert.doesNotMatch(source, /portfolio-data\//, `${file} reads canonical files directly`);
  }
});

test("awards reach every theme view with formatted durations", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const portfolio = buildCurrentPortfolioView(canonical);

  assert.equal(portfolio.awards[0].duration, "Sep 2015 - Aug 2016");
  for (const [, createView] of themeViews) {
    assert.equal(createView(portfolio).awards, portfolio.awards);
  }
  const { awards, ...withoutAwards } = portfolio;
  assert.throws(
    () => createCodingView(withoutAwards),
    /requires canonical awards content/,
  );
});

test("experience outcomes remain canonical data but only Executive presentation consumes them", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  canonical.content.experience[0].outcome = "[TEST FIXTURE ONLY: explicit outcome]";
  const portfolio = buildCurrentPortfolioView(canonical);
  for (const [, createView] of themeViews) assert.equal(createView(portfolio).experience[0].outcome, canonical.content.experience[0].outcome);
  for (const theme of ["coding", "cinematic", "spatial", "prism"]) {
    const files = await listFiles(path.resolve("themes", theme));
    if (theme === "coding") files.push(...await listFiles(path.resolve("app/components/homepage")));
    if (theme === "cinematic") files.push(...await listFiles(path.resolve("app/components/portfolio")));
    for (const file of files.filter(file => /\.[cm]?jsx?$/.test(file))) {
      const source = await readFile(file, "utf8");
      assert.doesNotMatch(source, /(?:experience|item|role)\??\.outcome/, `${file} starts presenting a new experience field`);
    }
  }
});
