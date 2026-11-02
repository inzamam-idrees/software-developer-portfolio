async page => {
  const origin='http://127.0.0.1:3025';
  await page.setViewportSize({width:1280,height:960});
  await page.goto(origin+'/preview/executive',{waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion]').waitFor();
  await page.getByRole('button',{name:'Hide preview controls'}).click();
  const results=[];
  for(const colorScheme of ['light','dark']) {
    await page.emulateMedia({colorScheme});
    for(const id of ['1','2','3']) {
      await page.locator(`[data-role="${id}"]`).evaluate(el=>el.scrollIntoView({block:'start'}));
      await page.waitForFunction(id=>document.querySelector(`[data-role="${id}"]`).dataset.active==='true',id);
      await page.screenshot({path:`artifacts/portfolio/phase15/career-${colorScheme}-${id}.png`});
      results.push(await page.evaluate(()=>({scheme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',active:document.querySelector('[data-role][data-active="true"]')?.dataset.role,progress:getComputedStyle(document.querySelector('.executive-progress span')).transform,guideTop:document.querySelector('.executive-career-guide').getBoundingClientRect().top,header:[...document.querySelectorAll('[data-section-link][aria-current]')].map(el=>el.dataset.sectionLink)})));
    }
    for(const id of ['projects','skills','contact']) {
      await page.locator('#'+id).evaluate(el=>el.scrollIntoView({block:'start'}));
      await page.waitForFunction(id=>!!document.querySelector(`[data-section-link="${id}"][aria-current]`),id);
      await page.screenshot({path:`artifacts/portfolio/phase15/section-${colorScheme}-${id}.png`});
    }
  }
  await page.emulateMedia({colorScheme:'light'});
  await page.locator('[data-role-link]').first().focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.activeElement?.id==='career-1');
  const keyboardRole=await page.evaluate(()=>document.activeElement.id);
  const roleFocus=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineColor);
  await page.locator('.executive-project-disclosure summary').first().focus();await page.keyboard.press('Enter');
  const expanded=await page.locator('.executive-project-disclosure').first().evaluate(el=>el.open);
  await page.setViewportSize({width:375,height:960});
  await page.locator('.executive-mobile-nav summary').focus();await page.keyboard.press('Enter');
  const menu=await page.locator('.executive-mobile-nav').evaluate(el=>el.open);
  const focus=await page.locator('.executive-mobile-nav summary').evaluate(el=>getComputedStyle(el).outlineWidth);
  await page.keyboard.press('Enter');
  await page.locator('.executive-mobile-nav summary').focus();await page.keyboard.press('Enter');
  await page.locator('.executive-mobile-nav a[href="/#skills"]').click();
  await page.waitForFunction(()=>!document.querySelector('.executive-mobile-nav').open);
  const menuNavigationClosed=true;
  await page.evaluate(()=>localStorage.setItem('portfolio-motion','paused'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion="paused"]').waitFor();
  const paused=await page.locator('[data-role]').evaluateAll(els=>els.every(el=>getComputedStyle(el).animationName==='none'&&getComputedStyle(el).opacity==='1'));
  await page.evaluate(()=>localStorage.removeItem('portfolio-motion'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion="enabled"]').waitFor();
  // Exercise the observer's discrete progress fallback with native timelines disabled.
  await page.addStyleTag({content:'.executive-progress span {animation:none !important;transform:scaleX(var(--ex-progress)) !important;transition:none !important;}'});
  const fallback=[];
  for(const id of ['1','2','3']) {await page.locator(`[data-role="${id}"]`).evaluate(el=>el.scrollIntoView({block:'start'}));await page.waitForFunction(id=>document.querySelector(`[data-role="${id}"]`).dataset.active==='true',id);fallback.push(await page.locator('.executive-progress span').evaluate(el=>getComputedStyle(el).transform));}
  // The broken-image handler keeps the portrait's reserved geometry.
  await page.locator('.executive-portrait img').evaluate(el=>el.dispatchEvent(new Event('error')));
  const portraitFallback=await page.locator('.executive-portrait').evaluate(el=>({text:el.textContent,width:el.offsetWidth,height:el.offsetHeight}));
  const routeLink=page.locator('.executive-project h3 a').first();
  await routeLink.click();await page.waitForURL('**/preview/executive/project/*',{waitUntil:'domcontentloaded'});
  const detail={url:page.url(),h1:await page.locator('h1').count()};
  await page.goto(origin+'/preview/executive/project',{waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion]').waitFor();
  await page.locator('.executive-brand').click(); await page.waitForURL('**/preview/executive',{waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion]').waitFor();await page.locator('#skills').evaluate(el=>el.scrollIntoView());
  await page.waitForFunction(()=>!!document.querySelector('[data-section-link="skills"][aria-current]'));
  return {results,keyboardRole,roleFocus,expanded,menu,menuNavigationClosed,focus,paused,fallback,portraitFallback,detail,navigationReinitialized:true};
}
