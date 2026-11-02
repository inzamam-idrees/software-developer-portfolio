async sourcePage => {
  const origin = 'http://127.0.0.1:3029';
  const cookies = await sourcePage.context().cookies(origin);
  const browser = sourcePage.context().browser();
  const results = [], failures = [];
  for (const mode of ['standard', 'nojs', 'reduced']) for (const colorScheme of ['light','dark']) for (const width of [375,390,768,1280,1536]) {
    const context = await browser.newContext({viewport:{width,height:960},colorScheme,javaScriptEnabled:mode!=='nojs',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    await context.addCookies(cookies);
    const page = await context.newPage();
    page.on('pageerror',error=>failures.push({mode,colorScheme,width,error:error.message}));
    for (const route of ['', '/project', '/project/mis-nexis','/blog']) {
      await page.goto(origin+'/preview/executive'+route,{waitUntil:'domcontentloaded',timeout:60000});
      await page.locator('.theme-executive').waitFor();
      if(mode!=='nojs') await page.locator('[data-executive-motion]').waitFor();
      if(mode!=="nojs") await page.evaluate(()=>document.fonts.ready);
      const state = await page.locator('.theme-executive').evaluate(root=>({
        height:root.scrollHeight, h1:root.querySelectorAll('h1').length,
        overflow:document.documentElement.scrollWidth>innerWidth,
        clipped:[...root.querySelectorAll('h1,h2,h3,p,li,summary,a')].filter(el=>el.getClientRects().length).filter(el=>{const r=el.getBoundingClientRect();return r.left < -1 || r.right>innerWidth+1;}).map(el=>el.textContent.slice(0,70)),
        hidden:[...root.querySelectorAll('main section')].filter(el=>getComputedStyle(el).opacity==='0'||getComputedStyle(el).visibility==='hidden').length,
        motion:root.dataset.executiveMotion,
        image:!root.querySelector('.executive-portrait img')||root.querySelector('.executive-portrait img').naturalWidth>0,
        impacts:root.querySelectorAll('.executive-role-impact').length
      }));
      if(state.overflow||state.clipped.length||state.h1!==1||state.hidden||!state.image||state.impacts)failures.push({mode,colorScheme,width,route,state});
      if(mode==='reduced'&&state.motion!=='paused')failures.push({mode,colorScheme,width,route,error:'motion not paused'});
      if(mode==='standard'&&[390,1280].includes(width)) {
        const name=route.replaceAll('/','-')||'home';
        await page.screenshot({path:`artifacts/portfolio/phase19/after-${colorScheme}-${width}-${name}.png`,fullPage:true});
        if(!route)await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase19/career-${colorScheme}-${width}.png`});
      }
      results.push({mode,colorScheme,width,route:route||'home',...state});
    }
    await context.close();
  }
  return {cases:results.length,failures,results};
}
