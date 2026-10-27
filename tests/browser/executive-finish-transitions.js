async page=>{
 const origin='http://127.0.0.1:3025';await page.setViewportSize({width:1280,height:960});await page.goto(origin+'/preview/executive',{waitUntil:'domcontentloaded'});await page.locator('[data-executive-motion]').waitFor();
 const nativeTimelines=await page.evaluate(()=>CSS.supports('animation-timeline: view()'));
 const disclosure=page.locator('.executive-project-disclosure').first();const summary=disclosure.locator('summary');
 await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.executive-project-disclosure').dataset.expanded==='true');
 const opening=await disclosure.locator('.executive-disclosure-grid').evaluate(el=>({properties:el.getAnimations().map(animation=>animation.transitionProperty),transition:getComputedStyle(el).transitionProperty,grid:getComputedStyle(el).gridTemplateRows}));
 await disclosure.locator('.executive-disclosure-grid').evaluate(async el=>Promise.allSettled(el.getAnimations().map(animation=>animation.finished)));
 await page.keyboard.press('Enter');
 const closing=await disclosure.evaluate(el=>({openDuringClose:el.open,expanded:el.dataset.expanded,inert:el.querySelector('.executive-disclosure-grid').inert}));
 await page.waitForFunction(()=>!document.querySelector('.executive-project-disclosure').open);
 const indicator=[];
 for(const id of ['experience','projects','skills','background','contact']){await page.locator('#'+id).evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForFunction(id=>!!document.querySelector(`[data-section-link="${id}"][aria-current]`),id);indicator.push(await page.locator('.executive-desktop-nav').evaluate(el=>({index:el.style.getPropertyValue('--ex-nav-index'),transition:getComputedStyle(el,'::after').transitionProperty,transform:getComputedStyle(el,'::after').transform})));}
 const handoff=[];for(const id of ['1','2','3']){await page.locator(`[data-role="${id}"]`).evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForFunction(id=>document.querySelector(`[data-role="${id}"]`).dataset.active==='true',id);handoff.push(await page.locator(`[data-role-link="${id}"]`).evaluate(el=>({transition:getComputedStyle(el).transitionProperty,transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity})));}
 await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.executive-project-disclosure').dataset.expanded==='true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-executive-motion="paused"]').waitFor();
 const reduced=await disclosure.locator('.executive-disclosure-grid').evaluate(el=>({transition:getComputedStyle(el).transitionDuration,open:el.closest('details').open}));await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.executive-project-disclosure').open);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-executive-motion="enabled"]').waitFor();
 // Open natively while paused, then resume: content must stay visible.
 await page.evaluate(()=>{localStorage.setItem('portfolio-motion','paused');window.dispatchEvent(new StorageEvent('storage',{key:'portfolio-motion'}));});await summary.focus();await page.keyboard.press('Enter');
 await page.evaluate(()=>{localStorage.removeItem('portfolio-motion');window.dispatchEvent(new StorageEvent('storage',{key:'portfolio-motion'}));});
 const resumed=await disclosure.evaluate(el=>({open:el.open,expanded:el.dataset.expanded,inert:el.querySelector('.executive-disclosure-grid').inert}));
 const staticTransitions=await page.evaluate(()=>{localStorage.setItem('portfolio-motion','paused');window.dispatchEvent(new StorageEvent('storage',{key:'portfolio-motion'}));const selectors=['.executive-disclosure-grid','.executive-career-guide nav a'];return selectors.map(selector=>getComputedStyle(document.querySelector(selector)).transitionDuration);});
 await page.evaluate(()=>{localStorage.removeItem('portfolio-motion');window.dispatchEvent(new StorageEvent('storage',{key:'portfolio-motion'}));});
 return {nativeTimelines,opening,closing,indicator,handoff,reduced,resumed,staticTransitions};
}
