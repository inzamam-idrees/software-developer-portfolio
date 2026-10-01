import test from 'node:test';import assert from 'node:assert/strict';
import { createSceneState,getSceneProfile } from '../../app/components/portfolio/motion/scene-state.mjs';
test('scene states are independent and finite',()=>{const a=createSceneState(),b=createSceneState();a.cameraX=3;assert.equal(b.cameraX,0);assert.equal(b.cameraZ,8);assert.ok(Object.values(b).every(Number.isFinite));});
test('device budgets are bounded',()=>{assert.deepEqual(getSceneProfile(false),{maxDpr:1.5,particleCount:100});assert.deepEqual(getSceneProfile(true),{maxDpr:1,particleCount:30});});
