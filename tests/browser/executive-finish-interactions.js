async sourcePage => {
 const origin='http://127.0.0.1:3025';
 const browser=sourcePage.context().browser();
 const cookies=await sourcePage.context().cookies(origin);
 const results=[];const failures=[];
 for(const colorScheme of ['light','dark']) for(const width of [375,390,1280]) for(const mode of ['standard','nojs']) {
  const context=await browser.newContext({viewport:{width,height:960},javaScriptEnabled:mode!=='nojs',colorScheme});
  await context.addCookies(cookies);const page=await context.newPage();const viewerRequests=[];
  page.on('request',request=>{if(request.url().startsWith('https://drive.google.com/file/'))viewerRequests.push(request.url());});
  await page.goto(origin+'/preview/executive',{waitUntil:'domcontentloaded'});
  await page.locator('.executive-resume-preview').waitFor({state:'attached'});
  if(mode!=='nojs')await page.locator('[data-executive-motion]').waitFor();
  const initial=await page.locator('.executive-timeline > li').evaluateAll(roles=>roles.map(role=>({primary:role.querySelectorAll('.executive-primary-highlights > li').length,hidden:!role.querySelector('.executive-role-disclosure').open && !role.querySelector('.executive-role-disclosure ul').checkVisibility(),tags:role.querySelectorAll('.executive-career-tech > li').length,lead:role.querySelector('.executive-role-lead')?.textContent,weight:role.querySelector('.executive-role-lead')&&getComputedStyle(role.querySelector('.executive-role-lead')).fontWeight})));
  if(initial.some(role=>role.primary>3||role.tags>8||!role.hidden||!role.lead))failures.push({mode,width,initial});
  if(width<=390){await page.screenshot({path:`artifacts/portfolio/phase17/${mode}-${colorScheme}-${width}-full.png`,fullPage:true});await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase17/${mode}-${colorScheme}-${width}-career.png`});}
  const toggles=[];
  for(const disclosure of await page.locator('.executive-role-disclosure,.executive-tech-disclosure').all()) {
   const summary=disclosure.locator('summary');await summary.focus();await page.keyboard.press('Enter');
   const opened=await disclosure.evaluate(el=>el.open);
   const content=await disclosure.locator('ul').isVisible();
   await page.keyboard.press('Enter');
   const closed=await disclosure.evaluate(el=>!el.open);
   toggles.push({opened,content,closed});
   if(!opened||!content||!closed)failures.push({mode,width,error:'career keyboard disclosure'});
  }
  await page.locator('.executive-resume-preview summary').scrollIntoViewIfNeeded();
  const beforeViewer=viewerRequests.length;
  if(beforeViewer!==0)failures.push({mode,width,error:'viewer requested while closed',viewerRequests});
  const requested=page.waitForRequest(request=>request.url().startsWith('https://drive.google.com/file/'));
  await page.locator('.executive-resume-preview summary').focus();await page.keyboard.press('Enter');
  if(mode==='nojs') await page.locator('.executive-resume-preview a[target="executive-resume-viewer"]').click();
  await requested;
  const viewerVisible=await page.locator('.executive-resume-preview iframe').isVisible();
  if(!viewerVisible)failures.push({mode,width,error:'viewer not visible after disclosure'});
  await page.locator('.executive-resume-preview summary').focus();await page.keyboard.press('Enter');
  if(width<1000){await page.locator('.executive-mobile-nav summary').focus();await page.keyboard.press('Enter');const link=page.locator('.executive-mobile-nav a[href="/#background"]');if(!await link.count())failures.push({mode,width,error:'missing background nav'});if(mode!=='nojs'){await link.click();await page.waitForURL('**#background',{waitUntil:'domcontentloaded'});}}
  const anchors=await page.evaluate(()=>['background','about','education','awards'].map(id=>({id,count:document.querySelectorAll('#'+id).length})));
  if(anchors.some(item=>item.count!==1))failures.push({mode,width,error:'background anchors',anchors});
  const certificates=await page.locator('.executive-certificate').evaluateAll(cards=>cards.map(card=>({title:card.querySelector('h3')?.textContent,issuer:card.querySelector('.executive-certificate-issuer')?.textContent,date:card.querySelector('.executive-certificate-date')?.textContent,height:card.offsetHeight})));
  if(certificates.some(card=>!card.title||!card.issuer))failures.push({mode,width,error:'empty certificate',certificates});
  if(await page.locator('#skills .portfolio-skill-level').count())failures.push({mode,width,error:'numeric skill levels'});
  results.push({colorScheme,mode,width,initial,toggles,beforeViewer,viewerVisible,viewerRequests:viewerRequests.length,certificates,anchors});
  await context.close();
 }
 const empty=await browser.newContext({viewport:{width:390,height:960}});await empty.addCookies(cookies);const fixture=await empty.newPage();await fixture.goto('http://127.0.0.1:3026/preview/executive',{waitUntil:'domcontentloaded'});
 const emptyCertificates={section:await fixture.locator('#certificates').count(),navigation:await fixture.locator('a[href="/#certificates"]').count()};
 if(emptyCertificates.section||emptyCertificates.navigation)failures.push({error:'empty certificate fixture',emptyCertificates});await empty.close();
 return {results,emptyCertificates,failures};
}
