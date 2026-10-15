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

test("bundled profile reflects the latest resume", async () => {
  const { content } = await loadCanonicalPortfolio({ env: {} });
  assert.equal(content.profile.designation, "Senior Full Stack Engineer");
  assert.equal(content.profile.experienceLabel, "7+ years");
  assert.match(content.profile.longIntroduction, /7\+ years/);
  assert.doesNotMatch(content.profile.longIntroduction, /5\+/);
});

test("featured projects follow the approved order", async () => {
  const { content } = await loadCanonicalPortfolio({ env: {} });
  const featured = content.projects
    .filter((project) => project.featured)
    .sort((left, right) => left.featuredOrder - right.featuredOrder)
    .map((project) => project.title);
  assert.deepEqual(featured, [
    "SmartCommerce – E-Commerce Widgets",
    "MIS / Nexis Project",
    "Group Captain Project",
    "Remmi CRM",
  ]);
});

test("every project carries CV features and responsibilities", async () => {
  const { content } = await loadCanonicalPortfolio({ env: {} });
  for (const project of content.projects) {
    assert.ok(project.features.length > 0, `${project.title} features`);
    assert.ok(
      project.responsibilities.length > 0,
      `${project.title} responsibilities`,
    );
  }
});

test("bundled awards match the resume", async () => {
  const { content } = await loadCanonicalPortfolio({ env: {} });
  assert.deepEqual(
    content.awards.map((award) => award.title),
    ["Student of the Year", "High GPA Achievers", "Coding Competition Winner"],
  );
});

test("AI skills are categorized and proficiency is stored", async () => {
  const { content } = await loadCanonicalPortfolio({ env: {} });
  const ai = content.skills.categories.find((category) => category.id === "ai");
  assert.ok(ai.technologies.includes("RAG"));
  assert.ok(ai.technologies.includes("Prompt Engineering"));
  assert.equal(content.skills.proficiency.Angular, 5);
});
