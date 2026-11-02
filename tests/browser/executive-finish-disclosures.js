async sourcePage=>{
 const browser=sourcePage.context().browser();const origin='http://127.0.0.1:3025';const cookies=await sourcePage.context().cookies(origin);const results=[];const failures=[];
 for(const mode of ['standard','nojs','reduced','paused']){
  const context=await browser.newContext({viewport:{width:390,height:960},javaScriptEnabled:mode!=='nojs',reducedMotion:mode==='reduced'?'reduce':'no-preference'});await context.addCookies(cookies);
  if(mode==='paused')await context.addInitScript(()=>localStorage.setItem('portfolio-motion','paused'));
  const page=await context.newPage();
  for(const path of ['', '/project','/blog']){
   await page.goto(origin+'/preview/executive'+path,{waitUntil:'domcontentloaded'});await page.locator('.theme-executive').waitFor();if(mode!=='nojs')await page.locator('[data-executive-motion]').waitFor();
   const details=await page.locator('.theme-executive details').all();let toggles=0;
   for(const disclosure of details){
    const summary=disclosure.locator(':scope > summary');await summary.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(el=>el.open,await disclosure.elementHandle());
    if(mode==='standard'&&await disclosure.evaluate(el=>el.classList.contains('executive-project-disclosure')))await page.waitForFunction(el=>el.dataset.expanded==='true',await disclosure.elementHandle());
    const opened=await disclosure.evaluate(el=>el.open);if(!opened)failures.push({mode,path,error:'not open'});
    await summary.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(el=>!el.open,await disclosure.elementHandle());toggles++;
   }
   const evidence=await page.evaluate(()=>({certificates:[...document.querySelectorAll('.executive-certificate h3')].map(el=>el.textContent),placeholder:/not provided|XYZ123|\[TODO:/.test(document.querySelector('.theme-executive').textContent),impact:document.querySelectorAll('.executive-role-impact').length,writingSlim:!!document.querySelector('.executive-writing-strip'),overflow:document.documentElement.scrollWidth>innerWidth}));
   if(evidence.placeholder||evidence.overflow)failures.push({mode,path,evidence});
   results.push({mode,path,toggles,evidence});
  }
  await context.close();
 }
 return {results,failures};
}
