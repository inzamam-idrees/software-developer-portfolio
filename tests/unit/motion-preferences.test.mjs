import assert from "node:assert/strict";
import test from "node:test";
import {
  MOTION_STORAGE_KEY,
  readMotionPreference,
  writeMotionPreference,
} from "../../lib/motion/preferences.mjs";

function memoryStorage(initial = {}) {
  const values = { ...initial };
  return {
    values,
    getItem: (key) => (key in values ? values[key] : null),
    setItem: (key, value) => {
      values[key] = String(value);
    },
  };
}

const throwing = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
};

test("reads the shared portfolio-motion key", () => {
  assert.equal(MOTION_STORAGE_KEY, "portfolio-motion");
  assert.equal(readMotionPreference(memoryStorage({ "portfolio-motion": "paused" })), "paused");
  assert.equal(readMotionPreference(memoryStorage({ "portfolio-motion": "enabled" })), "enabled");
});

test("defaults to enabled when storage is missing, unknown, or throws", () => {
  assert.equal(readMotionPreference(memoryStorage()), "enabled");
  assert.equal(readMotionPreference(memoryStorage({ "portfolio-motion": "other" })), "enabled");
  assert.equal(readMotionPreference(undefined), "enabled");
  assert.equal(readMotionPreference(throwing), "enabled");
});

test("write stores enabled or paused and swallows storage errors", () => {
  const storage = memoryStorage();
  writeMotionPreference(storage, false);
  assert.equal(storage.values["portfolio-motion"], "paused");
  writeMotionPreference(storage, true);
  assert.equal(storage.values["portfolio-motion"], "enabled");
  assert.doesNotThrow(() => writeMotionPreference(throwing, true));
  assert.doesNotThrow(() => writeMotionPreference(undefined, true));
});
