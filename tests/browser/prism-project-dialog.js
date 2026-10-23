async page => {
 const origin='http://127.0.0.1:3025';
 await page.context().request.post(origin+'/admin/session',{form:{password:'prism-browser-password'},headers:{origin},maxRedirects:0});
 const check=(ok,message)=>{if(!ok)throw new Error(message);};
 const reports=[];
 for(const width of [1280,390]) for(const mode of ["dark","light"]){
  await page.setViewportSize({width,height:width===1280?720:844});
  await page.goto(origin+'/preview/prism',{waitUntil:'networkidle'});
  if(await page.locator('.prism-root').getAttribute('data-color')!==mode) await page.getByRole('button',{name:'Toggle color theme'}).click();
  const trigger=page.getByRole('button',{name:'Quick preview',exact:true}).first();
  await trigger.click();
  const dialog=page.locator('dialog[open]');
  check(await dialog.getByRole('link',{name:'View full project',exact:true}).count()===1,'Duplicate full-project links');
  const scroll=dialog.locator('.prism-dialog-scroll');
  const close=dialog.getByRole('button',{name:'Close preview',exact:true});
  const before=await close.boundingBox();
  const background=await page.evaluate(()=>scrollY);
  await scroll.evaluate(el=>el.scrollTop=el.scrollHeight);
  const after=await close.boundingBox();
  check(Math.abs(before.y-after.y)<1,'Close action moves during scroll');
  check(await page.evaluate(()=>scrollY)===background,'Background scroll changed');
  check(await scroll.evaluate(el=>el.scrollHeight>el.clientHeight),'Preview should have one scrolling content panel');
  check(await dialog.evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Outer dialog scrolls');
  check(await dialog.evaluate(el=>el.getBoundingClientRect().width<=innerWidth),'Dialog overflows mobile');
  await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const violations=await page.evaluate(async()=> (await window.axe.run(document.querySelector('dialog[open]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>v.id));
  check(violations.length===0, `Modal accessibility issues: ${violations}`);
  await scroll.evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:`/tmp/prism-project-dialog-${width}-${mode}.png`});
  await page.keyboard.press('Escape');
  await page.locator('dialog[open]').waitFor({state:'detached'});
  check(await trigger.evaluate(el=>document.activeElement===el),'Focus was not restored');
  reports.push({width,mode,violations,singleAction:true,scrollPanel:true,fixedClose:true,focusRestore:true});
 }
 return reports;
}
