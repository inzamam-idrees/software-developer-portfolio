import test from 'node:test';
import assert from 'node:assert/strict';
import { getArticles } from '../../lib/articles.mjs';
const article=(id,date)=>({id,title:'Article '+id,url:'https://dev.to/example/'+id,published_at:date,description:'An article.',cover_image:null});
test('returns sorted articles without requiring cover images',async()=>{const r=await getArticles('example',{fetchImpl:async()=>Response.json([article(1,'2024-01-01'),article(2,'2025-01-01'),{title:'Unsafe',url:'javascript:alert(1)'}])});assert.equal(r.status,'ready');assert.deepEqual(r.articles.map(a=>a.id),[2,1]);});
test('empty, invalid and failed data keep writing usable',async()=>{for(const data of [[],{}]){const r=await getArticles('example',{fetchImpl:async()=>Response.json(data)});assert.equal(r.status,Array.isArray(data)?'empty':'unavailable');}for(const fetchImpl of [async()=>new Response('',{status:500}),async()=>{throw Error('offline');},async()=>new Response('invalid')])assert.equal((await getArticles('example',{fetchImpl})).status,'unavailable');});
test('aborts a slow provider',async()=>{const r=await getArticles('example',{timeoutMs:5,fetchImpl:(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))))});assert.equal(r.status,'unavailable');});
