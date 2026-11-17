const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=__dirname;
const url=process.env.AUDIT_URL||'https://dumitru-spatial-portfolio.vercel.app/';
const mode=process.argv[2]||'public-mobile';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function init(){
 const a=window.__audit={raf:{},marks:[],longtasks:[],lcp:[],visibility:[]};const ids=new WeakMap();let uid=0;const raf=requestAnimationFrame;
 window.requestAnimationFrame=function(cb){let id=ids.get(cb);if(!id){id=++uid;ids.set(cb,id);a.raf[id]={name:cb.name,source:new Error().stack.split('\n').slice(2,4).join(' '),count:0,ms:0};}return raf.call(window,t=>{let s=performance.now();a.raf[id].count++;try{return cb(t)}finally{a.raf[id].ms+=performance.now()-s}})};
 ['longtask','largest-contentful-paint'].forEach(type=>{try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(type==='longtask')a.longtasks.push({start:e.startTime,ms:e.duration});else a.lcp.push({start:e.startTime,size:e.size,url:e.url,tag:e.element?.tagName,id:e.element?.id});}).observe({type,buffered:true})}catch{}});
 document.addEventListener('visibilitychange',()=>a.visibility.push({t:performance.now(),hidden:document.hidden}));
 addEventListener('portfolio:loaderhandoff',()=>a.marks.push({name:'loaderhandoff',t:performance.now()}));
 addEventListener('portfolio:entrystate',e=>a.marks.push({name:'entry:'+e.detail.mode,t:performance.now()}));
}
async function snapshot(page){return page.evaluate(()=>({t:performance.now(),entry:window.portfolioEntry?.mode,loader:window.portfolioLoader?.getState(),native:window.portfolioRuntime?{ready:portfolioRuntime.ready,moving:portfolioRuntime.moving,camera:portfolioRuntime.camera}:null,companion:window.portfolioCompanion?.getState(),original:window.portfolioCharacter?.getState(),raf:window.__audit?.raf,marks:window.__audit?.marks,longtasks:window.__audit?.longtasks,lcp:window.__audit?.lcp,paint:performance.getEntriesByType('paint').map(x=>x.toJSON()),nav:performance.getEntriesByType('navigation').map(x=>x.toJSON()),resources:performance.getEntriesByType('resource').map(x=>({name:x.name,initiator:x.initiatorType,start:x.startTime,end:x.responseEnd,duration:x.duration,transfer:x.transferSize,encoded:x.encodedBodySize,decoded:x.decodedBodySize})),videos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,paused:v.paused,currentTime:v.currentTime,readyState:v.readyState,networkState:v.networkState,preload:v.preload})),images:[...document.images].map(i=>({src:i.currentSrc||i.src,natural:i.naturalWidth,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,complete:i.complete,loading:i.loading,priority:i.fetchPriority,hidden:i.hidden})),text:document.body.innerText.slice(0,1500),visibility:window.__audit?.visibility,hidden:document.hidden}));}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const mobile=/mobile|slow/.test(mode);const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile,javaScriptEnabled:mode!=='nojs',reducedMotion:mode==='reduced'?'reduce':'no-preference'});const page=await context.newPage(),errors=[],failures=[],responses=[],net=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>responses.push({url:r.url(),status:r.status(),headers:r.headers()}));
 if(mode!=='nojs')await page.addInitScript(init);
 if(mode==='nowebgl')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args)}});
 if(mode==='fail-native')await page.route('**/_next/static/chunks/portfolio-entry.js',r=>r.abort('failed'));
 if(mode==='fail-entry')await page.route('**/entry-flow.js',r=>r.abort('failed'));
 if(mode==='fail-laptop')await page.route('**/hero/desk/**/laptop*.webp',r=>r.abort('failed'));
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');cdp.on('Network.loadingFinished',e=>net.push({id:e.requestId,t:e.timestamp,bytes:e.encodedDataLength}));await cdp.send('Performance.enable');
 if(mode==='slow-mobile')await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});
 const report={mode,url,browser:browser.version(),mobile,errors,failures,responses,net,samples:[]};
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  if(mode!=='nojs')await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:20000}).catch(e=>report.readyTimeout=e.message);
  await page.waitForTimeout(1800);report.samples.push({label:'initial',state:await snapshot(page)});await page.screenshot({path:path.join(out,mode+'-initial.png'),scale:'css'});
  if(mode==='public-mobile'){await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:20000});await page.waitForTimeout(1800);report.samples.push({label:'reload',state:await snapshot(page)});}
  if(mode==='lifecycle'||mode==='reduced'){
   const settle=()=>page.waitForFunction(()=>!portfolioEntry.pending&&!portfolioRuntime?.moving,null,{timeout:15000});
   const record=async label=>{await settle();await page.waitForTimeout(1800);const before=await snapshot(page),m1=await cdp.send('Performance.getMetrics');await page.waitForTimeout(5000);const after=await snapshot(page),m2=await cdp.send('Performance.getMetrics');report.samples.push({label,before,after,m1,m2});console.log(label,after.entry);};
   await record('home');await page.click('#work-toggle');await record('work');await page.evaluate(()=>portfolioEntry.open('andra'));await record('detail');await page.click('#about-control');await record('about');await page.click('#process-control');await record('process');await page.click('#work-toggle');await record('work-return');
   await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await sleep(5500);await cdp.send('Page.setWebLifecycleState',{state:'active'});report.samples.push({label:'frozen-restored',state:await snapshot(page)});
  }
 }catch(e){report.fatal=e.stack}finally{fs.writeFileSync(path.join(out,mode+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({mode,errors,failures:failures.length,samples:report.samples.map(x=>({label:x.label,t:x.state?.t,bytes:x.state?.resources?.reduce((n,r)=>n+r.transfer,0),entry:x.state?.entry,loader:x.state?.loader?.phase,marks:x.state?.marks})),fatal:report.fatal}));await browser.close();}
})();
