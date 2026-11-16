const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.join(__dirname,'final-layout');fs.mkdirSync(out,{recursive:true});
const result={runs:[],failures:[]};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const [width,height] of [[2560,1440],[1440,900],[768,1024],[700,650],[854,480],[390,844],[320,568]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>portfolioEntry.ready&&document.body.dataset.entry==='home');await page.waitForTimeout(700);
 for(const locale of ['en','ro','ru']){
  await page.locator(`[data-locale=${locale}]`).click();await page.waitForTimeout(150);
  const geometry=await page.evaluate(()=>{
   const selectors=['#studio-title','.studio-role','#enter-work','#home-control','#language-control','#work-toggle','#process-control','#about-control','#nav-contact','.studio-bottom a'];
   const boxes=selectors.map(selector=>{let e=document.querySelector(selector),r=e.getBoundingClientRect();return {selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}});
   const outside=boxes.filter(b=>b.x<-.5||b.y<-.5||b.right>innerWidth+.5||b.bottom>innerHeight+.5);
   const overlap=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){let a=boxes[i],b=boxes[j];if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1)overlap.push([a.selector,b.selector]);}
   return {outside,overlap,scroll:document.documentElement.scrollWidth>innerWidth,boxes};
  });
  const run={width,height,locale,...geometry,errors:[...errors]};result.runs.push(run);if(geometry.outside.length||geometry.overlap.length||geometry.scroll||errors.length)result.failures.push(run);
  if(locale==='ru'||width===1440&&locale==='en')await page.screenshot({path:path.join(out,`${width}-${height}-${locale}.png`)});
 }
 await context.close();
}
const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:8943/');const nojs=await page.locator('noscript a').isVisible();result.noJavaScriptContact=nojs;if(!nojs)result.failures.push({noJavaScriptContact:false});await context.close();
}finally{await browser.close()}fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({runs:result.runs.length,failures:result.failures,noJavaScriptContact:result.noJavaScriptContact}));if(result.failures.length)process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});
