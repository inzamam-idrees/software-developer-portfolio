import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCanonicalPortfolio } from '../../lib/portfolio/loader.mjs';
import { buildCurrentPortfolioView } from '../../lib/portfolio/current-view.mjs';
import { createThemeView } from '../../lib/themes/create-view.mjs';
import { THEME_IDS } from '../../lib/themes/ids.mjs';
import { buildContentNavigation } from '../../themes/shared/content-navigation.mjs';

test('canonical certificates and role list reach every theme without content duplication', async()=>{
 const portfolio=buildCurrentPortfolioView(await loadCanonicalPortfolio({env:{}}));
 const before=JSON.stringify(portfolio);
 for(const id of THEME_IDS){
  const view=createThemeView(id,portfolio);
  assert.equal(view.certificates,portfolio.certificates);
  assert.equal(view.profile.roles,portfolio.profile.roles);
  assert.equal(view.resume,portfolio.resume);
  assert.equal(view.copy.contentSections.certificates.statuses.verified,'Verified');
 }
 assert.equal(JSON.stringify(portfolio),before);
});
test('section navigation respects empty records and feature switches',async()=>{
 const portfolio=buildCurrentPortfolioView(await loadCanonicalPortfolio({env:{}}));
 let view=createThemeView('executive',portfolio);
 for(const id of ['education','awards','certificates','resume','writing']) assert.ok(buildContentNavigation(view).some(item=>item.id===id),id);
 const changed=structuredClone(portfolio);changed.certificates=[];changed.awards=[];changed.settings.features.resume=false;changed.settings.features.articles=false;
 view=createThemeView('executive',changed);
 for(const id of ['awards','certificates','resume','writing']) assert.ok(!buildContentNavigation(view).some(item=>item.id===id),id);
 const disabled=structuredClone(portfolio);disabled.settings.navigation.items.push({id:'certificates',label:'Certificates',href:'/#certificates',enabled:false,order:99});
 assert.ok(!buildContentNavigation(createThemeView('executive',disabled)).some(item=>item.id==='certificates'));
});
