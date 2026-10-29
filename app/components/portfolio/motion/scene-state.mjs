export function createSceneState() {
  return {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 8,
    journey: 0,
    projectFocus: 0,
    focus: 0,
    projectCount: 3,
    pathProgress: 0,
    pathCount: 3,
    skillsTurn: 0,
    opacity: 1,
  };
}
export function getSceneProfile(compact, software = false) {
  return {
    maxDpr: software ? 0.75 : compact ? 1 : 1.5,
    particleCount: compact || software ? 40 : 160,
    tiles: compact || software ? 6 : 10,
    segments: compact || software ? 24 : 48,
  };
}
