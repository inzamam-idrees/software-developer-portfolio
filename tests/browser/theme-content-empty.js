async page => {
 const origin='http://127.0.0.1:3028';
 const login=await page.context().request.post(origin+'/admin/session',{form:{password:'prism-browser-password'},headers:{origin},maxRedirects:0});
 if(!login.headers().location?.endsWith('/admin/theme')) throw new Error('Isolated preview login failed');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:900});
 const reports=[];
 for(const id of ['coding','cinematic','executive','spatial']){
  await page.goto(`${origin}/preview/${id}`,{waitUntil:'networkidle'});
  for(const section of ['certificates','resume','writing']){
   if(await page.locator('#'+section).count()) throw new Error(`${id}: disabled ${section} visible`);
   if(await page.locator(`a[href="/#${section}"]`).count()) throw new Error(`${id}: disabled ${section} navigation visible`);
  }
  if(await page.locator('#contact form').count()) throw new Error(`${id}: disabled contact form visible`);
  if(await page.locator('#contact').count()!==1) throw new Error(`${id}: contact details missing`);
  reports.push({id,hiddenSections:true,hiddenForm:true});
 }
 return reports;
}
