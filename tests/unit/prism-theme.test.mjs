import assert from "node:assert/strict";
import test from "node:test";
import { loadCanonicalPortfolio, validateDocument } from "../../lib/portfolio/loader.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import { getDocumentDefinition } from "../../lib/portfolio/documents.mjs";
import { createThemeView } from "../../lib/themes/create-view.mjs";
import { listThemes, THEME_SLOTS } from "../../lib/themes/registry.mjs";

test("Prism is available with every current lazy route slot", () => {
  const theme = listThemes().find(({ id }) => id === "prism");
  assert.ok(theme);
  assert.equal(theme.status, "available");
  assert.deepEqual(Object.keys(theme.loaders), [...THEME_SLOTS]);
});

test("certificates are editable strict canonical records and allow an empty list", () => {
  assert.deepEqual(getDocumentDefinition("certificates").canonicalPath, ["content", "certificates"]);
  assert.equal(validateDocument("certificates", []).ok, true);
  const record = { id: "training", title: "[TODO: certificate name]", issuer: "[TODO: issuer]" };
  assert.equal(validateDocument("certificates", [record]).ok, true);
  for (const change of [{ title: " " }, { credentialUrl: "javascript:alert(1)" }, { issuedDate: "2026-02-30" }, { unexpected: true }]) {
    assert.equal(validateDocument("certificates", [{ ...record, ...change }]).ok, false);
  }
  assert.equal(validateDocument("certificates", [record, record]).ok, false);
});

test("all themes receive canonical certificates and Prism copy stays strict", async () => {
  const canonical = await loadCanonicalPortfolio({ env: {} });
  canonical.content.certificates = [1, 2, 3].map((number) => ({ id: `placeholder-${number}`, title: `[TODO: certificate ${number}]`, issuer: "[TODO: issuer]" }));
  const portfolio = buildCurrentPortfolioView(canonical);
  assert.equal(portfolio.certificates.length, 3);
  for (const item of portfolio.certificates) {
    assert.match(item.title, /^\[TODO:/);
    assert.match(item.issuer, /^\[TODO:/);
    assert.equal(item.issuedDate, undefined);
    assert.equal(item.credentialUrl, undefined);
  }
  for (const id of ["coding", "cinematic", "executive", "spatial"]) {
    assert.equal(createThemeView(id, portfolio).certificates, portfolio.certificates);
  }
  const prism = createThemeView("prism", portfolio);
  assert.equal(prism.certificates, portfolio.certificates);
  assert.ok(prism.copy.home.certificates.heading);
  assert.equal(prism.settings.copy, undefined);
  const invalid = structuredClone(canonical.settings.copy.prism);
  invalid.home.certificates.heading = " ";
  assert.equal(validateDocument("copy-prism", invalid).ok, false);
  assert.equal(validateDocument("copy-prism", { ...canonical.settings.copy.prism, extra: "extra" }).ok, false);
});

test("Prism presentation preserves canonical facts and handles missing featured projects", async () => {
  const { createPrismPresentation } = await import("../../themes/prism/presentation.mjs");
  const portfolio = buildCurrentPortfolioView(await loadCanonicalPortfolio({ env: {} }));
  const before = JSON.stringify(portfolio);
  const view = createPrismPresentation(portfolio);
  assert.deepEqual(view.roles, portfolio.profile.roles ?? [portfolio.profile.designation]);
  const withoutRoles = structuredClone(portfolio);
  delete withoutRoles.profile.roles;
  assert.deepEqual(createPrismPresentation(withoutRoles).roles, [portfolio.profile.designation]);
  assert.equal(view.portraitBadges[0], portfolio.profile.experienceLabel);
  assert.equal(new Set(view.skillGroups.flatMap((g) => g.technologies)).size, portfolio.skills.all.length);
  assert.equal(JSON.stringify(portfolio), before);
  const changed = structuredClone(portfolio);
  changed.profile.name = "FIXTURE NAME";
  changed.featuredProjects = [];
  changed.certificates = [];
  const empty = createPrismPresentation(changed);
  assert.equal(empty.profile.name, "FIXTURE NAME");
  assert.deepEqual(empty.featuredProjects, []);
  assert.deepEqual(empty.certificates, []);
});
