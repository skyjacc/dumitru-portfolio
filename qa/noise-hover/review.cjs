const fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const out=__dirname,only=process.env.REVIEW_ONLY?.split(','),results=only?JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8')).results.filter(r=>!only.includes(r.name)):[];
const close=(a,b)=>['x','y','zoom'].every(k=>Math.abs(a[k]-b[k])<.02);
const backing='let s=.035*t.w;e.alpha=r,e.fillRect(t.x,t.y,t.w,t.h,i.bg,t.r)';
const instrumented='let s=.035*t.w;(window.__noiseSamples||(window.__noiseSamples=[])).push({at:performance.now(),seed:(0,g.staticField)(n,o),frozen:a,reduced:o,w:t.w,h:t.h});if(window.__noiseSamples.length>2500)window.__noiseSamples.splice(0,2000);e.alpha=r,e.fillRect(t.x,t.y,t.w,t.h,i.bg,t.r)';
(async()=>{
 for(const spec of [{name:'desktop',engine:chromium,w:1440,h:900,reduce:false},{name:'reduced',engine:chromium,w:1440,h:900,reduce:true},{name:'phone',engine:webkit,w:390,h:844,reduce:false}]){
  if(only&&!only.includes(spec.name))continue;
  const browser=await spec.engine.launch({headless:true,...(spec.engine===chromium?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:{width:spec.w,height:spec.h},deviceScaleFactor:spec.w<500?3:1,isMobile:spec.w<500,hasTouch:spec.w<500,reducedMotion:spec.reduce?'reduce':'no-preference'});
  const checks=[],errors=[];const check=(name,pass,data)=>checks.push({name,pass,data});
  page.on('pageerror',e=>errors.push(String(e)));
  // Browser-only observation: same draw call and timing, no product-file edits.
  await page.route('**/_next/static/chunks/1l2px902fb04m.js',async route=>{const res=await route.fetch();const source=await res.text();if(source.split(backing).length!==2)throw Error('Expected one restored native gated backing');await route.fulfill({response:res,body:source.replace(backing,instrumented)});});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:30000});
  const cam=()=>page.evaluate(()=>({...portfolioRuntime.camera}));
  const samples=()=>page.evaluate(()=>window.__noiseSamples||[]);
  const clear=()=>page.evaluate(()=>{window.__noiseSamples=[]});
  try{
   await page.goto(origin+'/?review=noise-hover',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>portfolioEntry?.ready&&portfolioLoader.getState().phase==='complete',null,{timeout:45000});
   await page.locator('#work-toggle').click();await settle('work');await page.waitForTimeout(300);
   const geometry=await page.evaluate(()=>portfolioWorkGeometry()),camera=await cam();
   await page.screenshot({path:path.join(out,spec.name+'-cold-work.png'),scale:'css'});
   const cold=await samples();check('cold Work draws restored gated noise',cold.length>0&&cold.some(x=>x.w>0&&x.h>0),{count:cold.length,seeds:[...new Set(cold.map(x=>x.seed))].slice(-6)});
   if(spec.name==='desktop'){
    await page.mouse.move(24,400);await page.waitForTimeout(5000);
    // Resize is activity and wakes the renderer; inspect its final idle draw.
    const idle=(await samples()).slice(-1);check('idle field is frozen',idle.length>0&&idle.every(x=>x.frozen),idle);
    const target=geometry.projects.find(p=>p.key==='btb');
    await clear();await page.mouse.move(target.x,target.y);await page.waitForTimeout(340);
    const moving=await samples();check('hover wakes changing native noise',moving.some(x=>!x.frozen)&&new Set(moving.map(x=>x.seed)).size>1,{count:moving.length,seeds:[...new Set(moving.map(x=>x.seed))]});
    const after=await page.evaluate(()=>portfolioWorkGeometry());check('hover leaves camera and project geometry fixed',close(camera,await cam())&&geometry.projects.every((p,i)=>Math.abs(p.x-after.projects[i].x)<.02&&Math.abs(p.y-after.projects[i].y)<.02),{before:camera,after:await cam()});
    await page.screenshot({path:path.join(out,'desktop-hover-noise.png'),scale:'css'});
   }
   if(spec.reduce){
    const target=geometry.projects.find(p=>p.key==='btb');await page.mouse.move(target.x,target.y);await page.waitForTimeout(300);
    const reduced=await samples();check('reduced motion keeps static seed zero',reduced.length>0&&reduced.every(x=>x.reduced&&x.seed===0),reduced.slice(-3));
   }
   if(!spec.reduce){
    await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=btb]').click();await settle('detail');
    await page.locator('#material-dots [data-material="3"]').click();await page.waitForFunction(()=>portfolioRuntime.materialIndex===3);await page.waitForTimeout(1800);await clear();
    await page.evaluate(()=>dispatchEvent(new Event('resize')));await page.waitForTimeout(250);
    const loaded=await samples();check('opened loaded material does not draw gated noise',loaded.length===0,{remainingCalls:loaded.length});
    await page.screenshot({path:path.join(out,spec.name+'-loaded-btb.png'),scale:'css'});
    await page.locator('#studio-back').click();await settle('work');check('Back restores Work camera',close(camera,await cam()),{before:camera,after:await cam()});
   }
  }catch(e){errors.push(String(e));await page.screenshot({path:path.join(out,spec.name+'-failure.png'),scale:'css'}).catch(()=>{});}
  check('no browser errors',errors.length===0,errors);results.push({name:spec.name,checks});await browser.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({origin,results},null,2));const checks=results.flatMap(r=>r.checks);console.log(JSON.stringify({checks:checks.length,failures:checks.filter(x=>!x.pass)}));if(checks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
