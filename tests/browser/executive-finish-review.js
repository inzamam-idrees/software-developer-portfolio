async page=>{
 const result=[];
 for(const colorScheme of ['light','dark'])for(const width of [390,1280]){
  await page.setViewportSize({width,height:960});await page.emulateMedia({colorScheme});await page.goto('http://127.0.0.1:3025/preview/executive',{waitUntil:'domcontentloaded'});await page.locator('[data-executive-motion]').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`artifacts/portfolio/phase17/after-${colorScheme}-${width}-full.png`,fullPage:true});await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase17/after-${colorScheme}-${width}-career.png`});
  await page.addStyleTag({content:'[data-preview-bar],.executive-header,.skip-link{visibility:hidden !important;}'});
  await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase17/theme-${colorScheme}-${width}-career.png`});
  if(width===1280)for(const id of ['hero','certificates','writing'])await page.locator('#'+id).screenshot({path:`artifacts/portfolio/phase17/detail-${colorScheme}-${id}.png`});
  result.push(await page.evaluate(({colorScheme,width})=>({colorScheme,width,height:document.querySelector('.theme-executive').scrollHeight,heroBottom:getComputedStyle(document.querySelector('.executive-hero')).paddingBottom,careerTop:getComputedStyle(document.querySelector('.executive-career')).paddingTop,introSize:getComputedStyle(document.querySelector('.executive-hero-intro')).fontSize,buttonSize:getComputedStyle(document.querySelector('.executive-hero .executive-button')).fontSize,buttonHeight:document.querySelector('.executive-hero .executive-button').offsetHeight,projectPadding:getComputedStyle(document.querySelector('.executive-project')).paddingTop,chipSize:getComputedStyle(document.querySelector('.executive-tech-list li')).fontSize,chipLineHeight:getComputedStyle(document.querySelector('.executive-tech-list li')).lineHeight,certificates:document.querySelectorAll('.executive-certificate').length,list:!!document.querySelector('.executive-certificate-list'),impact:document.querySelectorAll('.executive-role-impact').length,writingSlim:!!document.querySelector('.executive-writing-strip')}),{colorScheme,width}));
 }
 return result;
}
