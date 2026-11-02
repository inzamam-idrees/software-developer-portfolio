async sourcePage=>{
 const browser=sourcePage.context().browser();const cookies=await sourcePage.context().cookies('http://127.0.0.1:3025');const results=[];const failures=[];
 for(const expected of [1,0])for(const colorScheme of ['light','dark'])for(const width of [390,1280])for(const mode of ['standard','nojs']){
  const context=await browser.newContext({viewport:{width,height:960},colorScheme,javaScriptEnabled:mode!=='nojs'});await context.addCookies(cookies);const page=await context.newPage();page.on('pageerror',error=>failures.push({expected,colorScheme,width,mode,error:error.message}));
  await page.goto(`http://127.0.0.1:${expected?3025:3027}/preview/executive`,{waitUntil:'domcontentloaded'});await page.locator('.executive-timeline').waitFor();if(mode!=='nojs')await page.locator('[data-executive-motion]').waitFor();
  const count=await page.locator('.executive-role-impact').count();if(count!==expected)failures.push({expected,count,colorScheme,width,mode});
  await page.locator('[data-role="1"]').evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.screenshot({path:`artifacts/portfolio/phase18/${expected?'outcome':'empty'}-${colorScheme}-${width}-${mode}.png`,fullPage:true});
  await page.locator('[data-role="1"]').screenshot({path:`artifacts/portfolio/phase18/role-${expected?'outcome':'empty'}-${colorScheme}-${width}-${mode}.png`});
  let impact=null;
  if(expected){impact=await page.locator('.executive-role-impact').evaluate(el=>{
   const parse=value=>{const n=value.match(/[\d.]+/g).map(Number);return [...n.slice(0,3),n.length>3?n[3]:1]};const blend=(a,b)=>a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3]));const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return +((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};
   const contrast=node=>{const ancestors=[];for(let p=node;p;p=p.parentElement)ancestors.unshift(p);let bg=[255,255,255],opacity=1;for(const p of ancestors){const s=getComputedStyle(p);bg=blend(parse(s.backgroundColor),bg);opacity*=Number(s.opacity);}const fg=parse(getComputedStyle(node).color);fg[3]*=opacity;return ratio(blend(fg,bg),bg)};
   return {text:el.textContent,label:el.querySelector('strong').textContent,textContrast:contrast(el),labelContrast:contrast(el.querySelector('strong')),overflow:el.scrollWidth>el.clientWidth,width:el.clientWidth,height:el.clientHeight,font:getComputedStyle(el).fontSize};
  });if(impact.overflow||impact.textContrast<4.5||impact.labelContrast<4.5||!impact.text.includes('TEST FIXTURE ONLY'))failures.push({expected,colorScheme,width,mode,impact});}
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)failures.push({expected,colorScheme,width,mode,error:'horizontal overflow'});
  results.push({expected,colorScheme,width,mode,count,impact,overflow});await context.close();
 }
 const isolation=[];
 for(const theme of ['coding','cinematic','spatial','prism']){
  const context=await browser.newContext({viewport:{width:1280,height:960},javaScriptEnabled:false});await context.addCookies(cookies);const page=await context.newPage();const views=[];
  for(const port of [3027,3025]){await page.goto(`http://127.0.0.1:${port}/preview/${theme}`,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);views.push(await page.locator('main').evaluate(el=>({text:el.innerText,height:el.scrollHeight})));}
  const same=views[0].text===views[1].text;const unchangedHeight=views[0].height===views[1].height;const leaked=views[1].text.includes('TEST FIXTURE ONLY');if(!same||!unchangedHeight||leaked)failures.push({theme,error:'outcome isolation',same,unchangedHeight,leaked,heights:views.map(view=>view.height)});
  isolation.push({theme,same,unchangedHeight,leaked,height:views[0].height});await context.close();
 }
 return {cases:results.length,results,isolation,failures};
}
