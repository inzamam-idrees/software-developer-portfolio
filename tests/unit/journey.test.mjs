import assert from "node:assert/strict";
import test from "node:test";
import {
  STATIONS,
  cameraPose,
  focusFromProgress,
  stationStops,
  stationWeight,
} from "../../app/components/portfolio/motion/journey.mjs";

test("camera sits on a station pose at integer journey values", () => {
  STATIONS.forEach((station, index) => {
    const { position, target } = cameraPose(index);
    station.camera.forEach((offset, axis) =>
      assert.ok(Math.abs(position[axis] - (station.anchor[axis] + offset)) < 1e-9),
    );
    station.look.forEach((offset, axis) =>
      assert.ok(Math.abs(target[axis] - (station.anchor[axis] + offset)) < 1e-9),
    );
  });
});

test("camera travels between stations without jumps and clamps out of range", () => {
  let previous = cameraPose(0).position;
  for (let j = 0.05; j <= STATIONS.length - 1; j += 0.05) {
    const { position } = cameraPose(j);
    const step = Math.hypot(...position.map((v, i) => v - previous[i]));
    assert.ok(step < 2.5, `step ${step} at ${j}`);
    previous = position;
  }
  assert.deepEqual(cameraPose(-3), cameraPose(0));
  assert.deepEqual(cameraPose(99), cameraPose(STATIONS.length - 1));
});

test("compact poses drop the sideways offset", () => {
  const { position, target } = cameraPose(0, true);
  assert.equal(position[0], STATIONS[0].anchor[0]);
  assert.equal(target[0], STATIONS[0].anchor[0]);
});

test("station weight peaks at the station and fades by the reach", () => {
  assert.equal(stationWeight(2, 2), 1);
  assert.equal(stationWeight(3.2, 2), 0);
  assert.ok(stationWeight(2.5, 2) > 0 && stationWeight(2.5, 2) < 1);
});

test("station stops are strictly increasing and tolerate missing sections", () => {
  const stops = stationStops([0, 100, NaN, 50, 900], 1000);
  assert.equal(stops.length, 5);
  for (let i = 1; i < stops.length; i++) assert.ok(stops[i] > stops[i - 1]);
  assert.ok(stops.every((stop) => stop <= 0.995));
});

test("project focus maps progress onto the project range", () => {
  assert.equal(focusFromProgress(0, 4), 0);
  assert.equal(focusFromProgress(1, 4), 3);
  assert.equal(focusFromProgress(0.5, 1), 0);
  assert.equal(focusFromProgress(2, 4), 3);
});
