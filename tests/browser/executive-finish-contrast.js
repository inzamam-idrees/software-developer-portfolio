async page => {
 const results=[];
 for(const colorScheme of ['light','dark'])for(const width of [375,390,768,1280,1536]) {
  await page.setViewportSize({width,height:960});await page.emulateMedia({colorScheme});
  await page.goto('http://127.0.0.1:3025/preview/executive',{waitUntil:'domcontentloaded'});
  await page.locator('[data-executive-motion]').waitFor();
  const sample=await page.locator('.theme-executive').evaluate(root=>{
   const parse=value=>{const nums=value.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];return [...nums.slice(0,3),nums.length>3?nums[3]:1];};
   const blend=(fg,bg)=>fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
   const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
   const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const samples=[];
   while(walker.nextNode()) {
    const node=walker.currentNode;const el=node.parentElement;if(!node.textContent.trim()||!el||el.closest('script,style,template,noscript'))continue;
    const style=getComputedStyle(el);if(!el.checkVisibility()||parseFloat(style.fontSize)>16)continue;
    const range=document.createRange();range.selectNodeContents(node);if(![...range.getClientRects()].some(rect=>rect.width>2&&rect.height>2))continue;
    const ancestors=[];for(let p=el;p;p=p.parentElement)ancestors.unshift(p);
    let bg=[255,255,255],opacity=1;
    for(const ancestor of ancestors){const s=getComputedStyle(ancestor);bg=blend(parse(s.backgroundColor),bg);opacity*=Number(s.opacity);}
    const color=parse(style.color);color[3]*=opacity;
    const contrast=ratio(blend(color,bg),bg);
    const category=el.closest('.executive-certificate')?'certificate':el.closest('.executive-timeline')?'career metadata':el.closest('.executive-hero-brief')?'hero metadata':el.closest('.executive-resume')?'resume metadata':el.closest('.executive-tech-list')?'technology':el.closest('.executive-article-list')?'article metadata':el.closest('.executive-footer')?'footer':'other';
    samples.push({category,text:node.textContent.trim().slice(0,85),class:el.className,contrast:+contrast.toFixed(2),size:style.fontSize,opacity:+opacity.toFixed(3)});
   }
   samples.sort((a,b)=>a.contrast-b.contrast);
   return {smallTextNodes:samples.length,minimum:samples[0],categoryMinimum:Object.fromEntries([...new Set(samples.map(item=>item.category))].map(category=>[category,samples.find(item=>item.category===category).contrast])),lowest:samples.slice(0,12),failures:samples.filter(item=>item.contrast<4.5)};
  });
  results.push({colorScheme,width,...sample});
 }
 return {results,failures:results.flatMap(item=>item.failures.map(failure=>({colorScheme:item.colorScheme,width:item.width,...failure})))};
}
