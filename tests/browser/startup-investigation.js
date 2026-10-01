async page => {
  const origin = new URL(page.url()).origin;
  const results = [];
  for (const blocked of [false, true]) {
    for (let i=0;i<3;i++) {
      const context = await page.context().browser().newContext();
      if (blocked) await context.route('**/*googletagmanager.com/**',r=>r.abort());
      const p=await context.newPage(); const errors=[], failures=[], scripts=[];
      p.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));
      p.on('requestfailed',r=>failures.push({url:r.url().split('?')[0],reason:r.failure()?.errorText}));
      p.on('response',async r=>{if(r.request().resourceType()==='script' && r.url().startsWith(origin)) scripts.push({url:r.url().split('?')[0],status:r.status(),bytes:(await r.body().catch(()=>new Uint8Array())).length});});
      await p.goto(origin,{waitUntil:"domcontentloaded"}); await p.locator('h1').waitFor({timeout:15000});
      await p.reload({waitUntil:"domcontentloaded"}); await p.locator('h1').waitFor({timeout:15000});
      results.push({blocked,run:i+1,errors,failures,scripts}); await context.close();
    }
  }
  return results;
}
