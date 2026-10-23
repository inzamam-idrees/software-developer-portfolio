import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTypewriter, stepTypewriter } from '../../themes/prism/typewriter.mjs';
import { profileSchema } from '../../lib/portfolio/schemas.mjs';
import { readFileSync } from 'node:fs';
const profile = JSON.parse(readFileSync(new URL('../../portfolio-data/content/profile.json', import.meta.url)));
test('role schema accepts optional bounded unique trimmed roles', () => {
  const { roles, ...without } = profile;
  assert.ok(profileSchema.safeParse(without).success);
  assert.ok(profileSchema.safeParse({...profile, roles:['Engineer','Developer']}).success);
  assert.ok(profileSchema.safeParse({...profile, roles:Array.from({length:6}, (_, i) => `Role ${i}`)}).success);
  for (const roles of [[], [''], [' padded'], ['Engineer','Engineer'], Array.from({length:7}, (_, i) => `Role ${i}`), ['x'.repeat(81)]]) assert.equal(profileSchema.safeParse({...profile, roles}).success, false);
});
test('typewriter types, holds, deletes, advances and loops at reference timing', () => {
 const roles=['AB','C']; let s=initialTypewriter(roles);
 assert.equal(s.delay,100);
 s=stepTypewriter(s,roles); assert.equal(s.text,'A'); assert.equal(s.delay,90);
 s=stepTypewriter(s,roles); assert.equal(s.text,'AB');
 s=stepTypewriter(s,roles); assert.equal(s.phase,'hold'); assert.equal(s.delay,1800);
 s=stepTypewriter(s,roles); assert.equal(s.text,'A'); assert.equal(s.delay,45);
 s=stepTypewriter(s,roles); assert.equal(s.text,'');
 s=stepTypewriter(s,roles); assert.equal(s.index,1); assert.equal(s.delay,400);
 s=stepTypewriter(s,roles); assert.equal(s.text,'C');
 for(let i=0;i<3;i++) s=stepTypewriter(s,roles);
 assert.equal(s.index,0); assert.equal(s.phase,'between');
});
test('one role is static',()=>{const s=initialTypewriter(['Engineer']);assert.equal(s.text,'Engineer');assert.deepEqual(stepTypewriter(s,['Engineer']),s);});
