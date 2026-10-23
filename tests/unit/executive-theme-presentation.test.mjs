import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import {
  createExecutivePresentation,
  projectDetailSections,
  projectLinkLabel,
} from "../../themes/executive/presentation.mjs";

const portfolio = buildCurrentPortfolioView(await loadCanonicalPortfolio());

test("Executive navigation preserves enabled canonical links and exposes added sections", () => {
  const presentation = createExecutivePresentation(portfolio);

  assert.deepEqual(
    presentation.navigation.slice(0, 5).map(({ label, href }) => ({ label, href })),
    [
      { label: "Work", href: "/#projects" },
      { label: "About", href: "/#about" },
      { label: "Expertise", href: "/#skills" },
      { label: "Experience", href: "/#experience" },
      { label: "Contact", href: "/#contact" },
    ],
  );
  for (const id of ["education", "awards", "certificates", "writing", "resume"]) assert.ok(presentation.navigation.some((item) => item.id === id));
});

test("Executive projects expose canonical case-study facts without invented metrics", () => {
  const presentation = createExecutivePresentation(portfolio);
  const project = presentation.featuredProjects.find(
    ({ title }) => title === "MIS / Nexis Project",
  );

  assert.ok(project);
  assert.equal(project.role, "Team Lead / Senior Software Engineer");
  assert.equal(project.problem, "IT assets need a clear history, from allocation to repair.");
  assert.equal(project.solution.startsWith("A role-based inventory platform"), true);
  assert.deepEqual(project.links, { demo: "https://nexis.vteamslabs.com" });
  assert.equal("metric" in project, false);
});

test("Executive social links include only configured professional destinations", () => {
  const presentation = createExecutivePresentation(portfolio);

  assert.deepEqual(
    presentation.professionalSocials.map(({ label }) => label),
    ["LinkedIn", "GitHub", "Stack Overflow", "DEV Community"],
  );
  assert.equal(
    presentation.professionalSocials.every(({ href }) => href.startsWith("https://")),
    true,
  );
});

test("project detail sections omit empty lists", () => {
  assert.deepEqual(
    projectDetailSections({ features: ["a"], responsibilities: [] }),
    [{ kind: "features", items: ["a"] }],
  );
  assert.deepEqual(
    projectDetailSections({ features: ["a"], responsibilities: ["b"] }),
    [
      { kind: "features", items: ["a"] },
      { kind: "responsibilities", items: ["b"] },
    ],
  );
});

test("Executive presentation exposes the canonical awards", () => {
  const presentation = createExecutivePresentation(portfolio);
  assert.equal(presentation.awards.length, 3);
});

test("Executive social labels and monogram come from canonical data", () => {
  const changed = structuredClone(portfolio);
  changed.settings.copy.shared.socialLabels.linkedIn = "LinkedIn profile";
  changed.profile.name = "Ada Lovelace King";
  const presentation = createExecutivePresentation(changed);

  assert.equal(presentation.professionalSocials[0].label, "LinkedIn profile");
  assert.equal(presentation.monogram, "ALK");
  assert.equal(createExecutivePresentation(portfolio).monogram, "II");
});

test("Executive project link labels come from copy for every link kind", () => {
  const labels = createExecutivePresentation(portfolio).copy.project;
  assert.equal(projectLinkLabel("demo", labels), "View project");
  assert.equal(projectLinkLabel("source", labels), labels.viewSource);
  assert.equal(projectLinkLabel("source", { ...labels, viewSource: "Code" }), "Code");
});
