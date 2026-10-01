async page=>{
 const origin=new URL(page.url()).origin;await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Pause motion',exact:true}).waitFor({timeout:30000});
 await page.locator('canvas').waitFor({timeout:30000});if(await page.locator('canvas').count()!==1)throw new Error('One canvas required');
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();await page.getByRole('button',{name:'Enable motion',exact:true}).waitFor();
 await page.getByRole('button',{name:'Enable motion',exact:true}).click();await page.getByRole('button',{name:'Pause motion',exact:true}).waitFor();
 await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await page.waitForFunction(()=>!document.querySelector('canvas'));
 if(!await page.locator('.static-core').isVisible())throw new Error('Context loss fallback missing');
 const context=await page.context().browser().newContext();await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:get.call(this,type,...args);};});const p=await context.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await p.locator('h1').waitFor();
 if(!await p.locator('.static-core').isVisible())throw new Error('WebGL denied fallback missing');await context.close();return {motion:'passed',fallback:'passed'};
}
