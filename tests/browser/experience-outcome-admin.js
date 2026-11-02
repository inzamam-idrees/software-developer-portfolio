async sourcePage=>{
 const browser=sourcePage.context().browser();const cookies=await sourcePage.context().cookies('http://127.0.0.1:3025');const results=[];const failures=[];
 const value='[TEST FIXTURE ONLY: editor save check; not a professional claim.]';
 for(const store of ['filesystem','github'])for(const [colorScheme,width] of [['light',1280],['dark',390]]){
  const port=store==='filesystem'?3026:3028;const origin=`http://127.0.0.1:${port}`;
  const context=await browser.newContext({viewport:{width,height:960},colorScheme});await context.addCookies(cookies);const page=await context.newPage();page.on('pageerror',error=>failures.push({store,colorScheme,width,error:error.message}));
  await page.goto(origin+'/admin/content/experience',{waitUntil:'domcontentloaded'});await page.locator('#field-0-toggle').click();const field=page.getByLabel('Outcome',{exact:true});await field.waitFor();
  const metadata=await field.evaluate(el=>({tag:el.tagName,description:el.getAttribute('aria-describedby'),help:document.getElementById(el.getAttribute('aria-describedby'))?.textContent,helpColor:getComputedStyle(document.getElementById(el.getAttribute('aria-describedby'))).color}));
  if(metadata.tag!=='TEXTAREA'||!metadata.help?.includes('leave empty if unknown'))failures.push({store,metadata});
  await field.fill(`  ${value}  `);
  const saving=page.waitForResponse(response=>response.url().endsWith('/admin/content/experience/save')&&response.request().method()==='POST');await page.getByRole('button',{name:'Save changes',exact:true}).click();const response=await saving;const body=await response.json();
  if(response.status()!==200||!body.ok||body.liveAfterWrite!==(store==='filesystem'))failures.push({store,status:response.status(),body});
  await page.locator('[data-save-status][data-tone="success"]').waitFor();const savedStatus=await page.locator('[data-save-status]').innerText();
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#field-0-toggle').click();const reloaded=await page.getByLabel('Outcome',{exact:true}).inputValue();if(reloaded!==value)failures.push({store,error:'outcome did not persist/trim',reloaded});
  await page.screenshot({path:`artifacts/portfolio/phase18/admin-${store}-${colorScheme}-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Clear Outcome',exact:true}).click();
  const clearing=page.waitForResponse(response=>response.url().endsWith('/admin/content/experience/save')&&response.request().method()==='POST');await page.getByRole('button',{name:'Save changes',exact:true}).click();const clearResponse=await clearing;if(clearResponse.status()!==200)failures.push({store,error:'clear save failed',status:clearResponse.status()});
  await page.locator('[data-save-status][data-tone="success"]').waitFor();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#field-0-toggle').click();const cleared=await page.getByLabel('Outcome',{exact:true}).inputValue();if(cleared!=='')failures.push({store,error:'clear not persisted',cleared});
  await page.getByLabel('Outcome',{exact:true}).fill('   ');
  const invalidRequest=page.waitForResponse(response=>response.url().endsWith('/admin/content/experience/save')&&response.request().method()==='POST');await page.getByRole('button',{name:'Save changes',exact:true}).click();const invalid=await invalidRequest;
  await page.waitForFunction(()=>document.querySelector('#field-0-outcome').getAttribute('aria-invalid')==='true');
  const validationOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(validationOverflow)failures.push({store,colorScheme,width,error:'validation overflow'});
  await page.screenshot({path:`artifacts/portfolio/phase18/admin-${store}-${colorScheme}-${width}-validation.png`,fullPage:true});
  const validation=await page.getByLabel('Outcome',{exact:true}).evaluate(el=>({invalid:el.getAttribute('aria-invalid'),describedBy:el.getAttribute('aria-describedby')}));
  if(invalid.status()!==422||!validation.describedBy.includes('field-0-outcome-help')||!validation.describedBy.includes('field-0-outcome-error'))failures.push({store,error:'help/error association',validation,status:invalid.status()});
  await page.getByRole('button',{name:'Clear Outcome',exact:true}).click();const resetRequest=page.waitForResponse(response=>response.url().endsWith('/admin/content/experience/save')&&response.request().method()==='POST');await page.getByRole('button',{name:'Save changes',exact:true}).click();if((await resetRequest).status()!==200)failures.push({store,error:'post-validation clear failed'});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)failures.push({store,colorScheme,width,error:'editor overflow'});
  results.push({store,colorScheme,width,metadata,savedStatus,reloaded,cleared,validation,validationOverflow,overflow,liveAfterWrite:body.liveAfterWrite});await context.close();
 }
 return {results,failures};
}
