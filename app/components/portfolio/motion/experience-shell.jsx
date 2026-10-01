'use client';
import { useRef, useState } from 'react';
import ScrollCoordinator from './scroll-coordinator';
import MotionPreferences, { MotionControl, useMotion } from './motion-preferences';
import { createSceneState } from './scene-state.mjs';
import SceneLayer from '../scene/scene-layer';
function Experience({children}) {
 const {enabled}=useMotion();
 const stateRef=useRef(createSceneState());const rootRef=useRef(null);const [sceneStatus,setSceneStatus]=useState('fallback');
 return <div ref={rootRef} className="experience-shell" data-scene={sceneStatus} data-motion={enabled?"enabled":"paused"}><div className="story-progress" aria-hidden="true"/><ScrollCoordinator stateRef={stateRef} rootRef={rootRef}/><SceneLayer stateRef={stateRef} onStatus={setSceneStatus}/><div className="story-content">{children}</div><MotionControl/></div>;
}
export default function ExperienceShell({children}){return <MotionPreferences><Experience>{children}</Experience></MotionPreferences>;}
