const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('https://dumitru-spatial-portfolio.vercel.app',{waitUntil:'commit'});
 await p.waitForFunction(()=>window.portfolioEntry?.ready&&!portfolioEntry.pending);await p.waitForTimeout(1500);await p.bringToFront();
 await p.evaluate(()=>{window.keyAudit=[];document.addEventListener('keydown',e=>{if(e.key==='Tab')setTimeout(()=>keyAudit.push({prevented:e.defaultPrevented,target:e.target.tagName}),0)},true)});
 const report=[];
 for(const mode of ['home','work','about']){
  if(mode==='work'){await p.locator('#work-toggle').click();await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving)}
  if(mode==='about'){await p.locator('#about-control').click();await p.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending)}
  await p.evaluate(()=>document.activeElement.blur());
  const stops=[];
  for(let i=0;i<28;i++){
   await p.keyboard.press('Tab');await p.waitForTimeout(180);
   stops.push(await p.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return{tag:e.tagName,id:e.id,text:(e.getAttribute('aria-label')||e.innerText||'').slice(0,90),rect:{x:r.x,y:r.y,w:r.width,h:r.height},mode:portfolioEntry.mode,native:portfolioRuntime.focusedKey,prevented:keyAudit.at(-1)?.prevented}}));
   if(i===12)await p.screenshot({path:path.join(__dirname,'keyboard-'+mode+'.png'),scale:'css'});
  }
  report.push({mode,stops});
 }
 fs.writeFileSync(path.join(__dirname,'keyboard.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await b.close();
})();
