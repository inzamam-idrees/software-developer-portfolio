import test from 'node:test';
import assert from 'node:assert/strict';
import { certificateSchema } from '../../lib/portfolio/schemas.mjs';
const base = { id:'training', title:'Fixture certificate', issuer:'Fixture issuer' };
test('certificate details remain optional and validate reference-style metadata',()=>{
 assert.ok(certificateSchema.safeParse(base).success);
 assert.ok(certificateSchema.safeParse({...base, description:null, competencies:[], status:null, issuedDate:null, credentialUrl:null, credentialId:null, image:null}).success);
 assert.ok(certificateSchema.safeParse({...base, description:'Training description', competencies:['JavaScript','Angular'], status:'completed', issuedDate:'2025-01-01', credentialUrl:'https://example.com/certificate'}).success);
 for(const change of [{status:'unknown'}, {competencies:['']}, {competencies:['SQL','SQL']}, {credentialUrl:'javascript:alert(1)'}, {description:''}]) assert.equal(certificateSchema.safeParse({...base,...change}).success,false);
});
