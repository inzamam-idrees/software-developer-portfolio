import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function tokens(source) {
  return Object.fromEntries(
    [...source.matchAll(/--sp-([a-z-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(
      ([, name, value]) => [name, value],
    ),
  );
}

function luminance(hex) {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(left, right) {
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test("token pairs meet contrast targets", async () => {
  const palette = tokens(await readFile("app/css/spatial.scss", "utf8"));
  const pairs = [
    ["ink", "ground", 4.5],
    ["ink", "surface", 4.5],
    ["soft", "ground", 4.5],
    ["signal", "ground", 4.5],
    ["field-ink", "field", 4.5],
    ["field-signal", "field", 4.5],
    ["signal", "surface", 3],
  ];
  for (const [foreground, background, minimum] of pairs) {
    assert.ok(palette[foreground] && palette[background], `${foreground}/${background} defined`);
    const ratio = contrast(palette[foreground], palette[background]);
    assert.ok(ratio >= minimum, `${foreground} on ${background} is ${ratio.toFixed(2)}:1`);
  }
});
