export function createSceneState() {
  return {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 8,
    rotationX: 0,
    rotationY: 0,
    coreX: 0,
    coreY: 0,
    coreScale: 1,
    spread: 0,
    opacity: 1,
  };
}
export function getSceneProfile(compact, software = false) {
  return {
    maxDpr: software ? 0.75 : compact ? 1 : 1.5,
    particleCount: compact || software ? 30 : 100,
  };
}
