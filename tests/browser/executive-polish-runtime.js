async page => {
  const origin='http://127.0.0.1:3025';
  const context=await page.context().browser().newContext({viewport:{width:1280,height:960}});
  await context.addCookies(await page.context().cookies(origin));
  await context.addInitScript(()=>{
    window.executiveLayoutShifts=[];
    new PerformanceObserver(list=>list.getEntries().forEach(entry=>{if(!entry.hadRecentInput)window.executiveLayoutShifts.push(entry.value);})).observe({type:'layout-shift',buffered:true});
  });
  const target=await context.newPage();
  const scripts=[];const pageErrors=[];
  target.on('response',async response=>{if(response.request().resourceType()==='script'&&response.url().startsWith(origin)){const source=await response.text().catch(()=> '');scripts.push({url:response.url(),bytes:source.length,heavy:/WebGLRenderer|__r3f|GreenSock|GSAP 3\./.test(source)});}});
  target.on('pageerror',error=>pageErrors.push(error.message));
  await target.goto(origin+'/preview/executive',{waitUntil:'domcontentloaded'});
  await target.locator('[data-executive-motion]').waitFor();
  await target.evaluate(()=>document.fonts.ready);
  await target.waitForFunction(()=>performance.now()>1500);
  const cls=await target.evaluate(()=>window.executiveLayoutShifts.reduce((a,b)=>a+b,0));
  await target.keyboard.press('Tab');
  const firstFocus=await target.evaluate(()=>({text:document.activeElement.textContent,href:document.activeElement.getAttribute('href')}));
  await target.keyboard.press('Enter');
  await target.waitForFunction(()=>document.activeElement.id==='main-content');
  const skipFocused=await target.evaluate(()=>document.activeElement.id==='main-content');
  const measureColors=()=>target.locator('.theme-executive').evaluate(root=>{
    const style=getComputedStyle(root);
    const rgb=hex=>(hex.length===4?hex.slice(1).split('').map(c=>c+c).join(''):hex.replace('#','')).match(/../g).map(n=>parseInt(n,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    const luminance=hex=>rgb(hex).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return +((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2);};
    const get=name=>style.getPropertyValue(name).trim();
    return {body:ratio(get('--ex-ink'),get('--ex-paper')),secondary:ratio(get('--ex-muted'),get('--ex-paper')),accent:ratio(get('--ex-accent'),get('--ex-paper')),button:ratio(get('--ex-accent'),get('--ex-on-accent')),formBoundary:ratio(get('--ex-control'),get('--ex-surface'))};
  });
  const colorRatios={};
  for(const colorScheme of ['light','dark']) {await target.emulateMedia({colorScheme});colorRatios[colorScheme]=await measureColors();}
  await target.emulateMedia({colorScheme:'light'});
  const form=target.locator('.contact-form');
  await form.locator('button[type="submit"]').click();
  const invalidFocus=await target.evaluate(()=>document.activeElement.id);
  let requestCount=0;
  await target.route('**/api/contact',async route=>{requestCount++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});});
  for(const [field,value] of [['name','Local browser review'],['email','review@example.com'],['message','Local verification of the Executive contact form.']]) await form.locator(`[name="${field}"]`).fill(value);
  await form.locator('button[type="submit"]').click();
  await target.waitForFunction(()=>document.querySelector('#contact-name').value==='');
  const successStatus=await form.locator('[role="status"]').textContent();
  await target.unroute('**/api/contact');
  await target.route('**/api/contact',async route=>{requestCount++;await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({success:false})});});
  for(const [field,value] of [['name','Local browser review'],['email','review@example.com'],['message','Retain this local message on delivery failure.']]) await form.locator(`[name="${field}"]`).fill(value);
  await form.locator('button[type="submit"]').click();
  await target.waitForFunction(()=>document.querySelector('.form-status')?.textContent.includes('send'));
  const failureStatus=await form.locator('[role="status"]').textContent();
  const failureRetained=await form.locator('[name="message"]').inputValue();
  const publicPage=await context.newPage();await publicPage.goto(origin,{waitUntil:'domcontentloaded'});
  const publicTheme=await publicPage.locator('[data-theme-id]').getAttribute('data-theme-id');
  await publicPage.close();
  const runtime={scriptCount:scripts.length,scriptBytes:scripts.reduce((sum,item)=>sum+item.bytes,0),heavy:scripts.filter(item=>item.heavy),canvas:await target.locator('canvas').count()};
  await context.close();
  return {cls,firstFocus,skipFocused,colorRatios,invalidFocus,requestCount,successStatus,failureStatus,failureRetained,publicTheme,runtime,pageErrors};
}
