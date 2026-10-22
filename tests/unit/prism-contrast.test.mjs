import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function rgb(hex) { return hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16)); }
function luminance(values) {
  return values.map((value) => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
}
function ratio(a, b) { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05); }

test("Prism text, gradient stops, controls and focus pass AA in both palettes", async () => {
  const source = await readFile("app/css/prism.scss", "utf8");
  for (const mode of ["dark", "light"]) {
    const body = source.match(new RegExp(`\\$prism-${mode}: \\(([\\s\\S]*?)\\);`))[1];
    const tokens = Object.fromEntries([...body.matchAll(/([\w-]+)"?:\s*(#[a-f\d]{6})\b/gi)].map(([, key, value]) => [key, rgb(value)]));
    for (const surface of ["bg", "surface", "elevated"]) {
      for (const foreground of ["text", "muted", "accent", "rose", "gold", "error", "status-completed", "status-verified", "status-progress"]) {
        assert.ok(ratio(tokens[foreground], tokens[surface]) >= 4.5, `${mode} ${foreground}/${surface}: ${ratio(tokens[foreground], tokens[surface])}`);
      }
      for (const foreground of ["focus", "border"]) assert.ok(ratio(tokens[foreground], tokens[surface]) >= 3, `${mode} ${foreground}/${surface}`);
      for (const [start, end] of [["accent", "rose"], ["rose", "gold"]]) {
        for (let step = 0; step <= 20; step++) {
          const color = tokens[start].map((v, i) => v + (tokens[end][i] - v) * step / 20);
          assert.ok(ratio(color, tokens[surface]) >= 4.5, `${mode} gradient/${surface}`);
        }
      }
    }
    for (let step = 0; step <= 20; step++) {
      const color = tokens["button-start"].map((v, i) => v + (tokens["button-end"][i] - v) * step / 20);
      assert.ok(ratio(tokens["button-text"], color) >= 4.5, `${mode} button text`);
    }
  }
});
