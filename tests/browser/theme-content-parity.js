async page => {
 const origin='http://127.0.0.1:3028';
 const check=(ok,message)=>{if(!ok)throw new Error(message);};
 const login=await page.context().request.post(origin+'/admin/session',{form:{password:'prism-browser-password'},headers:{origin},maxRedirects:0});
 check(login.headers().location?.endsWith('/admin/theme'),'Isolated preview login failed');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin+'/preview/prism',{waitUntil:'networkidle'});
 const expected=await page.evaluate(()=>({
  name:document.querySelector('#prism-hero-title .prism-sr-only').textContent,
  designation:document.querySelector('.prism-role-text').textContent,
  roles:document.querySelector('.prism-role .prism-sr-only').textContent.split(', '),
  certificates:[...document.querySelectorAll('#certificates h3')].map(el=>el.textContent),
  education:[...document.querySelectorAll('#education h4')].map(el=>el.textContent),
  awards:[...document.querySelectorAll('#awards h3')].map(el=>el.textContent),
  skills:[...new Set([...document.querySelectorAll('#skills .prism-tags li')].map(el=>el.firstChild.textContent.trim()))],
  projects:[...document.querySelectorAll('.prism-carousel h3')].map(el=>el.textContent),
  resume:document.querySelector('#resume iframe').getAttribute('src'),
 }));
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const reports=[];
 for(const id of ['coding','cinematic','executive','spatial']) for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(`${origin}/preview/${id}`,{waitUntil:'networkidle'});
  const body=(await page.locator('body').textContent()).replace(/\s+/g,' ');
  for(const section of ['hero','about','experience','skills','projects','education','awards','certificates','writing','resume','contact']) check(await page.locator('#'+section).count()===1,`${id}/${width} missing or duplicate ${section}`);
  check(body.includes(expected.name)&&body.includes(expected.designation),`${id} identity missing`);
  for(const role of expected.roles) check(body.includes(role),`${id} missing role ${role}`);
  for(const value of [...expected.certificates,...expected.education,...expected.awards,...expected.projects]) check(body.includes(value),`${id} missing canonical ${value}`);
  for(const skill of expected.skills) check(body.includes(skill)||id==='coding'&&({'JavaScript':'Javascript','TypeScript':'Typescript','Next.js':'Next JS','Node.js':'Node JS','Tailwind CSS':'Tailwind','Material UI':'MaterialUI','jQuery':'JQuery'}[skill]&&body.includes({'JavaScript':'Javascript','TypeScript':'Typescript','Next.js':'Next JS','Node.js':'Node JS','Tailwind CSS':'Tailwind','Material UI':'MaterialUI','jQuery':'JQuery'}[skill])),`${id} missing skill ${skill}`);
  check(await page.locator('#resume iframe').getAttribute('src')===expected.resume,`${id} wrong resume preview`);
  check(await page.locator('a[href="/#certificates"]').count()>0,`${id} certificates navigation missing`);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}/${width} horizontal overflow`);
  await page.locator('#certificates').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
  await page.screenshot({path:`/tmp/theme-parity-${id}-${width}-certificates.png`});
  await page.locator('#resume').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
  await page.locator('#resume iframe').scrollIntoViewIfNeeded();
  check(await page.locator('#resume a').first().getAttribute('href'), `${id} original resume action missing`);
  await page.screenshot({path:`/tmp/theme-parity-${id}-${width}-resume.png`});
  await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const violations=await page.evaluate(async()=> (await window.axe.run(document.querySelector('[data-theme-id]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  check(violations.length===0, `${id}/${width} accessibility: ${JSON.stringify(violations)}`);
  reports.push({id,width,sections:11,certificates:expected.certificates.length,skills:expected.skills.length,resumeEmbed:true,violations});
 }
 for(const id of ['coding','cinematic','executive','spatial']){
  const nojs=await page.context().browser().newContext({javaScriptEnabled:false,storageState:await page.context().storageState(),viewport:{width:390,height:900}});
  const fallback=await nojs.newPage();
  await fallback.goto(`${origin}/preview/${id}`,{waitUntil:'networkidle'});
  check(await fallback.locator('#certificates h3').count()===expected.certificates.length,`${id} no-JS certificates missing`);
  check(await fallback.locator('#resume iframe').count()===1,`${id} no-JS resume missing`);
  await nojs.close();
 }
 for(const id of ['coding','cinematic','executive','spatial']) for(const route of ['/project','/blog']){
  await page.goto(`${origin}/preview/${id}${route}`,{waitUntil:'networkidle'});
  check(await page.locator(`[data-theme-id="${id}"]`).count()===1,`${id}${route} broken`);
 }
 check(errors.length===0,`Page errors: ${errors.join('; ')}`);
 return {reports,noJavaScript:'passed',archiveRoutes:8,pageErrors:errors};
}
