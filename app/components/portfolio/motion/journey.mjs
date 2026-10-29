// ── Stations ──
// The scene is one continuous space: each chapter owns a station along a
// gently curving path, and the camera flies from station to station.
export const STATIONS = Object.freeze([
  { id: "hero", anchor: [0, 0, 0], camera: [-0.8, 0.2, 9.5], look: [-0.8, 0, 0] },
  { id: "about", anchor: [-4, 0.6, -15], camera: [-3.4, 0.3, 8.5], look: [-3.4, 0, 0] },
  { id: "skills", anchor: [3, -0.4, -30], camera: [-3, 0.6, 10], look: [-3, 0, 0] },
  { id: "projects", anchor: [0, 0, -45], camera: [-3, 0.1, 9], look: [-3, 0, 0] },
  { id: "experience", anchor: [-3, 0, -62], camera: [0, 0.8, 9.5], look: [0, -0.2, -2] },
  { id: "contact", anchor: [0, 0, -80], camera: [-0.8, 0.4, 10], look: [-0.8, 0, 0] },
]);

export const STATION_IDS = Object.freeze(STATIONS.map((station) => station.id));

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => value * value * (3 - 2 * value);
const mix = (a, b, t) => a + (b - a) * t;

/**
 * Camera position and look-at target for a fractional station index. On
 * compact screens the sideways offset is dropped so the object sits behind
 * the (full-width) text instead of beside it.
 */
export function cameraPose(journey, compact = false) {
  const last = STATIONS.length - 1;
  const clamped = Math.min(last, Math.max(0, journey));
  const from = Math.min(last - 1, Math.floor(clamped));
  const t = smooth(clamp01(clamped - from));
  const a = STATIONS[from];
  const b = STATIONS[from + 1];
  const offset = (station, axis) =>
    compact && axis === 0 ? 0 : station.camera[axis];
  const position = [0, 1, 2].map((axis) =>
    mix(a.anchor[axis] + offset(a, axis), b.anchor[axis] + offset(b, axis), t),
  );
  const target = [0, 1, 2].map((axis) => {
    const lookA = compact && axis === 0 ? 0 : a.look[axis];
    const lookB = compact && axis === 0 ? 0 : b.look[axis];
    return mix(a.anchor[axis] + lookA, b.anchor[axis] + lookB, t);
  });
  return { position, target };
}

/** 0 at a station, rising to 1 as the camera leaves it; used to fade groups. */
export function stationWeight(journey, index, reach = 1.1) {
  return clamp01(1 - Math.abs(journey - index) / reach);
}

/**
 * Scroll fractions (0-1 of the page's scrollable range) at which each station
 * should be reached, from the top offsets of the chapters. Stops are strictly
 * increasing so the timeline never has a zero-length or negative segment.
 */
export function stationStops(offsets, max) {
  const stops = [];
  let previous = 0;
  for (const offset of offsets) {
    const raw = Number.isFinite(offset) ? offset / Math.max(1, max) : previous;
    const stop = Math.min(0.995, Math.max(previous + 0.002, raw));
    stops.push(stop);
    previous = stop;
  }
  return stops;
}

/** Projects the active project index onto 0..count-1 from section progress. */
export function focusFromProgress(progress, count) {
  if (count <= 1) return 0;
  return clamp01(progress) * (count - 1);
}
