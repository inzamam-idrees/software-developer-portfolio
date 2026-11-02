import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadCanonicalPortfolio } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { siennaCopySchema } from "../../lib/portfolio/copy-schemas.mjs";
import { profileSchema } from "../../lib/portfolio/schemas.mjs";
import { buildStats, companyCount, yearsOfExperience } from "../../themes/sienna/stats.mjs";
import { createSiennaPresentation, experiencePeriods, firstName, groupSkills, heroPortrait, orderProjects } from "../../themes/sienna/presentation.mjs";
import { COLOR_SCRIPT, COLOR_STORAGE_KEY } from "../../themes/sienna/color-script.mjs";
import { compileTheme } from "../../scripts/build-theme-css.mjs";
import { THEME_STYLESHEET_SOURCES } from "../../lib/themes/stylesheet-sources.mjs";

// ── Fixtures ──
const role = (company, startDate) => ({ company, startDate });
const labels = { experience: "Years", projects: "Projects", companies: "Companies" };

async function portfolio() {
  return buildCurrentPortfolioView(await loadCanonicalPortfolio({ env: {} }));
}

// ── Derived stats ──
test("years of experience count whole years from the earliest start", () => {
  const experience = [role("B", "2022-07"), role("A", "2019-01")];
  assert.equal(yearsOfExperience(experience, new Date(Date.UTC(2026, 9, 29))), 7);
  assert.equal(yearsOfExperience(experience, new Date(Date.UTC(2025, 11, 1))), 6);
  assert.equal(yearsOfExperience(experience, new Date(Date.UTC(2026, 0, 1))), 7);
  assert.equal(yearsOfExperience([], new Date()), 0);
});

test("companies are counted once regardless of case or repeated roles", () => {
  assert.equal(companyCount([role("Acme", "2020-01"), role("acme ", "2021-01"), role("Beta", "2022-01")]), 2);
});

test("stats drop cards without data and only years carry a plus", () => {
  const stats = buildStats({ experience: [role("Acme", "2020-01")], projects: [] }, labels, new Date(Date.UTC(2026, 0, 1)));
  assert.deepEqual(stats.map((item) => [item.id, item.value, item.plus]), [["experience", 6, true], ["companies", 1, false]]);
  assert.equal(stats[0].label, "Years");
});

// ── Presentation ──
test("projects order featured first by featuredOrder, then by order", () => {
  const projects = [
    { id: 1, order: 3, featured: false },
    { id: 2, order: 1, featured: true, featuredOrder: 2 },
    { id: 3, order: 2, featured: false },
    { id: 4, order: 4, featured: true, featuredOrder: 1 },
  ];
  assert.deepEqual(orderProjects(projects).map((item) => item.id), [4, 2, 3, 1]);
});

test("brand uses the first name token", () => {
  assert.equal(firstName("  Ada  Lovelace "), "Ada");
});

test("canonical presentation derives stats, portrait and navigation from data", async () => {
  const view = createSiennaPresentation(await portfolio(), new Date(Date.UTC(2026, 9, 29)));
  const byId = Object.fromEntries(view.stats.map((item) => [item.id, item.value]));
  assert.equal(byId.projects, view.projects.length);
  assert.equal(byId.companies, new Set(view.experience.map((item) => item.company)).size);
  assert.deepEqual(view.portrait, heroPortrait(view.profile));
  assert.ok(view.navigation.every((item) => item.label && item.href));
  assert.equal(view.orderedProjects.length, view.projects.length);
});

test("hero image prefers composed artwork, then the cut-out, then the photo", () => {
  const profile = { image: "/p.jpg", cutoutImage: "/c.webp", heroImage: "/h.webp" };
  assert.deepEqual(heroPortrait(profile), { src: "/h.webp", kind: "artwork" });
  assert.deepEqual(heroPortrait({ ...profile, heroImage: null }), { src: "/c.webp", kind: "cutout" });
  assert.deepEqual(heroPortrait({ image: "/p.jpg" }), { src: "/p.jpg", kind: "photo" });
});

test("skill tabs list every canonical skill once; uncategorised skills join the last tab", () => {
  const skills = {
    all: ["A", "B", "C", "D", "E"],
    categories: [{ id: "x", technologies: ["A", "B"] }, { id: "y", technologies: ["B", "C"] }, { id: "z", technologies: ["D"] }],
  };
  const groups = [{ id: "one", label: "One", categories: ["x"] }, { id: "two", label: "Two", categories: ["y", "missing"] }];
  assert.deepEqual(groupSkills(skills, groups).map((group) => [group.id, group.skills]), [["one", ["A", "B"]], ["two", ["C", "D", "E"]]]);
  assert.deepEqual(groupSkills({ all: [], categories: [] }, groups), []);
});

test("canonical skill tabs cover all canonical skills", async () => {
  const view = createSiennaPresentation(await portfolio());
  const listed = view.skillGroups.flatMap((group) => group.skills);
  assert.equal(new Set(listed).size, listed.length);
  assert.deepEqual([...listed].sort(), [...new Set([...view.skills.all, ...view.skills.categories.flatMap((c) => c.technologies)])].sort());
});

test("experience periods use the copy's present label and canonical order", () => {
  const items = experiencePeriods([
    { id: 2, order: 2, startDate: "2019-01", endDate: "2021-01", current: false },
    { id: 1, order: 1, startDate: "2022-07", endDate: null, current: true },
  ], "Now");
  assert.deepEqual(items.map((item) => item.period), [["Jul 2022", "Now"], ["Jan 2019", "Jan 2021"]]);
});

// ── Schemas ──
test("sienna copy is strict and validates the shipped file", async () => {
  const copy = JSON.parse(await readFile("portfolio-data/settings/copy/sienna.json", "utf8"));
  assert.equal(siennaCopySchema.safeParse(copy).success, true);
  assert.equal(siennaCopySchema.safeParse({ ...copy, extra: "x" }).success, false);
  const badTemplate = { ...copy, footer: { copyright: "© {year} {company}" } };
  assert.equal(siennaCopySchema.safeParse(badTemplate).success, false);
});

test("profile cutoutImage and heroImage are optional and nullable", async () => {
  const profile = JSON.parse(await readFile("portfolio-data/content/profile.json", "utf8"));
  const { cutoutImage: _cutout, heroImage: _hero, ...withoutImages } = profile;
  assert.equal(profileSchema.safeParse(withoutImages).success, true);
  for (const field of ["cutoutImage", "heroImage"]) {
    assert.equal(profileSchema.safeParse({ ...profile, [field]: null }).success, true);
    assert.equal(profileSchema.safeParse({ ...profile, [field]: 42 }).success, false);
  }
});

// ── Pre-paint script ──
test("color script reads only its own key and interpolates no data", () => {
  assert.equal(COLOR_SCRIPT.match(/localStorage\.getItem/g).length, 1);
  assert.ok(COLOR_SCRIPT.includes(`"${COLOR_STORAGE_KEY}"`));
  assert.doesNotMatch(COLOR_SCRIPT, /innerHTML|eval|Function\(/);
});

// ── Stylesheet ──
test("compiled sheet is pure ASCII so no BOM lands mid-file and drops the root rule", async () => {
  const css = await compileTheme(THEME_STYLESHEET_SOURCES.sienna);
  assert.doesNotMatch(css, /[^\x00-\x7f]/);
  assert.match(css, /\.theme-sienna\{/);
});
