async sourcePage => {
  const origin='http://127.0.0.1:3029',browser=sourcePage.context().browser(),cookies=await sourcePage.context().cookies(origin);
  const results=[],failures=[];
  for(const mode of ['standard','nojs','reduced'])for(const colorScheme of ['light','dark'])for(const width of [390,1280]){
    const context=await browser.newContext({viewport:{width,height:960},colorScheme,javaScriptEnabled:mode!=='nojs',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    await context.addCookies(cookies);const page=await context.newPage();
    await page.goto(origin+'/preview/executive');if(mode!=='nojs')await page.locator('[data-executive-motion]').waitFor();
    const summaries=page.locator('.theme-executive details > summary');let checked=0;
    for(let i=0;i<await summaries.count();i++){
      const summary=summaries.nth(i);if(!await summary.isVisible())continue;
      await summary.focus();await page.keyboard.press('Enter');
      const details=summary.locator('..');
      await page.waitForFunction(el=>el.open,await details.elementHandle());
      if(mode==='standard'&&await details.evaluate(el=>el.classList.contains('executive-project-disclosure')))await page.waitForFunction(el=>el.dataset.expanded==='true',await details.elementHandle());
      await page.keyboard.press('Enter');await page.waitForFunction(el=>!el.open,await details.elementHandle());checked++;
    }
    await page.locator('[data-role-link]').last().focus();await page.keyboard.press('Enter');
    if(mode!=='nojs'&&!await page.locator('[data-role-link]').last().getAttribute('aria-current'))failures.push({mode,width,colorScheme,error:'career handoff'});
    if(mode==='standard'){
      await page.getByRole('button',{name:'Pause animation'}).click();
      await page.waitForFunction(()=>document.querySelector('.theme-executive').dataset.executiveMotion==='paused');
      const paused=await page.locator('.theme-executive').evaluate(el=>[...el.getAnimations({subtree:true})].filter(a=>a.playState==='running').length);
      if(paused)failures.push({width,colorScheme,error:'running animations when paused',paused});
      await page.reload();await page.getByRole('button',{name:'Enable animation'}).waitFor();
      if(await page.locator('.theme-executive').getAttribute('data-executive-motion')!=='paused')failures.push({width,colorScheme,error:'pause persistence'});
      await page.getByRole('button',{name:'Enable animation'}).click();
      await page.waitForFunction(()=>document.querySelector('.theme-executive').dataset.executiveMotion==='enabled');
    }
    if(mode==='reduced'&&await page.locator('.executive-motion-control').count())failures.push({width,colorScheme,error:'system reduction overridable'});
    results.push({mode,colorScheme,width,checked});await context.close();
  }
  return {cases:results.length,disclosures:results.reduce((n,r)=>n+r.checked,0),failures,results};
}
