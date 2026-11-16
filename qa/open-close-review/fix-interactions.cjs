const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const {freeze,instrumentation,settle,pointer,equalCamera,drag}=require('./helpers.cjs');
(async()=>{
 const files=freeze(),browser=await chromium.launch({channel:'chrome',headless:true}),report={errors:[],tap:[],drag:null,history:null};
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:900},hasTouch:width===390,isMobile:width===390});
  page.on('pageerror',error=>report.errors.push(error.message));await instrumentation(page,files);
  await page.goto('http://127.0.0.1:8943/');await page.waitForFunction(()=>window.portfolioRuntime?.ready);await page.waitForTimeout(2400);
  const nav=detail=>page.evaluate(detail=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail})),detail);
  await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=andra]').click();await settle(page,'andra');
  const original=await page.evaluate(()=>portfolioRuntime.returnCamera);
  await page.locator('#return-control').click();await page.waitForTimeout(130);
  const point=await page.evaluate(()=>__qaProjectCenters().find(p=>p.key==='andra'));
  await pointer(page,width,Math.max(20,Math.min(width-20,point.x)),Math.max(100,Math.min(page.viewportSize().height-100,point.y)));
  const reopened=await settle(page,'andra');await page.locator('#return-control').click();const returned=await settle(page,null);
  report.tap.push({width,original,reopenedSnapshot:reopened.returnCamera,preservedSnapshot:equalCamera(original,reopened.returnCamera),returnedOriginal:equalCamera(original,returned.camera)});
  if(width===390){
   await nav({key:'andra'});await settle(page,'andra');const saved=await page.evaluate(()=>portfolioRuntime.returnCamera);
   await page.locator('#return-control').click();await page.waitForTimeout(130);const start=await page.evaluate(()=>performance.now());
   await drag(page,{x:190,y:550},{x:190,y:300},true);await settle(page,undefined);
   report.drag=await page.evaluate(({start,saved})=>{const samples=__motionAudit.filter(f=>f.t>=start),s=portfolioRuntime;return{savedBefore:saved,observedCleared:samples.some(f=>f.saved===null),keyAfter:s.focusedKey,savedAfter:s.returnCamera,camera:s.camera}}, {start,saved});
   if((await page.evaluate(()=>portfolioRuntime.focusedKey))!==null){await nav({action:'return'});await settle(page,null)}
  }
  if(width===1440){
   await nav({key:'andra'});await settle(page,'andra');
   await page.evaluate(()=>{dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'return'}}));dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key:'btb'}}))});
   const raced=await settle(page,'btb'),pathAfter=await page.evaluate(()=>location.pathname);
   await page.goBack();const back=await settle(page,null),backPath=await page.evaluate(()=>location.pathname);
   await page.goForward();const forward=await settle(page,'btb'),forwardPath=await page.evaluate(()=>location.pathname);
   report.history={race:{key:raced.focusedKey,path:pathAfter},back:{key:back.focusedKey,path:backPath},forward:{key:forward.focusedKey,path:forwardPath}};
  }
  await page.close();
 }
 fs.writeFileSync(path.join(__dirname,'fix-interactions.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
 if(report.errors.length||report.tap.some(x=>!x.preservedSnapshot||!x.returnedOriginal)||!report.drag?.observedCleared||report.history.race.path!=='/work/btb'||report.history.back.path!=='/'||report.history.forward.path!=='/work/btb')process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
