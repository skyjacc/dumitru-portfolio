const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const tag=process.argv[2]||'baseline';
const selected=process.argv[3];
const out=__dirname;
const scenarios=[{name:'desktop',width:1440,height:900,dpr:1,route:'/'},{name:'phone-4mbps',width:390,height:844,dpr:2,route:'/',throttle:true},{name:'direct-process-4mbps',width:390,height:844,dpr:2,route:'/work/process',throttle:true}].filter(s=>!selected||s.name===selected);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const reports=[];
 for(const s of scenarios){
  const c=await browser.newContext({viewport:{width:s.width,height:s.height},deviceScaleFactor:s.dpr,isMobile:s.width<500,hasTouch:s.width<500});
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const session=await c.newCDPSession(p);await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});
  if(s.throttle){await session.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:500000,uploadThroughput:125000,connectionType:'cellular4g'});await session.send('Emulation.setCPUThrottlingRate',{rate:4});}
  await p.addInitScript(()=>{
   window.__audit={events:[],longFrames:[],longTasks:[],lcp:[],cls:0};
   for(const type of ['long-animation-frame','longtask','largest-contentful-paint','layout-shift']){
    if(!PerformanceObserver.supportedEntryTypes.includes(type))continue;
    new PerformanceObserver(list=>{for(const e of list.getEntries()){
     if(type==='long-animation-frame')__audit.longFrames.push({start:e.startTime,duration:e.duration,blocking:e.blockingDuration,scripts:e.scripts?.map(s=>({url:s.sourceURL,duration:s.duration,forced:s.forcedStyleAndLayoutDuration}))});
     if(type==='longtask')__audit.longTasks.push({start:e.startTime,duration:e.duration});
     if(type==='largest-contentful-paint')__audit.lcp.push({time:e.startTime,url:e.url,size:e.size});
     if(type==='layout-shift'&&!e.hadRecentInput)__audit.cls+=e.value;
    }}).observe({type,buffered:true});
   }
   for(const name of ['portfolio:entrystate','portfolio:deskready'])addEventListener(name,e=>__audit.events.push({name,time:performance.now(),detail:e.detail}));
   addEventListener('DOMContentLoaded',()=>__audit.domReady=performance.now());
  });
  const start=Date.now();await p.goto('http://127.0.0.1:8943'+s.route+'?audit='+tag,{waitUntil:'commit',timeout:30000});
  let atReady=null;try{await p.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:35000});atReady=await p.evaluate(()=>({time:performance.now(),loader:portfolioLoader.getState(),images:[...document.querySelectorAll('.desk-cutout>img')].map(i=>({src:i.currentSrc,complete:i.complete,width:i.naturalWidth}))}));}catch(e){errors.push('Loader did not finish within35s');}
  await p.waitForTimeout(s.throttle?2500:1500);
  const data=await p.evaluate(()=>({audit:__audit,loader:window.portfolioLoader?.getState(),mode:document.body.dataset.entry,native:window.portfolioRuntime?.focusedKey,resources:performance.getEntriesByType('resource').map(r=>({url:r.name.split(location.origin)[1]||r.name,bytes:r.encodedBodySize,duration:r.duration,start:r.startTime,type:r.initiatorType})),pendingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc)}));
  const report={scenario:s,elapsedMs:Date.now()-start,atReady,errors,...data};reports.push(report);
  fs.writeFileSync(path.join(out,tag+'-'+s.name+'.json'),JSON.stringify(report,null,2));
  await p.screenshot({path:path.join(out,tag+'-'+s.name+'.png')});
  console.log(JSON.stringify({scenario:s.name,readyMs:atReady?.time,mode:data.mode,bytes:data.resources.reduce((n,r)=>n+r.bytes,0),homeBytes:data.resources.filter(r=>r.url.includes('/hero/desk/')).reduce((n,r)=>n+r.bytes,0),readyImages:atReady?.images.filter(i=>i.complete&&i.width>0).length,longTasks:data.audit.longTasks.length,longFrames:data.audit.longFrames.length,cls:data.audit.cls,errors}));
  await c.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,tag+'.json'),JSON.stringify(reports,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
