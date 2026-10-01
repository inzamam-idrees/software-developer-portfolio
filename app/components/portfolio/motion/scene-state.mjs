export function createSceneState(){return {cameraX:0,cameraY:0,cameraZ:8,rotationX:0,rotationY:0,coreX:0,coreY:0,coreScale:1,spread:0,opacity:1};}
export function getSceneProfile(compact){return {maxDpr:compact?1:1.5,particleCount:compact?30:100};}
