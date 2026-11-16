const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {site,settle,equalCamera}=require('../open-close-review/helpers.cjs');
const origin='http://127.0.0.1:8943',out=__dirname;
const reference='C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com';
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const cases=[{name:'desktop-full',width:1440,height:900},{name:'phone-touch',width:390,height:844,touch:true},{name:'desktop-reduced',width:1280,height:800,reduced:true}];
const index=process.argv.indexOf('--case'),selected=index<0?cases:cases.filter(c=>process.argv[index+1].split(',').includes(c.name));
const report={startedAt:new Date().toISOString(),origin,notes:['Live local server responses; no source rewriting, route interception, runtime method invocation, or internal-state mutation.','Read-only request/event/RAF observation; keyboard, pointer, focus, resize and window blur are the only interaction inputs.'],sourceHashes:{},assets:[],cases:[]};
const sourceNames=['index.html','entry-flow.js','entry-flow.css','character-runtime.js'];
for(const name of sourceNames){const file=path.join(site,name);if(fs.existsSync(file))report.sourceHashes[name]=digest(fs.readFileSync(file))}
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
const median=values=>values.length?[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)]:null;
function check(record,name,passed,detail){record.assertions.push({name,passed:!!passed,...detail===undefined?{}:{detail}})}
function assetReview(){
 const html=fs.readFileSync(path.join(reference,'index.html'),'utf8');
 const originals=[...html.matchAll(/loader__frame--(\d)" src="data:image\/webp;base64,([^"]+)"/g)];
 for(const match of originals){const file=path.join(site,'hero/walker',`frame-${match[1]}.webp`),actual=fs.existsSync(file)?fs.readFileSync(file):null,expected=Buffer.from(match[2],'base64');report.assets.push({name:`original pose ${match[1]}`,passed:!!actual&&digest(actual)===digest(expected),bytes:actual?.length,expectedBytes:expected.length,sha256:actual?digest(actual):null})}
 for(const [name,candidates]of Object.entries({loading:['assets/newloadingbubble-320w-b9gPi1-F.webp','assets/newloadingbubble-480w-5UeknW-T.webp'],scroll:['assets/scrollbubblewithbg-320w-REO35nq0.webp','assets/scrollbubblewithbg-480w-DVdoKieV.webp'],swipe:['imagesnow/hand/sticky/swipebubble-320w.webp','imagesnow/hand/sticky/swipebubble-480w.webp']})){
  const file=path.join(site,'hero/walker',name+'.webp'),actual=fs.existsSync(file)?fs.readFileSync(file):null,matched=candidates.find(p=>actual&&digest(actual)===digest(fs.readFileSync(path.join(reference,p))))||null;
  report.assets.push({name:`original ${name} bubble`,passed:!!matched,reference:matched,sha256:actual?digest(actual):null});
 }
}
const snapshot=()=>{
 const el=document.getElementById('loader-walker'),rect=el?.getBoundingClientRect(),s=el&&getComputedStyle(el),native=window.portfolioRuntime;
 return {t:performance.now(),character:window.portfolioCharacter?.getState?.()||null,loader:window.portfolioLoader?.getState?.()||null,mode:document.body.dataset.entry,entryReady:window.portfolioEntry?.ready,entryMode:window.portfolioEntry?.mode,rect:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height,right:rect.right,bottom:rect.bottom}:null,visible:!!el&&!el.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0,dataset:el?{...el.dataset}:null,poses:el?[...el.querySelectorAll('.walker-frame')].map(i=>({pose:Number(i.dataset.pose),opacity:Number(getComputedStyle(i).opacity),loaded:i.complete&&i.naturalWidth===320&&i.naturalHeight===408,src:i.currentSrc})):[],camera:native?{...native.camera}:null,key:native?.focusedKey,materialIndex:native?.materialIndex,overview:native?.workOverviewActive,focused:document.activeElement?.id||document.activeElement?.tagName};
};
async function observe(page,record){
 page.on('pageerror',e=>record.errors.push(e.message));
 page.on('request',request=>{const url=request.url();if(/\/hero\/walker\//.test(url))record.walkerRequests.push(url);if(/paper-cut-loader\.(mp4|webp)/.test(url))record.oldMediaRequests.push(url)});
 page.on('response',response=>{if(response.status()>=400)record.httpFailures.push({url:response.url(),status:response.status()})});
 await page.addInitScript(()=>{
  window.__fullCharacterQA={frames:[],events:[],keys:[]};
  for(const type of ['portfolio:characterparked','portfolio:characteractive','portfolio:entrystate','portfolio:navigate'])addEventListener(type,e=>__fullCharacterQA.events.push({type,t:performance.now(),detail:e.detail}));
  addEventListener('keydown',e=>__fullCharacterQA.keys.push({key:e.key,code:e.code,prevented:e.defaultPrevented,target:e.target?.id||e.target?.tagName,t:performance.now()}));
  let last=0;function tick(t){if(t-last>28){last=t;const el=document.getElementById('loader-walker'),loader=window.portfolioLoader?.getState?.(),character=window.portfolioCharacter?.getState?.();if(loader||character){const r=el?.getBoundingClientRect();__fullCharacterQA.frames.push({t,loader,character,mode:document.body.dataset.entry,x:r?.x,y:r?.y,right:r?.right,bottom:r?.bottom,frame:el?Number(el.dataset.frame):null});if(__fullCharacterQA.frames.length>12000)__fullCharacterQA.frames.splice(0,1000)}}requestAnimationFrame(tick)}requestAnimationFrame(tick);
 });
}
async function parked(page){await page.waitForFunction(()=>{const s=window.portfolioCharacter?.getState?.();return window.portfolioLoader?.getState?.().phase==='complete'&&s&&!s.returning&&s.grounded&&document.body.dataset.entry==='home'},{},{timeout:16000})}
async function blurFocus(page){await page.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur())}
async function hold(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(60);return page.evaluate(snapshot)}
async function jump(page,record,key,screenshot){
 await blurFocus(page);const before=await page.evaluate(snapshot);await page.keyboard.press(key);await page.waitForFunction(()=>window.portfolioCharacter.getState().y>25,{},{timeout:1500});
 const airborne=await page.evaluate(snapshot);if(screenshot)await page.screenshot({path:path.join(out,record.name+'-jump.png')});
 await page.waitForFunction(()=>window.portfolioCharacter.getState().grounded,{},{timeout:2500});const landed=await page.evaluate(snapshot);
 check(record,key+' jumps and returns to a grounded surface',airborne.character.y>25&&!airborne.character.grounded&&airborne.rect.y<before.rect.y-20&&landed.character.grounded,{before:before.character,airborne:airborne.character,landed:landed.character});
}
function timingReview(record,frames,reduced){
 const loading=frames.filter(f=>f.loader?.walking),firstReady=frames.find(f=>f.loader?.ready),returning=frames.filter(f=>f.character?.returning);
 if(reduced){check(record,'reduced motion loading remains a single static pose',frames.filter(f=>f.loader?.phase==='loading').every(f=>!f.loader.walking&&f.frame===2),{loadingFrames:frames.filter(f=>f.loader?.phase==='loading').length,readyElapsed:firstReady?.loader.elapsed});return}
 check(record,'all five original poses cycle during loading',new Set(loading.map(f=>f.frame)).size===5,{poses:[...new Set(loading.map(f=>f.frame))]});
 const changes=[];for(const f of loading)if(!changes.length||changes.at(-1).frame!==f.frame)changes.push(f);
 const intervals=changes.slice(1).map((f,i)=>f.t-changes[i].t),speed=loading.slice(1).map((f,i)=>Math.abs(f.x-loading[i].x)/(f.t-loading[i].t)*1000).filter(v=>v>20&&v<150);
 check(record,'initial poses change approximately every 200ms',median(intervals)>=150&&median(intervals)<=250,{medianMs:median(intervals),intervals});
 check(record,'initial walk measures 69px per second',median(speed)>=63&&median(speed)<=75,{medianPxPerSecond:median(speed),samples:speed.length});
 check(record,'normal loader satisfies its two-second minimum',firstReady?.loader.elapsed>=1975,{firstReadyElapsed:firstReady?.loader.elapsed});
 const fade=frames.filter(f=>f.loader?.phase==='leaving');check(record,'gait continues through the curtain fade before control handoff',fade.length>=4&&fade.every(f=>f.loader.walking)&&Math.abs(fade.at(-1).x-fade[0].x)>15,{samples:fade.length,distance:fade.length?fade.at(-1).x-fade[0].x:null});
 const backSpeed=returning.slice(1).map((f,i)=>Math.abs(f.x-returning[i].x)/(f.t-returning[i].t)*1000).filter(v=>v>20&&v<150);
 check(record,'automatic return measures 90px per second',backSpeed.length>3&&median(backSpeed)>=82&&median(backSpeed)<=98,{medianPxPerSecond:median(backSpeed),samples:backSpeed.length});
}
async function languageReview(page,record,touch){
 const expected={en:{loading:'Loading',scroll:touch?'Swipe':'Scroll',controls:'use wasd'},ro:{loading:'Se încarcă',scroll:touch?'Glisează':'Derulează',controls:'folosește WASD'},ru:{loading:'Загрузка',scroll:touch?'Смахните':'Прокрутите',controls:'клавиши WASD'}};
 for(const locale of ['ro','ru','en']){
  await page.locator(`[data-locale="${locale}"][lang]`).click();await page.waitForFunction(locale=>document.documentElement.lang===locale,locale);
  const labels=await page.locator('#loader-walker').evaluate(el=>({locale:el.dataset.locale,copy:Object.fromEntries([...el.querySelectorAll('[data-walker-copy]')].map(n=>[n.dataset.walkerCopy,n.textContent])),images:[...el.querySelectorAll('.walker-bubble>img')].map(n=>({display:getComputedStyle(n).display,src:n.currentSrc})),translated:[...el.querySelectorAll('.walker-translated-bubble')].map(n=>getComputedStyle(n).display)}));
  check(record,locale.toUpperCase()+' character labels preserve the original cloud',labels.locale===locale&&Object.entries(expected[locale]).every(([k,v])=>labels.copy[k]===v)&&labels.images.length===1&&labels.images[0].display===(locale==='en'?'block':'none')&&labels.translated.length===2&&labels.translated[0]===(locale==='en'?'none':'block')&&labels.translated[1]==='block',labels);
 }
 await blurFocus(page);
}
async function keyboardReview(page,record){
 await blurFocus(page);let before=await page.evaluate(snapshot),after=await hold(page,'d',350);check(record,'D walks right without moving the Work camera',after.rect.x-before.rect.x>80&&equalCamera(before.camera,after.camera),{before:before.character,after:after.character});
 before=after;after=await hold(page,'a',180);check(record,'A walks left',before.rect.x-after.rect.x>35,{before:before.character,after:after.character});
 before=after;after=await hold(page,'ArrowRight',180);check(record,'Right arrow walks right',after.rect.x-before.rect.x>35);
 before=after;after=await hold(page,'ArrowLeft',100);check(record,'Left arrow walks left',before.rect.x-after.rect.x>15);
 await jump(page,record,'w',true);await jump(page,record,'Space',false);
 await page.keyboard.down('d');await page.waitForTimeout(140);await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.waitForTimeout(70);before=await page.evaluate(snapshot);await page.waitForTimeout(350);after=await page.evaluate(snapshot);await page.keyboard.up('d');
 check(record,'window blur clears a held movement key',Math.abs(after.rect.x-before.rect.x)<1,{before:before.character,after:after.character});
 await page.locator('#enter-work').focus();before=await page.evaluate(snapshot);after=await hold(page,'ArrowRight',250);
 check(record,'focused Home button keeps arrow keys out of the character',Math.abs(after.rect.x-before.rect.x)<1&&after.entryMode==='home',{before:before.character,after:after.character,focused:after.focused});
 await page.locator('[data-locale="en"][lang]').focus();before=await page.evaluate(snapshot);after=await hold(page,'d',200);check(record,'focused language control keeps letter keys out of the character',Math.abs(after.rect.x-before.rect.x)<1);
 await blurFocus(page);await page.keyboard.down('ArrowRight');await page.waitForTimeout(4700);await page.keyboard.up('ArrowRight');await page.waitForTimeout(70);after=await page.evaluate(snapshot);
 check(record,'rightward traversal stays bounded and stops at the laptop or viewport wall',after.rect.x>=-1&&after.rect.right<=1441&&(after.rect.right>=1438||after.character.nearbyCount>0),{rect:after.rect,character:after.character});
 if(after.rect.right<1438&&after.character.nearbyCount>0){
  const stopped=after;await hold(page,'ArrowRight',250);const still=await page.evaluate(snapshot);check(record,'solid laptop pixels block sustained horizontal movement',Math.abs(still.rect.x-stopped.rect.x)<1&&still.character.maskCount===1,{before:stopped.character,after:still.character});
  const start=await page.evaluate(()=>performance.now());await page.keyboard.down('ArrowRight');await page.keyboard.press('Space');await page.waitForFunction(()=>portfolioCharacter.getState().y>25,{},{timeout:1500});await page.waitForTimeout(150);await page.keyboard.up('ArrowRight');await page.screenshot({path:path.join(out,record.name+'-laptop-collision.png')});await page.waitForFunction(()=>portfolioCharacter.getState().grounded,{},{timeout:2500});
  const collisionJump=await page.evaluate(snapshot),samples=await page.evaluate(start=>__fullCharacterQA.frames.filter(f=>f.t>=start),start);record.laptopJump={landed:collisionJump.character,peak:Math.max(...samples.map(f=>f.character?.y||0)),platformObserved:samples.some(f=>f.character?.onPlatform)};check(record,'jump against the real laptop lands without leaving viewport',collisionJump.character.grounded&&collisionJump.rect.x>=-1&&collisionJump.rect.right<=1441&&record.laptopJump.peak>25,record.laptopJump);
 }
 await page.setViewportSize({width:380,height:650});await page.waitForTimeout(200);after=await page.evaluate(snapshot);check(record,'shrinking the viewport clamps the sprite inside it',after.rect.x>=-1&&after.rect.right<=381&&after.rect.bottom<=651,after);
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(150);await hold(page,'ArrowLeft',1400);after=await page.evaluate(snapshot);check(record,'left wall bounds the complete sprite',after.rect.x>=-1&&after.rect.x<=1,{rect:after.rect,character:after.character});
 record.colliderGeometry=await page.evaluate(()=>[...document.querySelectorAll('.paper-laptop,.studio-draft,.studio-note')].map(el=>{const r=el.getBoundingClientRect();return{class:el.className,x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,visible:getComputedStyle(el).display!=='none'}}));
}
async function workReview(page,record){
 await blurFocus(page);await page.keyboard.down('d');await page.waitForTimeout(120);await page.locator('#enter-work').click();await page.waitForFunction(()=>window.portfolioEntry.mode==='work');await settle(page,null);const entered=await page.evaluate(snapshot);await page.waitForTimeout(300);const still=await page.evaluate(snapshot);await page.keyboard.up('d');
 check(record,'leaving Home hides and stops the held-key character',!entered.visible&&!still.visible&&Math.abs(entered.character.x-still.character.x)<1,{entered,still});
 await page.mouse.move(720,450);const before=await page.evaluate(snapshot);for(let i=0;i<8;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(70)}await page.waitForTimeout(800);await settle(page,null);const zoomed=await page.evaluate(snapshot);
 check(record,'Work wheel zoom remains functional and does not open a project',zoomed.entryMode==='work'&&zoomed.key===null&&zoomed.overview&&!equalCamera(before.camera,zoomed.camera),{before:before.camera,after:zoomed.camera,mode:zoomed.entryMode,key:zoomed.key});
 await page.locator('#work-toggle').click();await page.locator('#work-list [data-key="btb"]').click();await settle(page,'btb');await page.waitForFunction(()=>portfolioEntry.mode==='detail');const opened=await page.evaluate(snapshot);
 await page.locator('#next-material').focus();const materialBefore=await page.evaluate(snapshot);await page.keyboard.press('ArrowRight');await page.waitForTimeout(700);const materialAfter=await page.evaluate(snapshot);
 check(record,'project opens and its arrow shortcut changes material',opened.key==='btb'&&opened.entryMode==='detail'&&materialAfter.key==='btb'&&materialAfter.materialIndex!==materialBefore.materialIndex,{opened:opened.key,before:materialBefore.materialIndex,after:materialAfter.materialIndex});
 await page.locator('#return-control').click();await settle(page,null);await page.waitForFunction(()=>portfolioEntry.mode==='work');const returned=await page.evaluate(snapshot);check(record,'project return restores Work with character hidden',returned.key===null&&returned.entryMode==='work'&&!returned.visible,{mode:returned.entryMode,key:returned.key});
 await page.locator('#home-control').click();await parked(page);await blurFocus(page);const home=await page.evaluate(snapshot);await page.waitForTimeout(350);const idle=await page.evaluate(snapshot);
 check(record,'returning Home does not revive the old held key',home.visible&&idle.visible&&Math.abs(home.rect.x-idle.rect.x)<1&&idle.character.grounded,{home:home.character,idle:idle.character});
 await page.screenshot({path:path.join(out,record.name+'-returned-home.png')});
}
async function run(browser,c){
 const page=await browser.newPage({viewport:{width:c.width,height:c.height},isMobile:!!c.touch,hasTouch:!!c.touch,reducedMotion:c.reduced?'reduce':'no-preference'}),r={name:c.name,scenario:c,assertions:[],errors:[],httpFailures:[],oldMediaRequests:[],walkerRequests:[]};
 try{
  await observe(page,r);await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof window.portfolioLoader?.getState==='function',{},{timeout:8000});
  if(!c.reduced){await page.waitForTimeout(650);r.loading=await page.evaluate(snapshot);await page.screenshot({path:path.join(out,c.name+'-loading.png')})}
  await parked(page);r.parked=await page.evaluate(snapshot);await page.screenshot({path:path.join(out,c.name+'-parked.png')});await page.waitForTimeout(300);const idle=await page.evaluate(snapshot);
  check(r,'five original 320x408 sprites decode and exactly one pose is visible',idle.poses.length===5&&idle.poses.every(p=>p.loaded)&&idle.poses.filter(p=>p.opacity>.9).length===1,idle.poses);
  check(r,'automatic return ends at left edge on the final pose',r.parked.rect.x>=-1&&r.parked.rect.x<=1&&r.parked.dataset.frame==='4'&&idle.dataset.frame==='4'&&Math.abs(idle.rect.x-r.parked.rect.x)<1,{parked:r.parked.character,rect:r.parked.rect,idle:idle.character});
  check(r,'sprite has the reference responsive size and stays on the floor',Math.abs(idle.rect.width-(c.touch?70:80))<.1&&Math.abs(idle.rect.bottom-c.height)<1,idle.rect);
  timingReview(r,await page.evaluate(()=>__fullCharacterQA.frames),c.reduced);
  check(r,'parked character stops its animation loop',!idle.character.animating,idle.character);
  if(!c.reduced){await page.waitForFunction(()=>document.getElementById('loader-walker')?.dataset.hint==='true',{},{timeout:4000});await page.waitForTimeout(250);const hint=await page.locator('.walker-scroll').evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),src:el.querySelector('img').currentSrc}));check(r,'parked scroll hint uses the correct desktop or touch asset',hint.opacity>0&&hint.src.endsWith(c.touch?'/swipe.webp':'/scroll.webp'),hint)}
  await languageReview(page,r,c.touch);
  if(c.touch){
   const before=await page.evaluate(snapshot);await hold(page,'d',300);await page.keyboard.press('Space');await page.waitForTimeout(200);const after=await page.evaluate(snapshot);check(r,'coarse-pointer phone has no keyboard game',Math.abs(after.rect.x-before.rect.x)<1&&Math.abs(after.rect.y-before.rect.y)<1&&!after.character.activated&&!after.character.keyboardEnabled,{before:before.character,after:after.character});
   await page.setViewportSize({width:320,height:568});await page.waitForTimeout(200);const small=await page.evaluate(snapshot);check(r,'small phone retains 70px figure inside viewport',small.rect.width===70&&small.rect.x>=-1&&small.rect.right<=321&&small.rect.bottom<=569,small.rect);
   await page.locator('#enter-work').click();await page.waitForFunction(()=>portfolioEntry.mode==='work');await settle(page,null);check(r,'phone can enter Work and hides character',!(await page.evaluate(snapshot)).visible);
  }else if(c.reduced){await blurFocus(page);const before=await page.evaluate(snapshot),after=await hold(page,'d',220);check(r,'reduced motion retains intentional keyboard movement with static pose',after.rect.x-before.rect.x>40&&after.dataset.frame==='4',{before:before.character,after:after.character});await jump(page,r,'Space',true);for(const key of ['w','ArrowUp','Space']){await page.waitForTimeout(95);await jump(page,r,key,false)}}
  else{await keyboardReview(page,r);await workReview(page,r)}
  r.audit=await page.evaluate(()=>__fullCharacterQA);const platformFrames=r.audit.frames.filter(f=>f.character?.onPlatform);r.platformObservation={frames:platformFrames.length,platforms:[...new Set(platformFrames.map(f=>String(f.character.onPlatform)))],note:platformFrames.length?'Observed platform support during user-input traversal.':'No platform landing occurred during this traversal; see recorded real-object collision jump and geometry rather than assuming a reachable top surface.'};
  check(r,'no legacy loader media requested',r.oldMediaRequests.length===0,r.oldMediaRequests);
  check(r,'no browser exceptions or HTTP errors',r.errors.length===0&&r.httpFailures.length===0,{errors:r.errors,http:r.httpFailures});
 }catch(error){r.failure=error.stack;check(r,'scenario completes',false,error.message);try{r.last=await page.evaluate(snapshot);r.audit=await page.evaluate(()=>__fullCharacterQA);await page.screenshot({path:path.join(out,c.name+'-failure.png')})}catch{}}
 finally{await page.close();r.passed=r.assertions.every(a=>a.passed);report.cases.push(r);save();console.log(`${r.passed?'PASS':'FAIL'} ${c.name}: ${r.assertions.filter(a=>a.passed).length}/${r.assertions.length}`);for(const failure of r.assertions.filter(a=>!a.passed))console.log(JSON.stringify(failure))}
}
(async()=>{fs.mkdirSync(out,{recursive:true});if(!selected.length)throw Error('No matching scenarios');assetReview();const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const c of selected)await run(browser,c)}finally{await browser.close()}report.completedAt=new Date().toISOString();report.sourceChangedDuringRun=sourceNames.filter(name=>{const file=path.join(site,name);return fs.existsSync(file)&&report.sourceHashes[name]!==digest(fs.readFileSync(file))});report.summary={scenarios:report.cases.length,passed:report.cases.filter(c=>c.passed).length,assertions:report.cases.reduce((n,c)=>n+c.assertions.length,0),assetMatches:report.assets.filter(a=>a.passed).length,assetCount:report.assets.length,failures:report.cases.flatMap(c=>c.assertions.filter(a=>!a.passed).map(a=>({scenario:c.name,...a}))),errors:report.cases.flatMap(c=>c.errors),sourceChangedDuringRun:report.sourceChangedDuringRun};save();console.log(JSON.stringify(report.summary,null,2));if(report.summary.failures.length||report.assets.some(a=>!a.passed))process.exitCode=1})().catch(error=>{report.fatal=error.stack;save();console.error(error);process.exitCode=1});
