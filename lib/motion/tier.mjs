export function decideSceneTier({ threeD, animations, webgl2, software, reducedMotion, preference }) {
  if (!threeD || !webgl2) return "none";
  if (reducedMotion || preference === "paused" || !animations || software) return "reduced";
  return "full";
}
