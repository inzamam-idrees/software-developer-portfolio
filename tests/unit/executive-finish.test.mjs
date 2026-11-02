import assert from 'node:assert/strict';
import test from 'node:test';
import {loadCanonicalPortfolio} from '../../lib/portfolio/loader.mjs';
import {buildCurrentPortfolioView} from '../../lib/portfolio/current-view.mjs';
import {createExecutivePresentation} from '../../themes/executive/presentation.mjs';
const portfolio=buildCurrentPortfolioView(await loadCanonicalPortfolio({env:{}}));
test('Executive retains certificate facts while suppressing suspicious credential metadata without mutation',()=>{
 for(const marker of ['XYZ123','xyz-123','TODO','example','lorem','placeholder'])for(const field of ['credentialId','credentialUrl']){
  const changed=structuredClone(portfolio);changed.certificates=[{...portfolio.certificates[1],[field]:field==='credentialUrl'?`https://credentials.test/${encodeURIComponent(marker)}`:marker}];
  const before=JSON.stringify(changed);const view=createExecutivePresentation(changed);assert.equal(view.certificates.length,1,`${field} ${marker}`);assert.equal(view.certificates[0].credentialId,null);assert.equal(view.certificates[0].credentialUrl,null);assert.ok(view.navigation.some(item=>item.id==='certificates'));assert.equal(JSON.stringify(changed),before);
 }
});
test('Executive presents all three certificate records, keeps statuses and suppresses the known placeholder metadata',()=>{
 const view=createExecutivePresentation(portfolio);assert.deepEqual(view.certificates.map(item=>item.id),['1','2','3']);assert.equal(view.verifiedCertificateCount,1);assert.deepEqual(view.hiddenCertificates,[]);assert.deepEqual(view.certificates.map(item=>item.status),portfolio.certificates.map(item=>item.status));assert.equal(view.certificates[0].credentialId,null);assert.equal(view.certificates[0].credentialUrl,null);assert.deepEqual(view.suppressedCertificateCredentials.map(item=>item.id),['1']);
});
test('Executive career impact is absent unless an explicit outcome exists, never inferred from highlights',()=>{
 const view=createExecutivePresentation(portfolio);assert.ok(view.experience.every(role=>role.impact===null));
 const changed=structuredClone(portfolio);changed.experience[0].outcome='A supplied outcome.';assert.equal(createExecutivePresentation(changed).experience[0].impact,'A supplied outcome.');
});
test('Executive proof strip derives only canonical employers and featured technologies',()=>{
 const view=createExecutivePresentation(portfolio);assert.deepEqual(view.proofEmployers,[...new Set(portfolio.experience.map(role=>role.company))]);assert.deepEqual(view.proofStack,portfolio.skills.featured);
});
