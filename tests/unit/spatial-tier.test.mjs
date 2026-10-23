import assert from "node:assert/strict";
import test from "node:test";
import { COMPACT_QUERY, detectWebGL } from "../../lib/motion/capability.mjs";
import { decideSceneTier } from "../../lib/motion/tier.mjs";

const capable = {
  threeD: true,
  animations: true,
  webgl2: true,
  software: false,
  reducedMotion: false,
  preference: "enabled",
};

test("a capable device with motion allowed gets the full tier", () => {
  assert.equal(decideSceneTier(capable), "full");
});

test("threeD false wins over everything", () => {
  assert.equal(decideSceneTier({ ...capable, threeD: false }), "none");
  assert.equal(decideSceneTier({ ...capable, threeD: false, reducedMotion: true }), "none");
});

test("no WebGL2 selects none", () => {
  assert.equal(decideSceneTier({ ...capable, webgl2: false }), "none");
});

test("paused preference selects reduced", () => {
  assert.equal(decideSceneTier({ ...capable, preference: "paused" }), "reduced");
});

test("reduced motion, animations off, or a software renderer select reduced", () => {
  assert.equal(decideSceneTier({ ...capable, reducedMotion: true }), "reduced");
  assert.equal(decideSceneTier({ ...capable, animations: false }), "reduced");
  assert.equal(decideSceneTier({ ...capable, software: true }), "reduced");
});

function fakeDocument(getContext) {
  return { createElement: () => ({ getContext }) };
}

test("detectWebGL reports missing or failing WebGL2 as unavailable", () => {
  assert.deepEqual(detectWebGL(fakeDocument(() => null)), { webgl2: false, software: false });
  assert.deepEqual(
    detectWebGL(
      fakeDocument(() => {
        throw new Error("blocked");
      }),
    ),
    { webgl2: false, software: false },
  );
  assert.deepEqual(detectWebGL(undefined), { webgl2: false, software: false });
});

test("detectWebGL flags software renderers and releases the probe context", () => {
  let lost = false;
  const context = (renderer) => ({
    getExtension: (name) => {
      if (name === "WEBGL_debug_renderer_info") return { UNMASKED_RENDERER_WEBGL: 37446 };
      if (name === "WEBGL_lose_context") return { loseContext: () => (lost = true) };
      return null;
    },
    getParameter: (key) => (key === 37446 ? renderer : null),
  });
  assert.deepEqual(
    detectWebGL(fakeDocument(() => context("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))"))),
    { webgl2: true, software: true },
  );
  assert.equal(lost, true);
  assert.deepEqual(detectWebGL(fakeDocument(() => context("ANGLE (NVIDIA GeForce)"))), {
    webgl2: true,
    software: false,
  });
  assert.equal(COMPACT_QUERY, "(max-width: 767px)");
});
