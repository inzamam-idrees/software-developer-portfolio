async page=>{
 const result=[];
 // Supplemental theme-only evidence; the full matrix retains the real preview bar.
 for(const colorScheme of ['light','dark'])for(const width of [375,390,1280]){
  await page.setViewportSize({width,height:960});await page.emulateMedia({colorScheme});
  await page.goto('http://127.0.0.1:3025/preview/executive',{waitUntil:'domcontentloaded'});await page.locator('[data-executive-motion]').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'[data-preview-bar]{visibility:hidden !important;}'});
  if(width<400){await page.screenshot({path:`artifacts/portfolio/phase16/theme-${colorScheme}-${width}-full.png`,fullPage:true});await page.addStyleTag({content:'.executive-header,.skip-link{visibility:hidden !important;}'});await page.locator('#experience').screenshot({path:`artifacts/portfolio/phase16/theme-${colorScheme}-${width}-career.png`});}
  if(width===1280){await page.addStyleTag({content:'.executive-header,.skip-link{visibility:hidden !important;}'});for(const id of ['certificates','background','resume'])await page.locator('#'+id).screenshot({path:`artifacts/portfolio/phase16/after-${colorScheme}-${id}.png`});result.push({colorScheme,width,sections:await page.locator('main section').evaluateAll(els=>els.map(el=>({id:el.id,height:el.offsetHeight})))})}
 }
 return result;
}
