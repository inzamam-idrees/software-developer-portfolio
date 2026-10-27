import assert from 'node:assert/strict';
import test from 'node:test';
import {loadCanonicalPortfolio} from '../../lib/portfolio/loader.mjs';
import {buildCurrentPortfolioView} from '../../lib/portfolio/current-view.mjs';
import {createExecutivePresentation} from '../../themes/executive/presentation.mjs';
const portfolio=buildCurrentPortfolioView(await loadCanonicalPortfolio({env:{}}));

test('Executive career disclosures preserve every highlight and technology in canonical order',()=>{
 const view=createExecutivePresentation(portfolio);
 view.experience.forEach((role,index)=>{
  assert.ok(role.primaryHighlights.length<=3);
  assert.ok(role.primaryTechnologies.length<=8);
  assert.deepEqual([...role.primaryHighlights,...role.moreHighlights],portfolio.experience[index].highlights);
  assert.deepEqual([...role.primaryTechnologies,...role.moreTechnologies],portfolio.experience[index].technologies);
 });
});
test('Executive hides certificates and their navigation when no usable records exist',()=>{
 const changed=structuredClone(portfolio);changed.certificates=[];
 let view=createExecutivePresentation(changed);
 assert.equal(view.certificates.length,0);
 assert.ok(!view.navigation.some(item=>item.id==='certificates'));
 changed.certificates=[{id:'missing',title:'[TODO: certificate title]',issuer:'[TODO: issuer]'}];
 view=createExecutivePresentation(changed);
 assert.equal(view.certificates.length,0);
 assert.ok(!view.navigation.some(item=>item.id==='certificates'));
 assert.equal(changed.certificates.length,1);
});
test('Executive keeps sparse real certificates instead of discarding records without optional fields',()=>{
 const view=createExecutivePresentation(portfolio);
 assert.deepEqual(view.certificates.map(item=>item.id),portfolio.certificates.map(item=>item.id));
});
test('Executive positioning is limited to two canonical sentences and falls back to the long introduction',()=>{
 const changed=structuredClone(portfolio);
 changed.profile.shortIntroduction='First sentence. Second sentence. Third sentence.';
 assert.equal(createExecutivePresentation(changed).positioning,'First sentence. Second sentence.');
 changed.profile.shortIntroduction='';changed.profile.longIntroduction='Fallback sentence. Another sentence. Remaining biography.';
 assert.equal(createExecutivePresentation(changed).positioning,'Fallback sentence. Another sentence.');
});
test('Executive merges background navigation while preserving canonical navigation data',()=>{
 const before=JSON.stringify(portfolio);
 const view=createExecutivePresentation(portfolio);
 assert.equal(view.navigation.filter(item=>item.id==='background').length,1);
 assert.ok(!view.navigation.some(item=>['education','awards'].includes(item.id)));
 assert.equal(view.navigation.find(item=>item.id==='background').href,'/#background');
 assert.equal(JSON.stringify(portfolio),before);
 const changed=structuredClone(portfolio);changed.education=[];changed.awards=[];changed.settings.navigation.items.find(item=>item.id==='about').enabled=false;
 assert.ok(!createExecutivePresentation(changed).navigation.some(item=>item.id==='background'));
});
test('Executive does not manufacture a career lead or technology when canonical arrays are empty',()=>{
 const changed=structuredClone(portfolio);changed.experience[0].highlights=[];changed.experience[0].technologies=[];
 const role=createExecutivePresentation(changed).experience[0];
 assert.deepEqual(role.primaryHighlights,[]);assert.deepEqual(role.moreHighlights,[]);
 assert.deepEqual(role.primaryTechnologies,[]);assert.deepEqual(role.moreTechnologies,[]);
});
