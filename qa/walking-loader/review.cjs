const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {freeze,site,settle,equalCamera}=require('../open-close-review/helpers.cjs');
const origin='http://127.0.0.1:8943',files=freeze(),out=__dirname;
const cases=[
 {name:'desktop-normal',width:1440,height:900},
 {name:'phone-normal',width:390,height:844,smoke:true},
 {name:'phone-reduced',width:390,height:844,reduced:true},
 {name:'home-image-error',width:1440,height:900,home404:true},
 {name:'slow-enter-and-keyboard',width:1440,height:900,nativeBlocked:true,skip:true},
 {name:'small-phone-bounds',width:320,height:568},
];
const choice=process.argv.indexOf('--case'),selected=choice>=0?cases.filter(c=>process.argv[choice+1].split(',').includes(c.name)):cases;
const report={startedAt:new Date().toISOString(),origin,sourceHashes:{},checks:[],notes:['Local-only, six sequential browser scenarios; no runtime source edits or deployment.','Source buffers are frozen when the test starts.','Native startup camera motion is allowed; preboot assertions check focus/navigation and inert background.']};
for(const name of ['index.html','entry-flow.js','entry-flow.css','_next/static/chunks/0n9xfy8bxft48.js']){const body=files.get(path.join(site,name));if(body)report.sourceHashes[name]=crypto.createHash('sha256').update(body).digest('hex')}
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
function check(record,name,passed,detail){record.assertions.push({name,passed,...(detail===undefined?{}:{detail})})}
const median=xs=>xs.length?[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)]:null;
async function install(page,c,record){
 await page.addInitScript(()=>{
  window.__walkerQA={frames:[],events:[],requests:[]};
  for(const type of ['portfolio:navigate','portfolio:nativehome','portfolio:entrystate'])addEventListener(type,event=>__walkerQA.events.push({type,t:performance.now(),detail:event.detail}));
  let last=0;function tick(t){if(t-last>30){last=t;const state=window.portfolioLoader?.getState?.();if(state){const loader=document.getElementById('studio-loader'),button=document.getElementById('loader-continue');__walkerQA.frames.push({t,state,entryReady:window.portfolioEntry?.ready,entryMode:window.portfolioEntry?.mode,buttonVisible:!!button&&!button.hidden&&getComputedStyle(button).display!=='none'});if(!__walkerQA.markup&&loader)__walkerQA.markup={legacyMedia:loader.querySelectorAll('video,img[src*="paper-cut-loader"]').length,headline:loader.querySelectorAll('.loader-word').length,progress:loader.querySelectorAll('[role=progressbar],.loader-meter,[data-loader-value]').length,text:loader.textContent.trim(),background:getComputedStyle(loader).backgroundColor,bodyBackground:getComputedStyle(document.body).backgroundColor}}}requestAnimationFrame(tick)}requestAnimationFrame(tick);
 });
 page.on('pageerror',e=>record.errors.push(e.message));
 page.on('request',r=>{if(/paper-cut-loader\.(mp4|webp)/.test(r.url()))record.oldMediaRequests.push(r.url())});
 page.on('response',r=>{if(r.status()>=400)record.httpFailures.push({url:r.url(),status:r.status()})});
 await page.route(origin+'/**',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname),file=path.join(site,pathname==='/'?'index.html':pathname);let body=files.get(file);
  if(c.home404&&pathname==='/hero/paper-laptop.webp')return route.fulfill({status:404,body:'Intentional Home image QA failure'});
  if(c.nativeBlocked&&path.basename(file)==='0n9xfy8bxft48.js'){
   body=body.toString();const anchor="Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:snapshot});";
   if(!body.includes(anchor))throw Error('Native readiness QA anchor missing');body=body.replace(anchor,"Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:()=>({...snapshot(),ready:false})});");
  }
  if(body)return route.fulfill({body,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]});return route.continue();
 });
}
const view=()=>{const loader=document.getElementById('studio-loader'),walker=document.querySelector('#loader-walker,.loader-walker,[data-loader-walker]')||loader?.querySelector('svg'),rect=walker?.getBoundingClientRect();return{state:portfolioLoader.getState(),entryReady:portfolioEntry.ready,entryMode:portfolioEntry.mode,key:window.portfolioRuntime?.focusedKey,overview:window.portfolioRuntime?.workOverviewActive,rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,opacity:walker?Number(getComputedStyle(walker).opacity):0,background:['studio-home','portfolio-root','portfolio-ui'].map(id=>({id,inert:document.getElementById(id)?.inert??null})),fallback:!!document.getElementById('studio-fallback')}};
async function run(browser,c){
 const page=await browser.newPage({viewport:{width:c.width,height:c.height},isMobile:c.width<500,hasTouch:c.width<500,reducedMotion:c.reduced?'reduce':'no-preference'}),r={name:c.name,scenario:c,assertions:[],errors:[],oldMediaRequests:[],httpFailures:[]};
 try{
  await install(page,c,r);await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof window.portfolioLoader?.getState==='function'&&'walking'in window.portfolioLoader.getState(),{},{timeout:6000});
  r.initial=await page.evaluate(view);
  if(!c.reduced){await page.waitForTimeout(Math.max(0,650-r.initial.state.elapsed));r.moving=await page.evaluate(view);await page.screenshot({path:path.join(out,c.name+'-loading.png')})}
  if(c.skip){
   for(const key of ['Home','Enter','Space']){await page.keyboard.press(key);await page.waitForTimeout(70)}await page.mouse.move(c.width/2,c.height/2);await page.mouse.wheel(0,-1200);await page.waitForTimeout(150);r.preboot=await page.evaluate(view);r.preboot.navigation=await page.evaluate(()=>__walkerQA.events.filter(e=>e.type==='portfolio:navigate'));
   await page.locator('#loader-continue').waitFor({state:'visible',timeout:8000});r.slow=await page.evaluate(view);await page.screenshot({path:path.join(out,c.name+'-enter.png')});await page.locator('#loader-continue').click();r.clickedAt=await page.evaluate(()=>performance.now());await page.waitForFunction(()=>window.portfolioEntry?.ready,{},{timeout:400});r.readyAt=await page.evaluate(()=>performance.now());
  }
  await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&window.portfolioEntry?.ready,{},{timeout:12000});r.parked=await page.evaluate(view);await page.waitForTimeout(650);r.afterRest=await page.evaluate(view);await page.screenshot({path:path.join(out,c.name+'-parked.png')});r.audit=await page.evaluate(()=>__walkerQA);
  const states=r.audit.frames.map(f=>f.state),moving=states.filter(s=>s.walking),firstReady=r.audit.frames.find(f=>f.state.ready||f.entryReady),firstButton=r.audit.frames.find(f=>f.buttonVisible),final=r.afterRest.state,markup=r.audit.markup||{};
  check(r,'loader completes with finite resource accounting',final.phase==='complete'&&final.ready&&Number.isInteger(final.completed)&&final.completed<=final.total&&final.total>0);
  check(r,'old media headline and progress are absent',!r.oldMediaRequests.length&&markup.legacyMedia===0&&markup.headline===0&&markup.progress===0,{requests:r.oldMediaRequests,markup});
  check(r,'charcoal background',markup.background==='rgb(8, 8, 8)'||markup.bodyBackground==='rgb(8, 8, 8)',markup);
  if(c.reduced)check(r,'reduced motion stays static without minimum hold',states.every(s=>!s.walking&&s.frame===2)&&firstReady?.state.elapsed<1800,{readyElapsed:firstReady?.state.elapsed,frames:[...new Set(states.map(s=>s.frame))]});
  else{
   check(r,'normal loader waits two seconds and resource readiness',firstReady?.state.elapsed>=1980&&firstReady.state.minimumDone&&(c.skip||firstReady.state.resourcesSettled),{ready:firstReady?.state});
   check(r,'five walk poses appear only during loading',moving.length>5&&moving.every(s=>s.phase==='loading'&&Number.isInteger(s.frame)&&s.frame>=0&&s.frame<5)&&new Set(moving.map(s=>s.frame)).size===5);
   const changes=[];for(const s of moving)if(!changes.length||changes.at(-1).frame!==s.frame)changes.push(s);const poseIntervals=changes.slice(1).map((s,i)=>s.elapsed-changes[i].elapsed),speed=[];for(let i=1;i<moving.length;i++){const dt=moving[i].elapsed-moving[i-1].elapsed,dx=moving[i].walkerX-moving[i-1].walkerX;if(dt>0&&dx>0)speed.push(dx/dt*1000)}
   check(r,'poses change about every 200ms',median(poseIntervals)>=150&&median(poseIntervals)<=250,{median:median(poseIntervals),count:poseIntervals.length});
   check(r,'walker advances at 69px per second',median(speed)>=65&&median(speed)<=73,{median:median(speed),count:speed.length});
  }
  check(r,'parked frame two stays unchanged for 650ms',r.parked.state.frame===2&&final.frame===2&&!r.parked.state.walking&&!final.walking&&Math.abs(r.parked.state.walkerX-final.walkerX)<.01&&JSON.stringify(r.parked.rect)===JSON.stringify(r.afterRest.rect)&&r.afterRest.opacity>=.5,{parked:r.parked,afterRest:r.afterRest});
  const rect=r.afterRest.rect;check(r,'parked figure stays inside the lower viewport',!!rect&&rect.x>=-1&&rect.y>c.height*.5&&rect.x+rect.width<=c.width+1&&rect.y+rect.height<=c.height+1,rect);
  if(c.home404)check(r,'Home image failure settles safely',final.loadingFailed&&final.resourcesSettled&&r.afterRest.entryMode==='home');
  if(c.skip){
   check(r,'preboot keyboard and wheel leave background inactive',!r.preboot.entryReady&&!r.preboot.overview&&r.preboot.key===null&&r.preboot.background.every(n=>n.inert)&&r.preboot.navigation.length===0,r.preboot);
   check(r,'slow Enter appears at seven seconds',!!firstButton&&firstButton.state.elapsed>=6900&&firstButton.state.elapsed<=7500,{first:firstButton?.state,clicked:r.slow.state});
   check(r,'slow Enter exits promptly to native fallback',final.skipped&&!final.resourcesSettled&&r.readyAt-r.clickedAt<=400&&r.afterRest.fallback&&r.afterRest.entryMode==='home',{elapsed:r.readyAt-r.clickedAt,final});
  }else check(r,'usual Enter stays hidden',!firstButton);
  if(c.smoke){await page.locator('#enter-work').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&portfolioRuntime.focusedKey===null);await settle(page,null);const before=await page.evaluate(()=>({...portfolioRuntime.camera}));await page.mouse.move(148,444);for(let i=0;i<8;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(70)}await page.waitForTimeout(650);await settle(page,null);r.smoke=await page.evaluate(()=>({mode:portfolioEntry.mode,key:portfolioRuntime.focusedKey,overview:portfolioRuntime.workOverviewActive,camera:portfolioRuntime.camera}));check(r,'Explore and Work wheel remain functional',r.smoke.mode==='work'&&r.smoke.key===null&&r.smoke.overview&&!equalCamera(before,r.smoke.camera),r.smoke)}
  check(r,'no page errors or unexpected HTTP failures',!r.errors.length&&r.httpFailures.every(f=>c.home404&&f.url===origin+'/hero/paper-laptop.webp'),{errors:r.errors,httpFailures:r.httpFailures});
 }catch(error){r.failure=error.stack;check(r,'scenario completes',false,error.message);try{r.last=await page.evaluate(()=>({loader:window.portfolioLoader?.getState?.(),entry:window.portfolioEntry?.mode}));r.audit=await page.evaluate(()=>__walkerQA)}catch{}}
 finally{await page.close();r.passed=r.assertions.every(a=>a.passed);report.checks.push(r);save();console.log(`${r.passed?'PASS':'FAIL'} ${c.name} ${r.assertions.filter(a=>a.passed).length}/${r.assertions.length}`);if(!r.passed)console.log(JSON.stringify(r.assertions.filter(a=>!a.passed),null,2))}
}
(async()=>{fs.mkdirSync(out,{recursive:true});if(!selected.length)throw Error('No matching scenarios');const browser=await chromium.launch({channel:'chrome',headless:true});for(const c of selected)await run(browser,c);await browser.close();report.completedAt=new Date().toISOString();report.summary={scenarios:report.checks.length,passed:report.checks.filter(c=>c.passed).length,assertions:report.checks.reduce((n,c)=>n+c.assertions.length,0),failures:report.checks.flatMap(c=>c.assertions.filter(a=>!a.passed).map(a=>({scenario:c.name,...a}))),pageErrors:report.checks.reduce((n,c)=>n+c.errors.length,0),oldMediaRequests:report.checks.flatMap(c=>c.oldMediaRequests)};save();console.log(JSON.stringify(report.summary,null,2));if(report.summary.failures.length)process.exitCode=1})().catch(error=>{report.fatal=error.stack;save();console.error(error);process.exitCode=1});
