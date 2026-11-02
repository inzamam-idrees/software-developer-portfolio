import assert from 'node:assert/strict';
import test from 'node:test';
import { createExecutiveMotion } from '../../themes/executive/motion.mjs';

function fixture() {
  const animations=[];
  const element=()=>({dataset:{},contains(target){return this===target;},animate(frames,options){const animation={frames,options,id:'',cancelled:false,cancel(){this.cancelled=true;this.oncancel?.();}};animations.push(animation);return animation;}});
  const words=[element(),element(),element()],portrait=element(),summary=element(),targets=[element(),element(),element()];
  let callback,disconnected=false;
  const root={querySelectorAll(selector){return selector.startsWith('main ')?targets:words;},querySelector(selector){return selector.includes('hero-brief')?portrait:summary;}};
  const controller=createExecutiveMotion(root,{observerFactory(fn){callback=fn;return{observe(){},disconnect(){disconnected=true;}};}});
  return {controller,animations,targets,words,enter(entries=targets){callback(entries.map(target=>({target,isIntersecting:true})));},get disconnected(){return disconnected;}};
}
test('Executive native motion starts only when allowed and stages the intro without fading text',()=>{
  const f=fixture();f.enter();assert.equal(f.animations.length,0);f.controller.setEnabled(true);
  assert.equal(f.animations.filter(a=>a.id.startsWith('executive-intro')).length,3);
  assert.deepEqual(f.animations.filter(a=>a.id.startsWith('executive-intro')).map(a=>a.options.delay),[0,95,190]);
  assert.ok(f.animations.every(a=>a.frames.every(frame=>!('opacity' in frame))));
  const count=f.animations.length;f.controller.setEnabled(true);f.enter();assert.equal(f.animations.length,count);
});
test('Executive pause cancels native animations and resume reveals new arrivals once',()=>{
  const f=fixture();f.controller.setEnabled(true);f.enter([f.targets[0]]);f.controller.setEnabled(false);
  assert.ok(f.animations.every(a=>a.cancelled));const count=f.animations.length;f.enter([f.targets[1]]);assert.equal(f.animations.length,count);
  f.controller.setEnabled(true);assert.equal(f.targets[1].dataset.motionEntered,'true');assert.equal(f.animations.length,count+1);
  f.enter([f.targets[1]]);assert.equal(f.animations.length,count+1);
});
test('Executive keyboard focus settles moving content and disposal prevents future animation',()=>{
  const f=fixture();f.controller.setEnabled(true);f.enter([f.targets[0]]);const arrival=f.animations.find(a=>a.id==='executive-arrival');
  f.controller.settleFocused(f.targets[0]);assert.equal(arrival.cancelled,true);
  f.controller.dispose();assert.equal(f.disconnected,true);assert.ok(f.animations.every(a=>a.cancelled));
  const count=f.animations.length;f.controller.setEnabled(true);f.enter([f.targets[2]]);assert.equal(f.animations.length,count);
});
