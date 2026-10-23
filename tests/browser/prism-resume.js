async page => {
 const origin='http://127.0.0.1:3025';
 await page.context().request.post(origin+'/admin/session',{form:{password:'prism-browser-password'},headers:{origin},maxRedirects:0});
 const check=(ok,message)=>{if(!ok)throw new Error(message);};
 const reports=[];
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(origin+'/preview/prism',{waitUntil:'domcontentloaded'});
  await page.locator('#resume').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' }));
  await page.waitForTimeout(2500);
  const viewer=page.getByTitle('PDF Document Viewer',{exact:true});
  const source=await viewer.getAttribute('src');
  check(source.endsWith('/preview')&&source.startsWith('https://drive.google.com/file/d/'),'Drive preview URL differs');
  const action=page.locator('#resume').getByRole('link',{name:'Open Resume'});
  check((await action.getAttribute('href')).includes('/view?usp=sharing'),'Original Drive link changed');
  check(await action.getAttribute('target')==='_blank','Open action must use separate tab');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewer causes overflow');
  check(await viewer.isVisible(),'Viewer hidden');
  const frame=await (await viewer.elementHandle()).contentFrame();
  let text=''; try { text=await frame.locator('body').innerText({timeout:10000}); } catch {}
  await page.locator('#resume').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' }));
  await page.waitForTimeout(600);
  await page.screenshot({path:`/tmp/prism-resume-${width}.png`});
  reports.push({width,source,frameUrl:frame?.url(),frameText:text.slice(0,1000)});
 }
 return reports;
}
