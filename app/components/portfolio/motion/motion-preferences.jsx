'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const MotionContext=createContext(null);
export function useMotion(){return useContext(MotionContext);}
export default function MotionPreferences({children}){
 const [reduced,setReduced]=useState(true),[chosen,setChosen]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();try{setChosen(localStorage.getItem('portfolio-motion')!=='paused');}catch{setChosen(true);}setReady(true);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 function setEnabled(value){setChosen(value);try{localStorage.setItem('portfolio-motion',value?'enabled':'paused');}catch{}}
 const value=useMemo(()=>({enabled:ready&&chosen&&!reduced,reduced,ready,setEnabled}),[ready,chosen,reduced]);
 return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
export function MotionControl(){const {enabled,reduced,ready,setEnabled}=useMotion();return <div className="motion-control"><button type="button" className="motion-button" disabled={!ready||reduced} aria-label={enabled?'Pause motion':'Enable motion'} aria-pressed={enabled} aria-describedby={reduced?'motion-note':undefined} onClick={()=>setEnabled(!enabled)}><span aria-hidden="true">{enabled?'Ⅱ':'▷'}</span> {reduced?'Reduced motion':enabled?'Pause motion':'Enable motion'}</button>{reduced&&<span id="motion-note" className="sr-only">Motion is disabled by your system preference.</span>}</div>;}
