const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');const fs=require('fs'),path=require('path');const {ringPins}=require('../../../scripts/adapt-work-composition.cjs');const out=__dirname,checks=[];
for(const count of [5,6,8,15,18,30]){const p=ringPins(count),next=ringPins(count+1);checks.push({name:`stable ring growth ${count}`,pass:JSON.stringify(p)===JSON.stringify(next.slice(0,count))&&new Set(p.map(p=>p.dx+':'+p.dy)).size===count&&p.every(p=>Math.hypot(p.dx,p.dy)>840)});}
const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});
for(const [w,h]of[[1440,900],[390,844],[320,640],[2560,1440]]){
 const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:w<500,isMobile:w<500}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8943/?v=interactive-layout');await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
 await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving&&!portfolioEntry.pending);await page.waitForTimeout(700);
 let geometry=await page.evaluate(()=>portfolioWorkGeometry());const before=await page.evaluate(()=>({...portfolioRuntime.camera}));
 checks.push({name:`${w} all five cards and labels initially visible`,pass:geometry.projects.length===5&&geometry.projects.every(p=>p.bounds&&p.bounds.left>12&&p.bounds.right<w-12&&p.bounds.top>(w<500?140:80)&&p.bounds.bottom<h-50),geometry});
 checks.push({name:`${w} project bounds do not overlap`,pass:geometry.projects.every((p,i)=>geometry.projects.slice(i+1).every(q=>!overlaps(p.bounds,q.bounds)))});
 const centre={left:geometry.x-22,right:geometry.x+22,top:geometry.y-45,bottom:geometry.y+45};checks.push({name:`${w} central core stays clear`,pass:geometry.projects.every(p=>!overlaps(centre,p.bounds)),centre});
 await page.screenshot({path:path.join(out,`${w}-overview-final.png`),scale:'css'});
 for(const key of ['andra','btb','fkd','ora','bonanza']){
  geometry=await page.evaluate(()=>portfolioWorkGeometry());const project=geometry.projects.find(p=>p.key===key);
  if(w<500)await page.touchscreen.tap(project.x,project.y);else await page.mouse.click(project.x,project.y);
  await page.waitForFunction(key=>portfolioRuntime.focusedKey===key&&!portfolioRuntime.moving,key,{timeout:15000});await page.waitForTimeout(500);
  const initial=await page.evaluate(()=>({geometry:portfolioWorkGeometry(),camera:{...portfolioRuntime.camera}}));
  checks.push({name:`${w} ${key} actual click opens and front rect valid`,pass:initial.geometry.front?.key===key&&initial.geometry.front.left>=0&&initial.geometry.front.right<=w&&initial.geometry.front.top>100&&initial.geometry.front.bottom<h-40});
  await page.locator('#material-dots [data-material="3"]').click();await page.waitForFunction(()=>portfolioRuntime.materialIndex===3);await page.waitForTimeout(700);
  const after=await page.evaluate(()=>({geometry:portfolioWorkGeometry(),camera:{...portfolioRuntime.camera},safe:portfolioSafeArea}));
  checks.push({name:`${w} ${key} selected material bounds and camera stable`,pass:after.geometry.front?.index===3&&after.geometry.front.left>=0&&after.geometry.front.right<=w&&after.geometry.front.top>=after.safe.top&&after.geometry.front.bottom<after.safe.bottom&&JSON.stringify(after.camera)===JSON.stringify(initial.camera),front:after.geometry.front});
  if(key==='ora')await page.screenshot({path:path.join(out,`${w}-ora-material.png`),scale:'css'});
  await page.locator('#studio-back').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.focusedKey&&!portfolioRuntime.moving&&!portfolioEntry.pending);const returned=await page.evaluate(()=>({...portfolioRuntime.camera}));
  checks.push({name:`${w} ${key} actual Back exact return`,pass:['x','y','zoom'].every(k=>Math.abs(before[k]-returned[k])<.01)});
 }
 checks.push({name:`${w} no JS errors`,pass:errors.length===0,errors});await page.close();
}
await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
