async page=>{
 const result=[];const nativeTimelines=await page.evaluate(()=>CSS.supports('animation-timeline: view()'));
 for(const colorScheme of ['light','dark'])for(const width of [390,1280]){
  await page.emulateMedia({colorScheme});await page.setViewportSize({width,height:960});await page.goto('http://127.0.0.1:3025/preview/executive',{waitUntil:'domcontentloaded'});await page.locator('[data-executive-motion]').waitFor();
  const roles=[];
  for(const id of ['1','2','3']){
   await page.locator(`[data-role="${id}"]`).evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForFunction(id=>document.querySelector(`[data-role="${id}"]`).dataset.active==='true',id);
   await page.locator('.executive-progress span').evaluate(async el=>Promise.allSettled(el.getAnimations().filter(animation=>animation.transitionProperty).map(animation=>animation.finished)));
   await page.locator(`[data-role-link="${id}"]`).evaluate(async el=>Promise.allSettled(el.getAnimations().map(animation=>animation.finished)));
   roles.push({id,progress:await page.locator('.executive-progress span').evaluate(el=>getComputedStyle(el).transform),handoff:await page.locator(`[data-role-link="${id}"]`).evaluate(el=>({transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity})),active:await page.locator(`[data-role="${id}"]`).getAttribute('data-active')});
  }
  await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase17/engine-${colorScheme}-${width}-career.png`});result.push({colorScheme,width,roles});
 }
 return {browserVersion:page.context().browser().version(),nativeTimelines,result};
}
