const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const base='http://127.0.0.1:8943',out=__dirname;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function snapshot(page){return page.evaluate(()=>({
 time:performance.now(),url:location.href,mode:document.body.dataset.entry,
 loader:window.portfolioLoader?.getState(),loaderPresent:!!document.getElementById('studio-loader'),
 continueVisible:!!document.querySelector('#loader-continue:not([hidden])'),
 runtime:window.portfolioRuntime&&{ready:portfolioRuntime.ready,key:portfolioRuntime.focusedKey,moving:portfolioRuntime.moving,materialIndex:portfolioRuntime.materialIndex},
 surface:window.portfolioSurfaces?.getState('process'),
 home:{inert:document.getElementById('studio-home')?.inert,display:getComputedStyle(document.getElementById('studio-home')).display,reveal:document.getElementById('studio-home')?.dataset.paperReveal},
 images:[...document.querySelectorAll('.desk-cutout>img')].map(img=>({name:img.closest('[data-desk-object]').dataset.deskObject,src:img.currentSrc,complete:img.complete,width:img.naturalWidth,hidden:img.hidden,failed:img.parentElement.dataset.failed,fold:getComputedStyle(img.parentElement).getPropertyValue('--paper-image')}))
}));}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const reports=[];
 for(const scenario of ['laptop-timeout','laptop-continue','notebook-abort','direct-process']){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[],failedRequests=[],intercepted=[],responses=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>failedRequests.push({url:request.url(),failure:request.failure()}));
  page.on('response',response=>{if(response.url().includes('/assets/process/'))responses.push({url:response.url(),status:response.status()})});
  if(scenario.startsWith('laptop'))await page.route('**/hero/desk/v2/**',async route=>{
   if(/\/(?:responsive\/)?laptop(?:-\d+)?\.webp(?:\?|$)/.test(route.request().url())){
    intercepted.push({url:route.request().url(),at:Date.now()});await sleep(scenario==='laptop-continue'?16000:14000);
   }
   await route.continue().catch(()=>{});
  });
  if(scenario==='notebook-abort')await page.route('**/hero/desk/v2/**',async route=>{
   if(/\/(?:responsive\/)?notebook(?:-\d+)?\.webp(?:\?|$)/.test(route.request().url())){intercepted.push({url:route.request().url(),at:Date.now()});return route.abort('failed')}
   await route.continue();
  });
  const report={scenario,errors,failedRequests,intercepted,responses,states:{}};
  try{
   await page.goto(base+(scenario==='direct-process'?'/work/process':'/')+'?failure-audit='+scenario,{waitUntil:'domcontentloaded',timeout:30000});
   if(scenario.startsWith('laptop')){
    await page.waitForFunction(()=>window.portfolioLoader?.getState().elapsed>=7300,null,{timeout:16000});
    report.states.beforeTimeout=await snapshot(page);
    await page.screenshot({path:path.join(out,scenario+'-continue.png')});
    if(scenario==='laptop-continue')await page.locator('#loader-continue').click();
    await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:18000});
    report.states.afterLoader=await snapshot(page);
    await page.screenshot({path:path.join(out,scenario+'-home-pending.png')});
    await page.waitForFunction(()=>document.querySelector('.desk-laptop img')?.naturalWidth>0,null,{timeout:20000});
    await page.waitForTimeout(1200);report.states.recovered=await snapshot(page);
    await page.screenshot({path:path.join(out,scenario+'-recovered.png')});
   }else{
    await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:18000});
    await page.waitForTimeout(1200);report.states.ready=await snapshot(page);
    await page.screenshot({path:path.join(out,scenario+'-ready.png')});
    if(scenario==='notebook-abort'){
     await page.locator('.desk-notebook').click();
     await page.waitForFunction(()=>window.portfolioRuntime?.focusedKey==='process'&&!window.portfolioRuntime.moving,null,{timeout:12000});
     report.states.processOpened=await snapshot(page);
    }else{
     await page.waitForFunction(()=>window.portfolioRuntime?.focusedKey==='process'&&!window.portfolioRuntime.moving&&window.portfolioSurfaces?.getState('process')?.loading===false,null,{timeout:12000});
     report.states.processSettled=await snapshot(page);
     await page.screenshot({path:path.join(out,scenario+'-settled.png')});
     await page.locator('#home-control').click();
     await page.waitForFunction(()=>window.portfolioEntry?.mode==='home'&&!window.portfolioRuntime?.moving,null,{timeout:12000});
     await page.waitForTimeout(1400);report.states.returnedHome=await snapshot(page);
     await page.screenshot({path:path.join(out,scenario+'-home.png')});
    }
   }
  }catch(error){report.testError=error.stack}
  fs.writeFileSync(path.join(out,scenario+'.json'),JSON.stringify(report,null,2));reports.push(report);
  console.log(JSON.stringify({scenario,states:Object.fromEntries(Object.entries(report.states).map(([name,s])=>[name,{time:s.time,mode:s.mode,phase:s.loader?.phase,finishReason:s.loader?.finishReason,loadingFailed:s.loader?.loadingFailed,nativeKey:s.runtime?.key,images:s.images.filter(i=>!i.width||i.hidden)}])),errors,testError:report.testError}));
  await context.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
