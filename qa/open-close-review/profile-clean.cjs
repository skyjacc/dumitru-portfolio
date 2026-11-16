const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out=__dirname;
const mode=process.argv[2]||'clean';
const profile=mode==='cpu';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(page,key){let last;for(let i=0;i<160;i++){const s=await page.evaluate(()=>{const r=window.portfolioRuntime;return r&&{ready:r.ready,moving:r.moving,key:r.focusedKey,c:r.camera}});if(s?.ready&&!s.moving&&(key===undefined||s.key===key)&&last&&JSON.stringify(s.c)===JSON.stringify(last.c))return;sleep;last=s;await page.waitForTimeout(100)}throw Error('Not settled '+key)}
function cpuSummary(p){const times=new Map;for(let i=0;i<p.samples.length;i++)times.set(p.samples[i],(times.get(p.samples[i])||0)+(p.timeDeltas[i]||0));return p.nodes.map(n=>({name:n.callFrame.functionName||'(anonymous)',url:n.callFrame.url,line:n.callFrame.lineNumber+1,column:n.callFrame.columnNumber+1,selfMs:(times.get(n.id)||0)/1000})).filter(n=>n.selfMs).sort((a,b)=>b.selfMs-a.selfMs).slice(0,30)}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const browserCdp=await browser.newBrowserCDPSession();const system=await browserCdp.send('SystemInfo.getInfo');const cdp=await page.context().newCDPSession(page);
 await page.addInitScript(()=>{
  let run=null;const pending=[];const observers=[];
  for(const type of ['longtask','long-animation-frame'])try{const obs=new PerformanceObserver(list=>{if(run)for(const e of list.getEntries())pending.push(e)});obs.observe({type,buffered:false});observers.push(obs)}catch{}
  function frame(t){if(run)run.frames.push(t);requestAnimationFrame(frame)}requestAnimationFrame(frame);
  document.addEventListener('click',e=>{if(run&&e.target.closest(run.selector)&&run.click===null)run.click=performance.now()},true);
  window.__startClean=selector=>{pending.length=0;run={selector,click:null,start:performance.now(),frames:[]}};
  window.__endClean=()=>{for(const obs of observers)pending.push(...obs.takeRecords());const r=run;run=null;const start=r.click??r.start,end=start+2000;const frames=r.frames.filter(t=>t>=start&&t<=end);const deltas=frames.slice(1).map((t,i)=>({at:frames[i]-start,dt:t-frames[i]}));return{clickStart:start,frames:frames.length,maxRafMs:Math.max(0,...deltas.map(x=>x.dt)),gaps50:deltas.filter(x=>x.dt>50),gaps100:deltas.filter(x=>x.dt>100),entries:pending.filter(e=>e.startTime>=start&&e.startTime<=end).map(e=>e.toJSON())}};
 });
 await page.goto('http://127.0.0.1:8943/');await ready(page);await page.waitForTimeout(1800);
 const results=[];
 async function measure(name,selector){
  const box=await page.locator(selector).boundingBox();if(!box)throw Error('No control '+selector);
  if(profile){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start')}
  await page.evaluate(selector=>__startClean(selector),selector);await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(2200);
  const result=await page.evaluate(()=>__endClean());
  if(profile){const {profile:p}=await cdp.send('Profiler.stop');fs.writeFileSync(path.join(out,`profile-clean-${name}.cpuprofile`),JSON.stringify(p));result.cpuTop=cpuSummary(p)}
  result.state=await page.evaluate(()=>{const s=portfolioRuntime;return{key:s.focusedKey,index:s.materialIndex,moving:s.moving}});results.push({name,...result});console.log(JSON.stringify({name,maxRafMs:result.maxRafMs,gaps100:result.gaps100,longtasks:result.entries.filter(x=>x.entryType==='longtask').map(x=>({start:x.startTime-result.clickStart,duration:x.duration})),cpuTop:result.cpuTop?.slice(0,8)}));
 }
 await measure('about-cold','#about-control');await ready(page,'despre');
 if(!profile){await page.locator('#return-control').click();await ready(page,null);await page.waitForTimeout(500);await measure('about-warm','#about-control');await ready(page,'despre')}
 await page.locator('#return-control').click();await ready(page,null);await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=andra]').click();await ready(page,'andra');await page.waitForTimeout(300);
 await measure('andra-material04','#material-dots [data-material="3"]');
 const report={mode,date:new Date().toISOString(),browser:browser.version(),gpu:system.gpu,results,errors};fs.writeFileSync(path.join(out,`profile-clean-${mode}.json`),JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
