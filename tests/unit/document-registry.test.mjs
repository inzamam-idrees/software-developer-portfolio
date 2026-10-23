import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  documentRegistry,
  getDocumentDefinition,
} from "../../lib/portfolio/documents.mjs";
import {
  validateDocument,
  validatePortfolio,
} from "../../lib/portfolio/loader.mjs";

const expectedIds = [
  "profile",
  "about",
  "projects",
  "experience",
  "education",
  "awards",
  "certificates",
  "skills",
  "resume",
  "articles",
  "social",
  "contact",
  "site",
  "navigation",
  "features",
  "theme",
  "seo",
  "copy-shared",
  "copy-coding",
  "copy-cinematic",
  "copy-executive",
  "copy-spatial",
  "copy-prism",
];

async function bundledDocuments() {
  const entries = await Promise.all(
    documentRegistry.map(async (definition) => [
      definition.id,
      JSON.parse(
        await readFile(path.join("portfolio-data", definition.path), "utf8"),
      ),
    ]),
  );
  return Object.fromEntries(entries);
}

test("registry lists every canonical document exactly once", () => {
  const ids = documentRegistry.map(({ id }) => id);
  assert.deepEqual(ids, expectedIds);
  assert.equal(new Set(ids).size, ids.length);
  for (const definition of documentRegistry) {
    assert.ok(["content", "settings", "copy"].includes(definition.group));
    assert.ok(definition.label.trim().length > 0);
  }
});

test("unknown document ids are rejected, including path-like ids", () => {
  for (const id of ["../etc/passwd", "content/profile.json", "constructor", ""]) {
    assert.throws(
      () => getDocumentDefinition(id),
      (error) => error.code === "UNKNOWN_DOCUMENT",
    );
  }
  assert.equal(getDocumentDefinition("copy-shared").name, "copy.shared");
  assert.equal(getDocumentDefinition("copy-spatial").name, "copy.spatial");
  assert.equal(documentRegistry.length, 23);
});

test("every registry path exists in the bundled data", async () => {
  for (const definition of documentRegistry) {
    await access(path.join("portfolio-data", definition.path));
  }
});

test("validateDocument reports dotted field paths", async () => {
  const documents = await bundledDocuments();
  assert.equal(validateDocument("profile", documents.profile).ok, true);

  const result = validateDocument("profile", { ...documents.profile, name: "" });
  assert.equal(result.ok, false);
  assert.equal(result.issues[0].path, "name");

  const nested = structuredClone(documents.navigation);
  nested.items[2].label = "";
  assert.equal(validateDocument("navigation", nested).issues[0].path, "items.2.label");
});

test("validatePortfolio reports cross-document issues with document-prefixed paths", async () => {
  const documents = await bundledDocuments();
  assert.equal(validatePortfolio(documents).ok, true);

  documents.skills.featured = [...documents.skills.featured, "Unknown Skill"];
  const result = validatePortfolio(documents);
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some(({ path: issuePath }) =>
      issuePath.startsWith("skills.featured"),
    ),
    JSON.stringify(result.issues),
  );
});

test("validatePortfolio maps copy and cross-document paths to registry ids", async () => {
  const copyBroken = await bundledDocuments();
  copyBroken["copy-shared"].notFound.heading = "";
  const copyPaths = validatePortfolio(copyBroken).issues.map(({ path: p }) => p);
  assert.ok(copyPaths.includes("copy-shared.notFound.heading"), copyPaths.join());

  const crossBroken = await bundledDocuments();
  crossBroken.profile.resumeId = "other";
  const crossPaths = validatePortfolio(crossBroken).issues.map(({ path: p }) => p);
  assert.ok(crossPaths.includes("profile.resumeId"), crossPaths.join());
});
