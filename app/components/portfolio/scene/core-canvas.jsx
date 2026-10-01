'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import EngineeredCore from './engineered-core';
import { getSceneProfile } from '../motion/scene-state.mjs';
function Lifecycle({stateRef,enabled,onReady,onUnavailable}) {
 const {gl,camera,invalidate}=useThree();const announced=useRef(false),raf=useRef(null);
 useEffect(()=>{const lost=e=>{e.preventDefault();onUnavailable();};const element=gl.domElement;element.addEventListener('webglcontextlost',lost);return()=>{element.removeEventListener('webglcontextlost',lost);if(raf.current)cancelAnimationFrame(raf.current);};},[gl,onUnavailable]);
 useEffect(()=>{invalidate();},[enabled,invalidate]);
 useFrame(()=>{const state=stateRef.current;camera.position.set(state.cameraX,state.cameraY,state.cameraZ);camera.lookAt(0,0,0);gl.domElement.style.opacity=String(state.opacity);if(!announced.current){announced.current=true;raf.current=requestAnimationFrame(onReady);}});
 return null;
}
export default function CoreCanvas({stateRef,enabled,compact,onReady,onUnavailable}) {
 const [hidden,setHidden]=useState(false);const profile=getSceneProfile(compact);
 useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return <Canvas aria-hidden="true" tabIndex={-1} dpr={[1,profile.maxDpr]} frameloop={enabled&&!hidden?'always':'demand'} camera={{position:[0,0,8],fov:38}} gl={{alpha:true,antialias:!compact,powerPreference:'low-power'}} eventSource={typeof document!=='undefined'?document.documentElement:undefined} eventPrefix="client"><ambientLight intensity={.85}/><directionalLight position={[3,5,4]} intensity={4} color="#F4F1EB"/><pointLight position={[-3,1,3]} intensity={12} color="#91E5C1"/><EngineeredCore stateRef={stateRef} enabled={enabled&&!hidden} compact={compact}/>{!compact&&<gridHelper args={[16,32,'#29323A','#1B2229']} position={[0,-2.5,-3]}/>}<Lifecycle stateRef={stateRef} enabled={enabled&&!hidden} onReady={onReady} onUnavailable={onUnavailable}/></Canvas>;
}
