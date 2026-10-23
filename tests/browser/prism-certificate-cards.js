// Use only the isolated port-3025 preview with the temporary certificate fixture.
async page => {
 const origin='http://127.0.0.1:3025';
 const check=(ok,message)=>{if(!ok)throw new Error(message);};
 await page.context().request.post(origin+'/admin/session',{form:{password:'prism-browser-password'},headers:{origin},maxRedirects:0});
 const reports=[];
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(origin+'/preview/prism',{waitUntil:'networkidle'});
  await page.locator('#certificates').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const first=page.locator('.prism-certificate').first();
  check(await first.locator('.prism-certificate-description').count()===1,'Description missing');
  check(await first.locator('.prism-tags li').count()===2,'Competencies missing');
  check(await first.locator('.prism-certificate-status').textContent()==='Completed','Status differs');
  const link=first.getByRole('link',{name:'View certificate'});
  check(await link.getAttribute('href')==='https://example.com/certificate-fixture','Certificate link differs');
  check(await link.getAttribute('target')==='_blank','Certificate link should open separately');
  check(await page.locator('.prism-certificate-link').count()===1,'Missing URLs must not create fake links');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Certificate overflow');
  const cols=await page.locator('.prism-credentials-grid').last().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(cols===(width===1280?2:1),'Certificate grid differs');
  reports.push({width,columns:cols,description:true,competencies:2,status:true,certificateLink:true});
 }
 return reports;
}
