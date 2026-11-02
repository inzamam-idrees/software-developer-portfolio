async sourcePage => {
  const origin = 'http://127.0.0.1:3025';
  const browser = sourcePage.context().browser();
  const cookies = await sourcePage.context().cookies(origin);
  const results = [];
  const failures = [];
  for (const mode of ['standard', 'nojs', 'reduced']) {
    for (const colorScheme of ['light', 'dark']) {
      for (const width of [375, 768, 1280, 1536]) {
        const context = await browser.newContext({ viewport: {width, height:960}, colorScheme, javaScriptEnabled: mode !== 'nojs', reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
        await context.addCookies(cookies);
        const page = await context.newPage();
        page.on('pageerror', error => failures.push({mode,colorScheme,width,error:error.message}));
        for (const route of ['', '/project', '/blog']) {
          await page.goto(origin + '/preview/executive' + route, {waitUntil:'domcontentloaded',timeout:60000});
          await page.locator('.theme-executive').waitFor();
          if (mode !== 'nojs') await page.locator('[data-executive-motion]').waitFor();
          if (mode !== 'nojs') await page.evaluate(()=>document.fonts.ready);
          const label = route.slice(1) || 'home';
          await page.screenshot({path:`artifacts/portfolio/phase15/${mode}-${colorScheme}-${width}-${label}.png`,fullPage:true});
          const state = await page.locator('.theme-executive').evaluate(root => {
            const visible = [...root.querySelectorAll('h1,h2,h3,p,li,summary,a')].filter(el=>el.getClientRects().length);
            return {
              h1:root.querySelectorAll('h1').length,
              overflow:document.documentElement.scrollWidth>innerWidth,
              clipped:visible.filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1 || r.left< -1;}).map(el=>el.textContent.slice(0,70)),
              hidden: [...root.querySelectorAll('main section')].filter(el=>getComputedStyle(el).opacity==='0'||getComputedStyle(el).visibility==='hidden').length,
              canvases:root.querySelectorAll('canvas').length,
              motion:root.dataset.executiveMotion,
              background:getComputedStyle(root).backgroundColor
            };
          });
          if(state.h1!==1||state.overflow||state.clipped.length||state.hidden||state.canvases) failures.push({mode,colorScheme,width,label,state});
          if(mode==='reduced' && state.motion!=='paused') failures.push({mode,colorScheme,width,label,error:'reduced motion not static'});
          if(mode==='nojs' && !route) {
            const disclosure=page.locator('.executive-project-disclosure').first();
            await disclosure.locator('summary').focus(); await page.keyboard.press('Enter');
            if(!await disclosure.evaluate(el=>el.open)) failures.push({width,colorScheme,error:'native project disclosure'});
            if(width<1000) {
              const menu=page.locator('.executive-mobile-nav'); await menu.locator('summary').focus(); await page.keyboard.press('Enter');
              if(!await menu.evaluate(el=>el.open)) failures.push({width,colorScheme,error:'native menu'});
            }
            await page.locator('[data-role-link]').last().focus(); await page.keyboard.press('Enter');
            if(!await page.locator('[data-role]').last().isVisible()) failures.push({width,colorScheme,error:'native career anchor'});
          }
          results.push({mode,colorScheme,width,route:label,...state});
        }
        await context.close();
      }
    }
  }
  return {captures:results.length,failures,results};
}
