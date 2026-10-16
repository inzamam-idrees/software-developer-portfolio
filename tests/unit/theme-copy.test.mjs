import assert from "node:assert/strict";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  copySchemaByTheme,
  sharedCopySchema,
} from "../../lib/portfolio/copy-schemas.mjs";
import {
  formatCopy,
  splitHeadline,
} from "../../lib/portfolio/format-copy.mjs";
import { buildCurrentPortfolioView } from "../../lib/portfolio/current-view.mjs";
import {
  PortfolioDataError,
  loadCanonicalPortfolio,
} from "../../lib/portfolio/loader.mjs";
import { createThemeView } from "../../lib/themes/create-view.mjs";

const canonical = await loadCanonicalPortfolio({ env: {} });
const portfolio = buildCurrentPortfolioView(canonical);

test("bundled copy documents validate and load under settings.copy", () => {
  assert.equal(
    canonical.settings.copy.shared.navigation.skipToContent,
    "Skip to content",
  );
  assert.deepEqual(Object.keys(canonical.settings.copy).sort(), [
    "cinematic",
    "coding",
    "executive",
    "shared",
    "spatial",
  ]);
});

test("theme view merges shared copy with its own theme copy only", () => {
  const executive = createThemeView("executive", portfolio).copy;
  const coding = createThemeView("coding", portfolio).copy;

  assert.equal(
    executive.home.selectedWork.heading,
    "Systems built for real operations.",
  );
  assert.equal(executive.navigation.skipToContent, "Skip to content");
  assert.notEqual(
    coding.home?.selectedWork?.heading,
    "Systems built for real operations.",
  );
  assert.equal(coding.contactForm.heading, "Contact with me");
  assert.equal(
    coding.contactForm.sent,
    "Message sent. Thank you for reaching out.",
  );
});

test("copy schemas are strict and reject blank or padded values", () => {
  const coding = structuredClone(canonical.settings.copy.coding);
  assert.equal(copySchemaByTheme.coding.safeParse(coding).success, true);
  assert.equal(
    copySchemaByTheme.coding.safeParse({ ...coding, unexpected: "x" }).success,
    false,
  );
  const shared = structuredClone(canonical.settings.copy.shared);
  shared.notFound.heading = "";
  assert.equal(sharedCopySchema.safeParse(shared).success, false);
  shared.notFound.heading = " Nothing here. ";
  assert.equal(sharedCopySchema.safeParse(shared).success, false);
});

test("formatCopy fills placeholders and throws on missing values", () => {
  assert.equal(
    formatCopy("PROJECT ARCHIVE / {count} BUILDS", { count: "09" }),
    "PROJECT ARCHIVE / 09 BUILDS",
  );
  assert.equal(formatCopy("Read {title}", { title: 0 }), "Read 0");
  assert.throws(
    () => formatCopy("PROJECT ARCHIVE / {count} BUILDS", {}),
    /Missing copy value: count/,
  );
});

test("an invalid copy document fails canonical validation", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-copy-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await cp(path.resolve("portfolio-data"), root, { recursive: true });
  const shared = structuredClone(canonical.settings.copy.shared);
  shared.notFound.heading = "";
  await writeFile(
    path.join(root, "settings/copy/shared.json"),
    JSON.stringify(shared),
  );

  await assert.rejects(
    () => loadCanonicalPortfolio({ env: { PORTFOLIO_DATA_DIR: root } }),
    (error) => {
      assert.ok(error instanceof PortfolioDataError);
      assert.equal(error.code, "VALIDATION_FAILED");
      assert.equal(error.document, "copy.shared");
      return true;
    },
  );
});

test("splitHeadline splits on the copy connector, escaping regex characters", () => {
  assert.deepEqual(splitHeadline("Engineering with intention.", "with"), [
    "Engineering",
    "intention.",
  ]);
  assert.deepEqual(splitHeadline("Fast a+b reliable", "a+b"), ["Fast", "reliable"]);
  assert.deepEqual(splitHeadline("No connector here", "with"), [
    "No connector here",
  ]);
});

test("copy templates reject unknown placeholders and plain copy rejects placeholders", () => {
  const shared = structuredClone(canonical.settings.copy.shared);
  shared.articles.readArticle = "Read {titel}";
  assert.equal(sharedCopySchema.safeParse(shared).success, false);

  const plain = structuredClone(canonical.settings.copy.shared);
  plain.notFound.heading = "Nothing {here}.";
  assert.equal(sharedCopySchema.safeParse(plain).success, false);

  const cinematic = structuredClone(canonical.settings.copy.cinematic);
  cinematic.home.about.portraitAlt = "{designation} — {name}";
  assert.equal(copySchemaByTheme.cinematic.safeParse(cinematic).success, true);
});

test("formatCopy ignores inherited properties", () => {
  assert.throws(() => formatCopy("{constructor}", {}), /Missing copy value/);
});

test("theme views do not expose other themes' copy through settings", () => {
  const view = createThemeView("coding", portfolio);
  assert.deepEqual(Object.keys(view.settings.copy ?? {}), []);
  assert.equal(portfolio.settings.copy.cinematic !== undefined, true);
});

test("splitHeadline keeps the headline whole when the connector is absent or repeated", () => {
  assert.deepEqual(splitHeadline("Ships fast", "with"), ["Ships fast"]);
  assert.deepEqual(splitHeadline("Built with care with intent", "with"), [
    "Built",
    "care with intent",
  ]);
});

test("plain copy placeholder rejection does not depend on earlier validations", () => {
  const earlier = structuredClone(canonical.settings.copy.shared);
  earlier.socialImage.headlineConnector = "abcdefgh {x}";
  assert.equal(sharedCopySchema.safeParse(earlier).success, false);

  const later = structuredClone(canonical.settings.copy.shared);
  later.navigation.skipToContent = "{x}";
  assert.equal(sharedCopySchema.safeParse(later).success, false);
});

test("spatial copy validates and rejects extra keys, padding, and unknown placeholders", () => {
  const spatial = structuredClone(canonical.settings.copy.spatial);
  assert.equal(copySchemaByTheme.spatial.safeParse(spatial).success, true);
  assert.equal(
    copySchemaByTheme.spatial.safeParse({ ...spatial, unexpected: "x" }).success,
    false,
  );
  const padded = structuredClone(spatial);
  padded.home.skills.heading = " Padded ";
  assert.equal(copySchemaByTheme.spatial.safeParse(padded).success, false);
  const placeholder = structuredClone(spatial);
  placeholder.home.skills.usedIn = "{title}";
  assert.equal(copySchemaByTheme.spatial.safeParse(placeholder).success, false);
});
