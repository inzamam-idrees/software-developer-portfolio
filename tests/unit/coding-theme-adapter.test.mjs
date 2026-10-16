import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { createCodingPresentation } from "../../themes/coding/adapter.mjs";

test("Coding presentation projects legacy component shapes from canonical content", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const portfolio = buildCurrentPortfolioView(canonical);
  const coding = createCodingPresentation(portfolio);

  assert.equal(coding.personalData.name, portfolio.profile.name);
  assert.equal(coding.personalData.resume, portfolio.resume.url);
  assert.equal(coding.projectsData[0].name, portfolio.projects[0].title);
  assert.equal(coding.experiences[0].title, portfolio.experience[0].role);
  assert.equal(coding.educations[0].title, portfolio.education[0].qualification);
  assert.ok(coding.skillsData.includes("Next JS"));
});

test("Coding projection reflects changed canonical content instead of local copies", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  const changed = structuredClone(buildCurrentPortfolioView(canonical));
  changed.profile.name = "CODING FIXTURE NAME";
  changed.projects[0].title = "Coding fixture project";
  changed.experience[0].role = "Coding fixture role";

  const coding = createCodingPresentation(changed);
  assert.equal(coding.personalData.name, "CODING FIXTURE NAME");
  assert.equal(coding.projectsData[0].name, "Coding fixture project");
  assert.equal(coding.experiences[0].title, "Coding fixture role");
});

test("Coding presentation maps resume detail and awards", async () => {
  const portfolio = buildCurrentPortfolioView(
    await loadCanonicalPortfolio({ env: {} }),
  );
  const coding = createCodingPresentation(portfolio);

  assert.equal(coding.experiences[0].location, portfolio.experience[0].location);
  assert.equal(coding.experiences[0].highlights, portfolio.experience[0].highlights);
  assert.equal(coding.projectsData[0].features, portfolio.projects[0].features);
  assert.equal(
    coding.projectsData[0].responsibilities,
    portfolio.projects[0].responsibilities,
  );
  assert.deepEqual(coding.awards[0], {
    id: 1,
    title: "Student of the Year",
    issuer: "University of Gujrat",
    duration: "Sep 2015 - Aug 2016",
  });
  assert.ok(coding.skillsData.includes("RAG"));
});

test("Coding presentation exposes merged Coding copy", async () => {
  const portfolio = buildCurrentPortfolioView(
    await loadCanonicalPortfolio({ env: {} }),
  );
  const changed = structuredClone(portfolio);
  changed.settings.copy.coding.home.hero.resumeAction = "Download CV";
  const coding = createCodingPresentation(changed);

  assert.equal(coding.copy.home.hero.resumeAction, "Download CV");
  assert.equal(coding.copy.navigation.skipToContent, "Skip to content");
  assert.equal(coding.copy.contactForm.heading, "Get in touch");
});
