async sourcePage=>{
 const origin='http://127.0.0.1:3030',browser=sourcePage.context().browser(),cookies=await sourcePage.context().cookies(origin),results=[],failures=[];
 for(const colorScheme of ['light','dark'])for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:960},colorScheme});await context.addCookies(cookies);const page=await context.newPage();page.on('pageerror',e=>failures.push({colorScheme,width,error:e.message}));
  await page.goto(origin+'/preview/executive',{waitUntil:'domcontentloaded'});await page.locator('[data-executive-motion="enabled"]').waitFor();
  const intro=await page.locator('.theme-executive').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.id.startsWith('executive-intro')).map(a=>({id:a.id,delay:a.effect.getTiming().delay,duration:a.effect.getTiming().duration,state:a.playState,transform:getComputedStyle(a.effect.target).transform})));
  if(intro.length<3||!intro.some(a=>a.transform!=='none'))failures.push({colorScheme,width,error:'intro not visibly animated',intro});
  await page.waitForFunction(()=>!document.querySelector('.theme-executive').getAnimations({subtree:true}).some(a=>a.id.startsWith('executive-intro')&&a.playState==='running'));
  const project=page.locator('.executive-project').first();await project.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.executive-project').dataset.motionEntered==='true');
  const arrival=await project.evaluate(el=>el.getAnimations().filter(a=>a.id==='executive-arrival').map(a=>({state:a.playState,transform:getComputedStyle(el).transform,time:a.currentTime})));
  if(!arrival.some(a=>a.state==='running'&&a.transform!=='none'))failures.push({colorScheme,width,error:'scroll arrival not moving',arrival});
  await page.getByRole('button',{name:'Pause animation'}).click();
  const paused=await page.locator('.theme-executive').evaluate(el=>({state:el.dataset.executiveMotion,running:el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
  if(paused.state!=='paused'||paused.running)failures.push({colorScheme,width,error:'motion not settled',paused});
  await page.getByRole('button',{name:'Enable animation'}).click();
  await page.locator('#certificates').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('.executive-certificate')].every(el=>el.dataset.motionEntered==='true'));
  const certificates=await page.locator('.executive-certificate').evaluateAll(els=>els.map(el=>({title:el.querySelector('h3').textContent,issuer:el.querySelector('.executive-certificate-issuer').textContent,status:el.querySelector('.executive-certificate-status').textContent,id:el.querySelector('.executive-certificate-id')?.textContent,link:el.querySelector('a')?.href})));
  const placeholder=await page.locator('#certificates').evaluate(el=>/XYZ123|not provided|\[TODO:/i.test(el.textContent)||[...el.querySelectorAll('a')].some(a=>/XYZ123|example|TODO|lorem/i.test(a.href)));
  if(certificates.length!==3||placeholder||certificates[0].id||certificates[0].link)failures.push({colorScheme,width,certificates,placeholder});
  await page.screenshot({path:`artifacts/portfolio/phase20/certificates-${colorScheme}-${width}.png`,fullPage:true,animations:'disabled'});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)failures.push({colorScheme,width,error:'overflow'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-executive-motion="paused"]').waitFor();
  if(await page.getByRole('button',{name:'Pause animation'}).count())failures.push({colorScheme,width,error:'system reduction override'});
  results.push({colorScheme,width,intro,arrival,paused,certificates,placeholder,overflow});await context.close();
 }
 return{cases:results.length,failures,results};
}
