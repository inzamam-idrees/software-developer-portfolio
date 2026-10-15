import assert from "node:assert/strict";
import test from "node:test";
import { documentFormSchema } from "../../lib/admin/form-schema.mjs";
import {
  emptyValueFor,
  fieldKind,
  moveItem,
  normalizeFormValue,
  setAtPath,
  unwrapNullable,
} from "../../lib/admin/form-model.mjs";
import { documentRegistry } from "../../lib/portfolio/documents.mjs";
import { validateDocument } from "../../lib/portfolio/loader.mjs";

test("every registry document produces a form schema", () => {
  for (const { id } of documentRegistry) {
    const schema = documentFormSchema(id);
    assert.ok(schema.type || schema.oneOf || schema.anyOf, id);
  }
});

test("field kinds cover nullable values, records, enums, and unions", () => {
  const projects = documentFormSchema("projects");
  const project = projects.items;
  assert.equal(fieldKind(projects), "array");
  assert.equal(fieldKind(project), "object");
  assert.deepEqual(unwrapNullable(project.properties.longDescription), {
    schema: { type: "string", minLength: 1 },
    nullable: true,
  });
  assert.equal(fieldKind(unwrapNullable(project.properties.longDescription).schema), "string");
  assert.equal(fieldKind(project.properties.featured), "boolean");
  assert.equal(fieldKind(project.properties.id), "integer");
  assert.equal(fieldKind(documentFormSchema("skills").properties.proficiency), "record");
  assert.equal(fieldKind(documentFormSchema("theme").properties.activeTheme), "enum");
  assert.equal(fieldKind(documentFormSchema("articles")), "json");
});

test("emptyValueFor builds a value that validates once required text is filled", () => {
  const item = emptyValueFor(documentFormSchema("projects").items);
  assert.equal(item.longDescription, null);
  assert.equal(item.featured, false);
  assert.deepEqual(item.links, {});
  assert.equal(item.id, 1);
  const filled = {
    ...item,
    title: "New project",
    shortDescription: "A short description.",
    role: "Engineer",
    technologies: ["JavaScript"],
  };
  assert.equal(validateDocument("projects", [filled]).ok, true);
});

test("normalizeFormValue maps cleared nullable fields to null and drops cleared optional fields", () => {
  const schema = documentFormSchema("projects");
  const [project] = normalizeFormValue(schema, [
    {
      title: "Kept",
      longDescription: "",
      problem: "",
      links: { demo: "" },
    },
  ]);
  assert.equal(project.title, "Kept");
  assert.equal(project.longDescription, null);
  assert.equal("demo" in project.links, false);
  assert.equal(project.problem, null);
});

test("browser form helpers do not import schemas or Zod", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile("lib/admin/form-model.mjs", "utf8");
  assert.doesNotMatch(source, /from\s+["'](?:zod|\.\.\/portfolio)/);
});

test("setAtPath and moveItem never mutate their input", () => {
  const original = { items: [{ label: "a" }, { label: "b" }, { label: "c" }] };
  const frozen = structuredClone(original);
  const updated = setAtPath(original, ["items", 1, "label"], "B");
  assert.equal(updated.items[1].label, "B");
  assert.deepEqual(original, frozen);
  assert.notEqual(updated.items, original.items);

  const list = ["a", "b", "c"];
  assert.deepEqual(moveItem(list, 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(list, 0, 5), ["a", "b", "c"]);
  assert.deepEqual(list, ["a", "b", "c"]);
});
