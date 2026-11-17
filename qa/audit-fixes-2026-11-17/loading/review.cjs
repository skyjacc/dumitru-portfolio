const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const mode=process.argv[2]||'mobile',engine=process.argv[3]||'chromium',out=process.env.AUDIT_OUT?path.resolve(process.env.AUDIT_OUT):__dirname,base=process.env.AUDIT_URL||'http://127.0.0.1:8943/';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
 const context=await browser.newContext({viewport:mode==='desktop'?{width:1440,height:900}:{width:390,height:844},deviceScaleFactor:3,isMobile:mode!=='desktop',hasTouch:mode!=='desktop'}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.addInitScript(()=>{window.__videos=[];const create=document.createElement.bind(document);document.createElement=(name,...args)=>{const e=create(name,...args);if(name==='video')window.__videos.push(e);return e};});
 if(mode==='empty-video')await page.addInitScript(()=>{window.__videoProbeReads=0;const draw=CanvasRenderingContext2D.prototype.drawImage,read=CanvasRenderingContext2D.prototype.getImageData;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLVideoElement){if(this.canvas.width===2&&this.canvas.height===2)this.canvas.__emptyProbe=true;return}return draw.call(this,image,...args)};CanvasRenderingContext2D.prototype.getImageData=function(...args){if(this.canvas.__emptyProbe)window.__videoProbeReads++;return read.apply(this,args)}});
 const report={mode,engine,errors,states:[]};
 const save=()=>fs.writeFileSync(path.join(out,`${mode}-${engine}.json`),JSON.stringify(report,null,2));
 const snap=async name=>{const state=await page.evaluate(()=>({entry:window.portfolioEntry?.mode,loader:window.portfolioLoader?.getState(),recovery:window.__portfolioEntryRecovery?.active,guard:!!window.__portfolioLoaderKeyGuard,native:{ready:window.portfolioRuntime?.ready,key:window.portfolioRuntime?.focusedKey,index:window.portfolioRuntime?.materialIndex},videos:window.__videos.map(v=>({src:v.src,paused:v.paused,time:v.currentTime,preload:v.preload,ready:v.readyState})),resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize,encoded:r.encodedBodySize,type:r.initiatorType})),laptop:{src:document.querySelector('.desk-laptop img')?.currentSrc,ready:document.querySelector('.desk-laptop .desk-cutout')?.dataset.decoded,failed:document.querySelector('.desk-laptop .desk-cutout')?.dataset.failed},text:document.body.innerText.slice(0,1000)}));report.states.push({name,state});save();return state};
 const shot=async name=>page.screenshot({path:path.join(out,`${mode}-${engine}-${name}.png`),scale:'css'});
 try{
  if(mode==='fail-entry')await page.route('**/entry-flow.js',r=>r.abort());
  if(mode==='stalled-entry')await page.route('**/entry-flow.js',()=>{});
  let held=[];
  if(mode==='held-laptop')await page.route('**/hero/desk/v2/responsive/laptop-*.webp',r=>r.request().url().endsWith('laptop-preview.webp')?r.continue():held.push(r));
  if(mode==='slow-mobile'){const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});}
  await page.goto(base,{waitUntil:'commit'});
  if(/entry$/.test(mode)){
   await page.waitForSelector('#entry-recovery',{timeout:23000});const state=await snap('recovered');assert.equal(state.guard,false);assert.equal(await page.locator('#entry-recovery nav a').count(),5);assert.equal(await page.locator('#entry-recovery a[href^="mailto:"]').count(),1);
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('href')),'mailto:andrusciac.dumitru@gmail.com');await shot('recovered');
   if(mode==='fail-entry'){await page.unroute('**/entry-flow.js');await page.getByRole('button',{name:'Try again'}).click();await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',{},{timeout:25000});assert.equal(await page.locator('#entry-recovery').count(),0);await snap('retry-success');}
  }else{
   await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',{},{timeout:35000});await page.waitForTimeout(1300);let state=await snap('home');await shot('home');
   if(mode==='held-laptop'){assert.equal(state.laptop.ready,'pending');assert.equal(await page.locator('.desk-laptop .desk-cutout>img').evaluate(e=>getComputedStyle(e).visibility),'hidden');for(const route of held)await route.continue();await page.waitForFunction(()=>document.querySelector('.desk-laptop .desk-cutout').dataset.decoded==='true');await snap('late-decode');await shot('late-decode');}
   else{
    assert.equal(state.recovery,false);assert.equal(state.laptop.ready,'true');assert.equal(state.resources.filter(r=>/\/assets\/projects\/[^/]+\/desktop.webp/.test(r.name)).length,0);
    await page.click('#work-toggle');await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);await page.waitForTimeout(1500);await snap('work');await shot('work');
    await page.evaluate(()=>portfolioEntry.open('andra'));await page.waitForFunction(()=>portfolioRuntime.focusedKey==='andra'&&!portfolioRuntime.moving);await page.waitForTimeout(1500);state=await snap('andra-first');await shot('andra-first');
    if(mode!=='desktop'){assert.equal(requests.filter(url=>url.includes('.mp4')).length,0);assert(state.videos.every(v=>v.paused));}
    await page.click('#next-material');await page.waitForFunction(()=>portfolioRuntime.materialIndex===1);await page.waitForTimeout(4500);
    if(mode==='slow-mobile'){await snap('selected-buffering');await shot('selected-buffering');await page.waitForFunction(()=>window.__videos.find(v=>v.src.includes('hero-bouquet')).currentTime>0,{},{timeout:60000});}
    state=await snap('selected-video');await shot('selected-video');assert(state.videos.find(v=>v.src.includes('hero-bouquet')).time>0);if(mode!=='desktop')assert.equal(state.videos.find(v=>v.src.includes('bloom.mp4')).preload,'none');
    report.videoFrame=await page.evaluate(()=>{const v=__videos.find(v=>v.src.includes('hero-bouquet')),c=document.createElement('canvas');c.width=16;c.height=9;const ctx=c.getContext('2d');ctx.drawImage(v,0,0,16,9);const pixels=ctx.getImageData(0,0,16,9).data,colors=new Set;let opaque=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3])opaque++;colors.add(pixels[i]+','+pixels[i+1]+','+pixels[i+2])}const host=document.getElementById('portfolio-media-host');return {opaque,colors:colors.size,state:v.dataset.portfolioFrame,reads:window.__videoProbeReads,hostHidden:host?.inert&&host.getAttribute('aria-hidden')==='true',hostWidth:host?.getBoundingClientRect().width,videoWidth:v.getBoundingClientRect().width,natural:v.videoWidth}});
    assert.equal(report.videoFrame.hostHidden,true);assert.equal(report.videoFrame.hostWidth,2);assert.equal(report.videoFrame.videoWidth,report.videoFrame.natural);
    report.viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,rootWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,rootHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight}));assert(Math.max(report.viewport.rootWidth,report.viewport.bodyWidth)<=report.viewport.width);assert(Math.max(report.viewport.rootHeight,report.viewport.bodyHeight)<=report.viewport.height);
    if(mode==='empty-video'){assert.equal(report.videoFrame.state,'poster');assert(report.videoFrame.reads<=8);assert.equal(report.videoFrame.opaque,0)}else{assert.equal(report.videoFrame.state,'ready');assert(report.videoFrame.opaque>0);assert(report.videoFrame.colors>16)}
    await page.click('#about-control');await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);await page.waitForTimeout(1500);state=await snap('about');assert(state.videos.every(v=>v.paused));
    await page.emulateMedia({reducedMotion:'reduce'});await page.click('#work-toggle');await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);await page.evaluate(()=>portfolioEntry.open('andra'));await page.waitForFunction(()=>portfolioRuntime.focusedKey==='andra'&&!portfolioRuntime.moving);await page.waitForTimeout(500);state=await snap('reduced');assert(state.videos.every(v=>v.paused));
   }
  }
  report.passed=true;
 }catch(error){report.failure=error.stack;throw error}finally{save();console.log(JSON.stringify({mode,engine,passed:report.passed,errors,failure:report.failure}));await browser.close()}
})();
