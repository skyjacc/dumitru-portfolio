const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const {diamondPins}=require('../../../scripts/adapt-work-composition.cjs');
const out=__dirname,checks=[];
for(const n of [5,8,18,32]){
 const p=diamondPins(n),next=diamondPins(n+1),rows={};p.forEach(pin=>{rows[pin.dy]=(rows[pin.dy]||0)+1});
 checks.push({name:'layout '+n,pass:new Set(p.map(x=>x.dx+':'+x.dy)).size===n&&JSON.stringify(p)===JSON.stringify(next.slice(0,n)),rows,pins:p});
}
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});
 for(const [w,h]of[[1440,900],[390,844],[393,620]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:w<500,isMobile:w<500}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=work-composition');
  await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
  await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving&&!portfolioEntry.pending);await page.waitForTimeout(700);
  const geometry=await page.evaluate(()=>portfolioWorkGeometry());
  checks.push({name:w+' overview anchors',pass:geometry.projects.length===5&&geometry.projects.every(p=>p.x>0&&p.x<w&&p.y>0&&p.y<h),geometry});
  await page.screenshot({path:path.join(out,w+'-overview.png'),scale:'css'});
  const before=await page.evaluate(()=>({...portfolioRuntime.camera}));
  for(const key of ['andra','btb','fkd','ora','bonanza']){
   await page.evaluate(key=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key}})),key);
   await page.waitForFunction(key=>portfolioRuntime.focusedKey===key&&!portfolioRuntime.moving,key,{timeout:15000});await page.waitForTimeout(450);
   if(key==='ora')await page.screenshot({path:path.join(out,w+'-ora.png'),scale:'css'});
   await page.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'return'}})));
   await page.waitForFunction(()=>!portfolioRuntime.focusedKey&&!portfolioRuntime.moving);const after=await page.evaluate(()=>({...portfolioRuntime.camera}));
   checks.push({name:w+' '+key+' exact return',pass:['x','y','zoom'].every(k=>Math.abs(before[k]-after[k])<.01)});
  }
  checks.push({name:w+' no JS errors',pass:errors.length===0,errors});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});

