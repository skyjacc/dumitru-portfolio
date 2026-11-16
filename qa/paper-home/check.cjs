const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');const out=__dirname,report={runs:[],failures:[]};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const [width,height] of [[1440,900],[2560,1440],[700,650],[768,1024],[854,480],[390,844],[320,568]]){
 const c=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await p.goto('http://127.0.0.1:8943/');await p.waitForFunction(()=>portfolioEntry.ready&&document.body.dataset.entry==='home');await p.waitForTimeout(700);
 for(const locale of ['en','ro','ru']){
  await p.locator(`[data-locale=${locale}]`).click();await p.waitForTimeout(160);
  const detail=await p.evaluate(()=>{
   const selectors=['#studio-title','.studio-role','.laptop-caption','#home-control','#language-control','#work-toggle','#process-control','#about-control','#nav-contact'];
   const boxes=selectors.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom}});
   const outside=boxes.filter(r=>r.x<0||r.y<0||r.right>innerWidth+.5||r.bottom>innerHeight+.5),overlap=[];
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){let a=boxes[i],b=boxes[j];if(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1)overlap.push([a.selector,b.selector]);}
   const images=[...document.querySelectorAll('#studio-home img')];
   return{outside,overlap,images:images.map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0})),projectNames:/ANDRA|BTB|ORA LENT|Bonanza|5 independent|5 концепт/.test(document.querySelector('#studio-home').innerText),corners:[...document.querySelectorAll('[data-help-sticker],[data-sticker-link],[data-sticker=work]')].filter(e=>getComputedStyle(e).display!=='none').length};
  });
  const ok=!detail.outside.length&&!detail.overlap.length&&!detail.projectNames&&!detail.corners&&detail.images.length===1&&detail.images[0].loaded&&!errors.length;
  report.runs.push({width,height,locale,ok,...detail,errors:[...errors]});if(!ok)report.failures.push(report.runs.at(-1));
  if(locale==='en'||locale==='ru')await p.screenshot({path:path.join(out,`${width}-${height}-${locale}.png`)});
 }
 await c.close();
}
}finally{await browser.close()}fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({runs:report.runs.length,failures:report.failures}));if(report.failures.length)process.exitCode=1})().catch(e=>{console.error(e);process.exitCode=1});
