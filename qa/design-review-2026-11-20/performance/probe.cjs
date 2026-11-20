// Read-only runtime review. Evidence stays outside the published site.
const fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const engine=process.argv[2]||'chromium',base=process.env.REVIEW_URL||'https://dumitru-spatial-portfolio.vercel.app/',out=__dirname;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...engine==='chromium'?{channel:'chrome'}:{}});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[],checks=[],states=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__videos=[];const create=document.createElement.bind(document);document.createElement=(name,...args)=>{const e=create(name,...args);if(name==='video')__videos.push(e);return e};
  window.__audit={started:performance.now(),handoff:null,longTasks:[]};window.addEventListener('portfolio:loaderhandoff',()=>__audit.handoff=performance.now());
  try{new PerformanceObserver(list=>__audit.longTasks.push(...list.getEntries().map(x=>({start:x.startTime,duration:x.duration})))).observe({type:'longtask',buffered:true})}catch{}
 });
 const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
 const snap=async name=>{const state=await page.evaluate(()=>({entry:portfolioEntry.mode,pending:portfolioEntry.pending,runtime:{key:portfolioRuntime.focusedKey,moving:portfolioRuntime.moving,index:portfolioRuntime.materialIndex},loader:portfolioLoader.getState(),companion:portfolioCompanion.getState(),home:portfolioCharacter.getState(),videos:__videos.map(v=>({src:v.src,paused:v.paused,time:v.currentTime,ready:v.readyState,frame:v.dataset.portfolioFrame})),audit:__audit,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize,encoded:r.encodedBodySize,duration:r.duration})),size:{w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}}));states.push({name,state});return state};
 const settled=async mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:30000});
 const save=()=>fs.writeFileSync(path.join(out,engine+'.json'),JSON.stringify({base,engine,checks,errors,states},null,2));
 try{
  await page.goto(base);await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete');await wait(1200);
  let s=await snap('cold-home');check('Home no MP4 or hidden project cover',!s.resources.some(r=>/\.mp4|assets\/projects\/[^/]+\/desktop.webp/.test(r.name)));check('SVG inactive on Home',!s.companion.active&&!s.companion.life.running);
  await page.reload();await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete');await wait(1000);s=await snap('warm-home');
  await page.click('#work-toggle');await settled('work');await wait(2500);s=await snap('work');check('Work scheduler active',s.companion.life.running&&s.companion.mode==='work');
  await page.evaluate(()=>portfolioEntry.open('andra'));await settled('detail');await page.click('#next-material');await page.waitForFunction(()=>portfolioRuntime.materialIndex===1);await page.waitForFunction(()=>__videos.find(v=>v.src.includes('hero-bouquet'))?.currentTime>0);await wait(700);s=await snap('video-playing');check('Selected video actually ready',s.videos.some(v=>v.frame==='ready'&&!v.paused));
  await page.screenshot({path:path.join(out,engine+'-video.png'),scale:'css'});
  // Explicit synthetic visibility probe, not a claim of iOS app backgrounding.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await wait(400);s=await snap('synthetic-hidden');check('Hidden video and SVG clocks paused',s.videos.every(v=>v.paused)&&!s.companion.frameScheduled&&!s.companion.life.frameScheduled&&!s.companion.life.timerScheduled);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await wait(1800);s=await snap('visibility-restored');states.push({name:'visibility-focus',state:await page.evaluate(()=>({hidden:document.hidden,visibility:document.visibilityState,focus:document.hasFocus()}))});check('Selected video resumes after visible',s.videos.some(v=>v.src.includes('hero-bouquet')&&!v.paused));check('SVG resumes after visible',s.companion.life.running);
  await page.mouse.move(190,420);await wait(300);await snap('pointer-after-visible');
  await page.emulateMedia({reducedMotion:'reduce'});await wait(500);s=await snap('reduced');check('Reduced motion pauses video and scene clocks',s.videos.every(v=>v.paused)&&!s.companion.frameScheduled&&!s.companion.life.frameScheduled);
  await page.emulateMedia({reducedMotion:'no-preference'});await wait(1000);
  await page.click('#about-control');await settled('about');await wait(600);s=await snap('about');check('About yields all Work media and SVG',s.videos.every(v=>v.paused)&&!s.companion.active&&!s.companion.life.running);
  await page.click('#process-control');await settled('process');await wait(500);s=await snap('process');check('Process has no resident work clock',!s.companion.life.running&&!s.companion.frameScheduled);
  await page.click('#work-toggle');await settled('work');await wait(1000);s=await snap('work-return');check('Work active after interrupted scenes',s.companion.life.running&&s.entry==='work');
  check('No page errors',errors.length===0,errors);check('No root overflow',states.filter(({state:s})=>s?.size).every(({state:s})=>s.size.sw<=s.size.w&&s.size.sh<=s.size.h));
  if(engine==='chromium'){
   const slow=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3}),sp=await slow.newPage(),cdp=await slow.newCDPSession(sp);
   await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});
   const begun=Date.now();await sp.goto(base,{waitUntil:'commit'});await sp.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:35000});
   const state=await sp.evaluate(()=>({loader:portfolioLoader.getState(),entry:portfolioEntry.mode,laptop:document.querySelector('.desk-laptop .desk-cutout')?.dataset.decoded,visible:getComputedStyle(document.querySelector('.desk-laptop img')).visibility}));states.push({name:'slow-home',elapsedMs:Date.now()-begun,state});await sp.screenshot({path:path.join(out,'slow-home.png'),scale:'css'});check('Slow network releases Home',state.entry==='home');await slow.close();
  }
 }catch(error){states.push({name:'harness-error',error:error.stack});check('Harness completed',false,error.message)}
 finally{save();console.log(JSON.stringify({engine,passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass),errors}));await browser.close()}
})();
