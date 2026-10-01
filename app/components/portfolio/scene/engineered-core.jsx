'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D } from 'three';
import { getSceneProfile } from '../motion/scene-state.mjs';
const corners=[[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]];
const beams=[];
for(let axis=0;axis<3;axis++)for(const a of [-1,1])for(const b of [-1,1]){const p=[0,0,0];p[(axis+1)%3]=a;p[(axis+2)%3]=b;const size=[.045,.045,.045];size[axis]=2;beams.push({position:p,size});}
function Frame({scale=1}){return <group scale={scale}>{beams.map((beam,i)=><mesh key={i} position={beam.position}><boxGeometry args={beam.size}/><meshStandardMaterial color="#AEB8C1" metalness={.75} roughness={.26}/></mesh>)}</group>;}
export default function EngineeredCore({stateRef,enabled,compact}){
 const group=useRef(null),nodes=useRef(null),nodeGroup=useRef(null),idle=useRef(0);const scratch=useMemo(()=>new Object3D(),[]);
 const {particleCount}=getSceneProfile(compact);
 const positions=useMemo(()=>{let seed=47;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};const result=new Float32Array(particleCount*3);for(let i=0;i<result.length;i++)result[i]=(random()-.5)*9;return result;},[particleCount]);
 useLayoutEffect(()=>{corners.forEach((position,i)=>{scratch.position.set(...position.map(v=>v*1.4));scratch.updateMatrix();nodes.current.setMatrixAt(i,scratch.matrix);});nodes.current.instanceMatrix.needsUpdate=true;},[scratch]);
 useFrame(({pointer},delta)=>{const state=stateRef.current;if(enabled)idle.current+=Math.min(delta,.05)*.08;else idle.current=0;group.current.position.set((compact?0:2.4)+state.coreX,(compact?-1.6:.1)+state.coreY,0);group.current.rotation.set(.42+state.rotationX+(enabled?pointer.y*.025:0),.6+state.rotationY+idle.current,.15);group.current.scale.setScalar(state.coreScale*(compact?.48:1));nodeGroup.current.scale.setScalar(1+state.spread*.35);});
 return <group ref={group}><Frame/><group rotation={[.3,.4,.5]}><Frame scale={.72}/></group><mesh><octahedronGeometry args={[.62,0]}/><meshStandardMaterial color="#283A35" metalness={.7} roughness={.25}/></mesh>{[[-.4,.2,.1],[.7,.5,.3]].map((rotation,i)=><mesh key={i} rotation={rotation}><torusGeometry args={[1.85,.018,6,80]}/><meshStandardMaterial color={i?'#59656F':'#91E5C1'} metalness={.45} roughness={.4}/></mesh>)}<group ref={nodeGroup}><instancedMesh ref={nodes} args={[undefined,undefined,8]}><sphereGeometry args={[.045,10,8]}/><meshBasicMaterial color="#91E5C1"/></instancedMesh></group><points visible={enabled}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#AEB8C1" size={compact?.012:.018} transparent opacity={.45} depthWrite={false}/></points></group>;
}
