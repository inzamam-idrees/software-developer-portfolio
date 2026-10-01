async page => {
  const origin=new URL(page.url()).origin; const errors=[];
  const context=await page.context().browser().newContext(); const p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin,{waitUntil:"domcontentloaded"}); await p.locator('h1').waitFor();
  if(await p.locator('h1').count()!==1) throw new Error('Exactly one h1 required');
  if(!await p.locator('body').getByText('MIS / Nexis Project',{exact:true}).first().isVisible()) throw new Error('Project absent');
  if(errors.length) throw new Error(errors.join('; ')); await context.close();
  const nojs=await page.context().browser().newContext({javaScriptEnabled:false}); const staticPage=await nojs.newPage();
  await staticPage.goto(origin,{waitUntil:"domcontentloaded"}); const text=await staticPage.locator('body').innerText();
  if(!text.includes('MIS / Nexis Project') || !text.includes('inzamamidrees@gmail.com')) throw new Error('Essential content absent without JavaScript');
  await nojs.close(); return {startup:'passed',noJavaScript:'passed'};
}
