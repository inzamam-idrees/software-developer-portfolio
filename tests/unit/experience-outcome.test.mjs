import assert from 'node:assert/strict';
import test from 'node:test';
import {cp,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {experienceSchema,projectSchema} from '../../lib/portfolio/schemas.mjs';
import {loadCanonicalPortfolio} from '../../lib/portfolio/loader.mjs';
import {buildCurrentPortfolioView} from '../../lib/portfolio/current-view.mjs';
import {createExecutivePresentation} from '../../themes/executive/presentation.mjs';
import {ExecutiveImpact} from '../../themes/executive/impact.mjs';
import {documentFormSchema} from '../../lib/admin/form-schema.mjs';
import {normalizeFormValue} from '../../lib/admin/form-model.mjs';
const canonical=await loadCanonicalPortfolio({env:{}});
const role=canonical.content.experience[0];
const example='[TEST FIXTURE ONLY: outcome display, not a professional claim.]';

test('experience outcome is optional, nullable, trimmed, strict and rejects blank/invalid values',()=>{
 assert.equal(experienceSchema.safeParse(role).success,true);
 assert.equal(Object.hasOwn(experienceSchema.parse(role),'outcome'),false);
 assert.equal(experienceSchema.parse({...role,outcome:null}).outcome,null);
 assert.equal(experienceSchema.parse({...role,outcome:`  ${example}  `}).outcome,example);
 for(const outcome of ['', '   ',42,{},[]])assert.equal(experienceSchema.safeParse({...role,outcome}).success,false);
 assert.equal(experienceSchema.safeParse({...role,outcome:example,unexpected:true}).success,false);
});
test('long outcomes inherit the existing unbounded project rule selected by the owner',()=>{
 const outcome='[TEST FIXTURE ONLY] '+ 'WRAPPING_TEST_'.repeat(1000);
 assert.equal(experienceSchema.parse({...role,outcome}).outcome,outcome);
 const project=canonical.content.projects.find(item=>item.outcome);
 assert.equal(projectSchema.parse({...project,outcome}).outcome,outcome);
});
test('temporary loader/view/Executive rendering propagates only explicit outcomes and leaves empty slots empty',async context=>{
 const root=await mkdtemp(path.join(tmpdir(),'experience-outcome-'));context.after(()=>rm(root,{recursive:true,force:true}));await cp('portfolio-data',root,{recursive:true});
 const file=path.join(root,'content/experience.json');const records=JSON.parse(await readFile(file,'utf8'));records[0].outcome=example;records[1].outcome=null;await writeFile(file,JSON.stringify(records));
 const loaded=await loadCanonicalPortfolio({env:{PORTFOLIO_DATA_DIR:root}});assert.equal(loaded.content.experience[0].outcome,example);
 const view=createExecutivePresentation(buildCurrentPortfolioView(loaded));assert.equal(view.experience[0].impact,example);assert.equal(view.experience[1].impact,null);assert.equal(view.experience[2].impact,null);
 const label=view.copy.home.experience.impact;
 assert.equal(renderToStaticMarkup(createElement(ExecutiveImpact,{outcome:undefined,label})),'');assert.equal(renderToStaticMarkup(createElement(ExecutiveImpact,{outcome:null,label})), '');
 assert.equal(renderToStaticMarkup(createElement(ExecutiveImpact,{outcome:' ',label})), '');
 const html=renderToStaticMarkup(createElement(ExecutiveImpact,{outcome:loaded.content.experience[0].outcome,label}));assert.ok(html.includes(example));assert.ok(html.includes(`<strong>${label}</strong>`));
 const escaped=renderToStaticMarkup(createElement(ExecutiveImpact,{outcome:'<script>fixture</script>',label}));assert.ok(escaped.includes('&lt;script&gt;'));assert.ok(!escaped.includes('<script>'));
});
test('generated admin schema exposes copy-backed outcome metadata and blank normalization',()=>{
 const fieldCopy=canonical.settings.copy.shared.adminFields;
 const schema=documentFormSchema('experience',{fieldCopy});const property=schema.items.properties.outcome;
 assert.ok(property);assert.ok(!schema.items.required.includes('outcome'));
 assert.equal(property.title,fieldCopy.experienceOutcome.label);assert.equal(property.description,fieldCopy.experienceOutcome.help);
 assert.equal(normalizeFormValue(schema,[{...role,outcome:''}])[0].outcome,null);
});

test('admin save round-trips outcomes through the filesystem store and enforces payload limits',async context=>{
 const {createFilesystemStore}=await import('../../lib/content-store/filesystem.mjs');
 const {handleContentSave,MAX_CONTENT_BYTES}=await import('../../lib/admin/content-save.mjs');
 const root=await mkdtemp(path.join(tmpdir(),'experience-save-'));context.after(()=>rm(root,{recursive:true,force:true}));await cp('portfolio-data',root,{recursive:true});
 const store=createFilesystemStore({root});let loaded=await store.read('experience');const records=loaded.data;records[0].outcome=` ${example} `;
 const args={session:{sessionId:'fixture'},sameOrigin:true,id:'experience',contentLength:1000,store,payload:{expectedRevision:loaded.revision,data:records}};
 const result=await handleContentSave(args);assert.equal(result.status,200);assert.equal(result.body.liveAfterWrite,true);
 loaded=await store.read('experience');assert.equal(loaded.data[0].outcome,example);
 const over=await handleContentSave({...args,contentLength:MAX_CONTENT_BYTES+1});assert.equal(over.status,413);
 const empty=normalizeFormValue(documentFormSchema('experience'),loaded.data.map((item,index)=>index===0?{...item,outcome:''}:item));
 const cleared=await handleContentSave({...args,payload:{expectedRevision:loaded.revision,data:empty}});assert.equal(cleared.status,200);assert.equal((await store.read('experience')).data[0].outcome,null);
});
test('admin save propagates experience outcome to the real GitHub store using mocked Contents API only',async()=>{
 const {createGithubStore}=await import('../../lib/content-store/github.mjs');
 const {handleContentSave}=await import('../../lib/admin/content-save.mjs');
 const {documentRegistry}=await import('../../lib/portfolio/documents.mjs');
 const documents=new Map(await Promise.all(documentRegistry.map(async definition=>[definition.path,JSON.parse(await readFile(path.join('portfolio-data',definition.path),'utf8'))])));
 const writes=[];
 const fetch=async(url,init)=>{
  const relative=new URL(url).pathname.split('/contents/portfolio-data/')[1];
  if(init.method==='PUT'){
   const payload=JSON.parse(init.body);assert.equal(payload.sha,'fixture-revision');const data=JSON.parse(Buffer.from(payload.content,'base64').toString());documents.set(relative,data);writes.push({relative,payload,data});
   return {ok:true,status:200,json:async()=>({content:{sha:'fixture-next'},commit:{html_url:'https://github.com/fixture/repository/commit/fixture'}})};
  }
  assert.ok(documents.has(relative));return {ok:true,status:200,json:async()=>({sha:'fixture-revision',encoding:'base64',content:Buffer.from(JSON.stringify(documents.get(relative))).toString('base64')})};
 };
 const store=createGithubStore({token:'fixture-token-not-real',repo:'fixture/repository',branch:'fixture',fetch});
 const records=structuredClone(canonical.content.experience);records[0].outcome=example;
 const result=await handleContentSave({session:{sessionId:'fixture'},sameOrigin:true,id:'experience',contentLength:1000,payload:{expectedRevision:'fixture-revision',data:records},store});
 assert.equal(result.status,200);assert.equal(result.body.liveAfterWrite,false);assert.equal(writes.length,1);assert.equal(writes[0].relative,'content/experience.json');assert.equal(writes[0].data[0].outcome,example);assert.equal(writes[0].payload.message,'content: update experience via admin');
 assert.equal((await store.read('experience')).data[0].outcome,example);
});
