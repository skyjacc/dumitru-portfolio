const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {freeze,site,settle,equalCamera}=require('../open-close-review/helpers.cjs');
const origin='http://127.0.0.1:8943',out=__dirname,files=freeze();
const videoPath='/hero/paper-cut-loader.mp4',posterPath='/hero/paper-cut-loader.webp',homePath='/hero/paper-laptop.webp';
for(const url of [videoPath,posterPath,homePath]){const file=path.join(site,url);if(fs.existsSync(file))files.set(file,fs.readFileSync(file))}
const scenarios=[
 {name:'normal-desktop',capture:true,smoke:true},
 {name:'normal-phone',mobile:true,capture:true,smoke:true},
 {name:'reduced-desktop',reduced:true,capture:true},
 {name:'reduced-phone',mobile:true,reduced:true,capture:true},
 {name:'video-404',video404:true,capture:true},
 {name:'autoplay-rejected',autoplayRejected:true},
 {name:'canplay-stalled',canplayStalled:true,capture:true},
 {name:'poster-404',poster404:true},
 {name:'video-and-poster-404',video404:true,poster404:true},
 {name:'home-image-delayed',homeDelay:6500,capture:true},
 {name:'home-image-404',home404:true},
 {name:'native-readiness-never',nativeNever:true,capture:true},
 {name:'skip-at-one-second',nativeNever:true,homeDelay:15000,skip:true,capture:true},
 {name:'keyboard-before-loader-exit',homeDelay:6500,skip:true,prebootKeys:true,capture:true},
 {name:'direct-work-desktop',route:'/work/btb',capture:true,smoke:true},
 {name:'direct-work-phone',route:'/work/btb',mobile:true,smoke:true},
];
const selectedArg=process.argv.indexOf('--case'),selectedNames=selectedArg>=0?process.argv[selectedArg+1].split(','):null,selected=selectedNames?scenarios.filter(s=>selectedNames.includes(s.name)):scenarios;
const outputArg=process.argv.indexOf('--output'),reportPath=path.resolve(out,outputArg>=0?process.argv[outputArg+1]:'report.json');
const report={startedAt:new Date().toISOString(),origin,sourceHashes:{},checks:[],errors:[],notes:['Local-only browser response overrides; no deployment or runtime file edits.','Source and loader media buffers are frozen at test start.','Phone gestures use Chrome DevTools Protocol in a touch-enabled mobile viewport.']};
for(const name of ['index.html','entry-flow.js','entry-flow.css','portfolio-ui.js','_next/static/chunks/0n9xfy8bxft48.js',videoPath.slice(1),posterPath.slice(1)]){const body=files.get(path.join(site,name));if(body)report.sourceHashes[name]=crypto.createHash('sha256').update(body).digest('hex')}
const save=()=>fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
async function install(page,c,record){
 await page.addInitScript(({reject})=>{
  window.__loaderQA={frames:[],events:[],playCalls:0,pauseCalls:0,started:performance.now()};
  const target=el=>el instanceof HTMLVideoElement&&!!el.closest('#studio-loader');
  const realPlay=HTMLMediaElement.prototype.play,realPause=HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.play=function(){if(target(this)){__loaderQA.playCalls++;if(reject)return Promise.reject(new DOMException('QA autoplay rejection','NotAllowedError'))}return realPlay.apply(this,arguments)};
  HTMLMediaElement.prototype.pause=function(){if(target(this))__loaderQA.pauseCalls++;return realPause.apply(this,arguments)};
  for(const type of ['loadstart','loadedmetadata','loadeddata','canplay','play','playing','pause','stalled','ended','error'])document.addEventListener(type,event=>{if(target(event.target))__loaderQA.events.push({type,t:performance.now(),time:event.target.currentTime,duration:Number.isFinite(event.target.duration)?event.target.duration:null,error:event.target.error?.code||null})},true);
  for(const type of ['portfolio:entrystate','portfolio:navigate','portfolio:nativehome'])addEventListener(type,event=>__loaderQA.events.push({type,t:performance.now(),detail:event.detail}));
  let last=0;function frame(t){if(t-last>35){last=t;const api=window.portfolioLoader,loader=document.getElementById('studio-loader'),video=loader?.querySelector('video'),poster=loader?.querySelector('img'),button=document.getElementById('loader-continue'),s=api?.getState?.();
   if(s&&loader&&!__loaderQA.markup){const rect=loader.querySelector('.loader-film')?.getBoundingClientRect();__loaderQA.markup={legacyDrawing:!!loader.querySelector('.loader-drawing'),visibleCounter:!!loader.querySelector('[data-loader-value]'),film:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,viewport:{width:innerWidth,height:innerHeight}}}
   if(s)__loaderQA.frames.push({t,state:s,entryMode:window.portfolioEntry?.mode,entryReady:window.portfolioEntry?.ready,loaderPresent:!!loader,loaderHidden:!loader||loader.getAttribute('aria-hidden')==='true'||loader.inert,buttonVisible:!!button&&!button.hidden&&getComputedStyle(button).display!=='none',progress:loader?.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')??null,video:video?{src:video.getAttribute('src')||video.querySelector('source')?.getAttribute('src')||'',currentSrc:video.currentSrc,poster:video.getAttribute('poster'),muted:video.muted,defaultMuted:video.defaultMuted,playsInline:video.playsInline,autoplay:video.autoplay,loop:video.loop,paused:video.paused,currentTime:video.currentTime,duration:Number.isFinite(video.duration)?video.duration:null,readyState:video.readyState}:null,poster:poster?{src:poster.getAttribute('src'),complete:poster.complete,naturalWidth:poster.naturalWidth}:null})}
   requestAnimationFrame(frame)}requestAnimationFrame(frame);
 },{reject:!!c.autoplayRejected});
 page.on('pageerror',error=>record.errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)record.httpFailures.push({url:response.url(),status:response.status()})});
 await page.route(origin+'/**',async route=>{
  const url=new URL(route.request().url()),pathname=decodeURIComponent(url.pathname),file=path.join(site,pathname==='/'||/^\/work\/[^/.]+\/?$/.test(pathname)?'index.html':pathname);let body=files.get(file);
  if((c.video404&&pathname===videoPath)||(c.poster404&&pathname===posterPath)||(c.home404&&pathname===homePath))return route.fulfill({status:404,contentType:'text/plain',body:'Intentional loader QA 404'});
  if(c.canplayStalled&&pathname===videoPath){record.stalledVideoRequested=true;return}
  if(c.homeDelay&&pathname===homePath){record.homeRequestAt=Date.now();await new Promise(resolve=>setTimeout(resolve,c.homeDelay));if(page.isClosed())return;record.homeReleasedAt=Date.now()}
  if(c.nativeNever&&path.basename(file)==='0n9xfy8bxft48.js'){
   body=body.toString();const anchor="Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:snapshot});";
   if(!body.includes(anchor))throw Error('Native readiness QA anchor missing');
   body=body.replace(anchor,"Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:()=>({...snapshot(),ready:false})});");
  }
  try{if(body)return await route.fulfill({body,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4'})[path.extname(file)]});return await route.continue()}catch(error){if(!page.isClosed())throw error}
 });
}
async function phoneDrag(page){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:210,y:490}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:210-i*7,y:490-i*2}]});await page.waitForTimeout(22)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach()}
async function smoke(page,c){
 if(c.route){await page.waitForFunction(()=>window.portfolioEntry?.mode==='detail'&&window.portfolioRuntime?.focusedKey==='btb');await page.locator('#return-control').click()}else await page.locator('#enter-work').click();
 await page.waitForFunction(()=>window.portfolioEntry?.mode==='work'&&window.portfolioRuntime?.focusedKey===null);await settle(page,null);
 const before=await page.evaluate(()=>({...portfolioRuntime.camera}));
 if(c.mobile)await phoneDrag(page);else{await page.mouse.move(634,444);for(let i=0;i<12;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(70)}}
 await page.waitForTimeout(700);await settle(page,null);
 return page.evaluate(before=>({mode:portfolioEntry.mode,key:portfolioRuntime.focusedKey,overview:portfolioRuntime.workOverviewActive,before,after:{...portfolioRuntime.camera}}),before);
}
function assert(record,name,passed,detail){record.assertions.push({name,passed,...(detail===undefined?{}:{detail})})}
async function run(browser,c){
 const viewport=c.mobile?{width:390,height:844}:{width:1440,height:900},page=await browser.newPage({viewport,hasTouch:!!c.mobile,isMobile:!!c.mobile,reducedMotion:c.reduced?'reduce':'no-preference'});
 const record={name:c.name,scenario:c,viewport,assertions:[],errors:[],httpFailures:[]};
 try{
  await install(page,c,record);await page.goto(origin+(c.route||'/'),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof window.portfolioLoader?.getState==='function',{},{timeout:5000});
  record.firstState=await page.evaluate(()=>{const film=document.querySelector('#studio-loader .loader-film'),rect=film?.getBoundingClientRect();return{t:performance.now(),state:portfolioLoader.getState(),frozen:Object.isFrozen(portfolioLoader),markup:{legacyDrawing:!!document.querySelector('#studio-loader .loader-drawing'),visibleCounter:!!document.querySelector('#studio-loader [data-loader-value]'),film:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,viewport:{width:innerWidth,height:innerHeight}}}});
  if(c.prebootKeys){await settle(page);record.prebootCamera=await page.evaluate(()=>({...portfolioRuntime.camera}));for(const key of ['Home','Enter','Space']){await page.keyboard.press(key);await page.waitForTimeout(80)}await page.mouse.move(viewport.width/2,viewport.height/2);for(let i=0;i<12;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(70)}await page.waitForTimeout(300);record.prebootKeys=await page.evaluate(()=>({state:portfolioLoader.getState(),entryReady:portfolioEntry.ready,entryMode:portfolioEntry.mode,overview:window.portfolioRuntime?.workOverviewActive,key:window.portfolioRuntime?.focusedKey,camera:{...portfolioRuntime.camera},background:['studio-home','portfolio-root','portfolio-ui'].map(id=>({id,present:!!document.getElementById(id),inert:!!document.getElementById(id)?.inert})),navigation:__loaderQA.events.filter(e=>e.type==='portfolio:navigate')}));if(c.capture)await page.screenshot({path:path.join(out,c.name+'-before-skip.png')})}
  if(c.skip){
   await page.locator('#loader-continue').waitFor({state:'visible',timeout:2000});record.skipButtonAt=await page.evaluate(()=>performance.now());await page.locator('#loader-continue').click();record.skipClickedAt=await page.evaluate(()=>performance.now());
   await page.waitForFunction(()=>window.portfolioEntry?.ready&&(!document.getElementById('studio-loader')||document.getElementById('studio-loader').inert),{},{timeout:350});record.skipExitedAt=await page.evaluate(()=>performance.now());
  }else if(c.capture){await page.waitForTimeout(c.reduced?40:650);await page.screenshot({path:path.join(out,c.name+'-intro.png')})}
  if(c.homeDelay&&!c.skip){await page.waitForTimeout(Math.max(0,5800-(await page.evaluate(()=>portfolioLoader.getState().elapsed))));record.afterIntroDeadline=await page.evaluate(()=>({state:portfolioLoader.getState(),loaderPresent:!!document.getElementById('studio-loader'),videoPaused:document.querySelector('#studio-loader video')?.paused??true}));if(c.capture)await page.screenshot({path:path.join(out,c.name+'-waiting.png')})}
  await page.waitForFunction(()=>window.portfolioEntry?.ready&&!document.getElementById('studio-loader'),{},{timeout:c.nativeNever&&!c.skip?15000:11000});
  await page.waitForTimeout(160);record.finished=await page.evaluate(()=>({t:performance.now(),state:portfolioLoader.getState(),entry:portfolioEntry.mode,entryReady:portfolioEntry.ready,nativeReady:window.portfolioRuntime?.ready,key:window.portfolioRuntime?.focusedKey,fallback:!!document.getElementById('studio-fallback')}));
  if(c.capture)await page.screenshot({path:path.join(out,c.name+'-finished.png')});
  if(c.smoke)record.smoke=await smoke(page,c);
  record.audit=await page.evaluate(()=>__loaderQA);
  const frames=record.audit.frames,start=frames[0]?.t??record.firstState.t,final=record.finished.state,videos=frames.map(f=>f.video).filter(Boolean),states=frames.map(f=>f.state),mediaReleased=frames.find(f=>['reduced-motion','video-error','autoplay-rejected','load-timeout','deadline','timeline-complete','ended','skip'].includes(f.state.mediaReason)),visibleButton=frames.find(f=>f.buttonVisible),playing=record.audit.events.filter(e=>e.type==='playing');
  assert(record,'read-only loader API',record.firstState.frozen);
  const markup=record.audit.markup||record.firstState.markup;assert(record,'square media replaces the legacy drawing and numeric counter',!markup.legacyDrawing&&!markup.visibleCounter&&!!markup.film&&Math.abs(markup.film.width-markup.film.height)<1&&markup.film.x>=0&&markup.film.y>=0&&markup.film.x+markup.film.width<=markup.viewport.width&&markup.film.y+markup.film.height<=markup.viewport.height,markup);
  assert(record,'finite monotonic resource progress',states.length>0&&states.every((s,i)=>Number.isInteger(s.completed)&&Number.isInteger(s.total)&&s.total>0&&s.completed>=0&&s.completed<=s.total&&(!i||s.completed>=states[i-1].completed)),{first:states[0],last:final});
  assert(record,'loader reaches complete phase',final.phase==='complete'&&record.finished.entryReady);
  assert(record,'media is muted inline and never loops',videos.length>0&&videos.every(v=>v.muted&&v.playsInline&&!v.loop));
  assert(record,'one playback at most',record.audit.playCalls<=1&&record.audit.events.filter(e=>e.type==='ended').length<=1&&videos.every((v,i)=>!i||v.currentTime>=videos[i-1].currentTime-.05),{playCalls:record.audit.playCalls,playingEvents:playing.length});
  assert(record,'video time bounded to the single five-second clip',Math.max(...videos.map(v=>v.currentTime),0)<=5.25,{maxTime:Math.max(...videos.map(v=>v.currentTime),0)});
  if(c.reduced){assert(record,'reduced motion has static poster without playback',record.audit.playCalls===0&&videos.every(v=>!v.src&&v.paused&&v.currentTime===0)&&states.some(s=>s.mediaReason==='reduced-motion'));}
  else if(!c.skip){assert(record,'intro releases within the 5.5-second deadline',!!mediaReleased&&mediaReleased.t-start<=5900,{elapsed:mediaReleased?mediaReleased.t-start:null,reason:final.mediaReason});}
  if(!c.reduced&&!c.skip&&!c.video404&&!c.autoplayRejected&&!c.canplayStalled)assert(record,'normal media actually plays',videos.some(v=>v.currentTime>.1)&&playing.length>=1);
  if(!c.reduced&&!c.skip&&frames.some(f=>f.state.phase==='loading'&&f.t-start>1100))assert(record,'Enter is available after one second',!!visibleButton&&visibleButton.t-start<=1250,{elapsed:visibleButton?visibleButton.t-start:null});
  if(c.video404)assert(record,'video failure releases media gate',states.some(s=>s.mediaReason==='video-error'));
  if(c.autoplayRejected)assert(record,'autoplay rejection releases media gate',states.some(s=>s.mediaReason==='autoplay-rejected'));
  if(c.canplayStalled)assert(record,'stalled canplay uses load timeout',record.stalledVideoRequested&&states.some(s=>s.mediaReason==='load-timeout')&&!!mediaReleased&&mediaReleased.t-start<=2200);
  if(c.poster404)assert(record,'poster failure does not block readiness',final.resourcesSettled&&record.finished.entryReady);
  if(c.homeDelay&&!c.skip)assert(record,'resources gate independently after intro ends',record.afterIntroDeadline.loaderPresent&&!record.afterIntroDeadline.state.resourcesSettled&&record.afterIntroDeadline.state.completed<record.afterIntroDeadline.state.total&&record.afterIntroDeadline.state.mediaState==='complete'&&record.afterIntroDeadline.videoPaused,record.afterIntroDeadline);
  if(c.home404||c.nativeNever&&!c.skip)assert(record,'failed required resource is reported and bounded',final.loadingFailed&&final.resourcesSettled&&record.finished.t-start<14500);
  if(c.nativeNever)assert(record,'native unready safely shows Home fallback',!record.finished.nativeReady&&record.finished.entry==='home'&&record.finished.fallback);
  if(c.skip)assert(record,'one-second Enter skips resources immediately',final.skipped&&!final.resourcesSettled&&(c.prebootKeys?!!visibleButton&&visibleButton.t-start<=1250:record.skipButtonAt-start<=1300)&&record.skipExitedAt-record.skipClickedAt<=350,{buttonElapsed:visibleButton?visibleButton.t-start:record.skipButtonAt-start,clickedElapsed:record.skipClickedAt-start,exitElapsed:record.skipExitedAt-record.skipClickedAt});
  else assert(record,'normal finish waits required resources',final.resourcesSettled&&final.completed===final.total);
  if(c.prebootKeys)assert(record,'preboot Home Enter Space and wheel cannot activate the background',record.prebootKeys.state.phase==='loading'&&!record.prebootKeys.entryReady&&record.prebootKeys.entryMode!=='work'&&!record.prebootKeys.overview&&record.prebootKeys.key===null&&equalCamera(record.prebootCamera,record.prebootKeys.camera,1e-6)&&record.prebootKeys.background.every(n=>!n.present||n.inert)&&record.prebootKeys.navigation.length===0,record.prebootKeys);
  if(c.route)assert(record,'direct route opens requested case',record.finished.key==='btb'&&record.finished.entry==='detail');
  if(c.smoke)assert(record,'Work gestures remain interactive without auto-navigation',record.smoke.mode==='work'&&record.smoke.key===null&&record.smoke.overview&&!equalCamera(record.smoke.before,record.smoke.after,1e-5),record.smoke);
  const expected404=new Set([c.video404?origin+videoPath:null,c.poster404?origin+posterPath:null,c.home404?origin+homePath:null]);assert(record,'no unexpected HTTP failure',record.httpFailures.every(r=>expected404.has(r.url)),record.httpFailures);assert(record,'no page errors',record.errors.length===0,record.errors);
 }catch(error){record.failure=error.stack;assert(record,'scenario completes',false,error.message);try{record.audit=await page.evaluate(()=>__loaderQA);record.last=await page.evaluate(()=>({loader:window.portfolioLoader?.getState?.(),entry:window.portfolioEntry?.mode}))}catch{}}
 finally{await page.close();record.passed=record.assertions.every(a=>a.passed);report.checks.push(record);save();console.log(`${record.passed?'PASS':'FAIL'} ${c.name}: ${record.assertions.filter(a=>a.passed).length}/${record.assertions.length}`);if(!record.passed)console.log(JSON.stringify(record.assertions.filter(a=>!a.passed),null,2))}
}
(async()=>{fs.mkdirSync(out,{recursive:true});if(!selected.length)throw Error('No matching scenario');const required=[posterPath];if(selected.some(c=>!c.reduced&&!c.video404&&!c.canplayStalled))required.push(videoPath);for(const url of required)if(!files.has(path.join(site,url)))throw Error('Loader asset is not ready: '+url);const browser=await chromium.launch({channel:'chrome',headless:true});let next=0;await Promise.all(Array.from({length:3},async()=>{while(next<selected.length)await run(browser,selected[next++])}));await browser.close();report.completedAt=new Date().toISOString();report.summary={scenarios:report.checks.length,passed:report.checks.filter(c=>c.passed).length,assertions:report.checks.reduce((n,c)=>n+c.assertions.length,0),failedAssertions:report.checks.flatMap(c=>c.assertions.filter(a=>!a.passed).map(a=>({scenario:c.name,...a}))),pageErrors:report.checks.reduce((n,c)=>n+c.errors.length,0)};save();console.log(JSON.stringify(report.summary,null,2));if(report.summary.failedAssertions.length)process.exitCode=1})().catch(error=>{report.fatal=error.stack;save();console.error(error);process.exitCode=1});
