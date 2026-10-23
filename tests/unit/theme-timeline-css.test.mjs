import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const timelineStyles = [
  ["app/css/portfolio.scss", "career-timeline"],
  ["app/css/executive.scss", "executive-timeline"],
];

test("timeline item rules target direct children so nested highlight lists keep list layout", async () => {
  for (const [file, block] of timelineStyles) {
    const source = await readFile(file, "utf8");
    const descendantRules = source.match(
      new RegExp(`\\.${block}\\s+li\\b`, "g"),
    );
    assert.equal(
      descendantRules,
      null,
      `${file} styles every li under .${block}, including highlight items`,
    );
  }
});
