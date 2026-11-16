const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {site,settle,equalCamera}=require('../open-close-review/helpers.cjs');
const origin='http://127.0.0.1:8943',out=__dirname;
const names=['notebook','phone','airpods','laptop','pack','pen','lighter','cable','receipt'];
const cases=[
 {name:'desktop-1440',width:1440,height:900,flows:true,languages:true},
 {name:'desktop-1920',width:1920,height:1080},
 {name:'desktop-2560',width:2560,height:1440},
 {name:'phone-390',width:390,height:844,touch:true,flows:true,languages:true},
 {name:'phone-320',width:320,height:568,touch:true},
 {name:'landscape-844',width:844,height:390,touch:true,flows:true},
 {name:'reduced-motion',width:1440,height:900,reduced:true},
 {name:'delayed-receipt',width:1440,height:900,delayImage:true},
 {name:'final-desktop-dpr2',width:2560,height:1440,dpr:2,flows:true,final:true},
 {name:'final-phone-dpr2',width:390,height:844,dpr:2,touch:true,flows:true,final:true},
 {name:'final-landscape',width:844,height:390,touch:true,flows:true,final:true}
];
const visualOnly=process.argv.includes('--visual-only'),arg=process.argv.indexOf('--case'),selected=(arg<0?cases:cases.filter(c=>process.argv[arg+1].split(',').includes(c.name))).map(c=>visualOnly?{...c,flows:false,languages:false,visualOnly:true}:c);
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceNames=['index.html','entry-flow.js','entry-flow.css','character-runtime.js'];
const sourceHashes=()=>Object.fromEntries(sourceNames.map(n=>[n,digest(fs.readFileSync(path.join(site,n)))]));
const report={startedAt:new Date().toISOString(),origin,visualOnly,sourceHashes:sourceHashes(),expectedObjects:names,cases:[],notes:['Fresh local server content, no product source edits or runtime state mutation.','The delayed-image scenario postpones one real receipt response, then serves it unchanged.','Alpha-aware layout measurements respect crop/filter output and actual text line bounds; paper object labels must stay clear of neighboring cutouts.']};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
function check(r,name,passed,detail){r.assertions.push({name,passed:!!passed,...detail===undefined?{}:{detail}})}

const view=()=>{
 const root=document.getElementById('studio-home'),native=window.portfolioRuntime,walker=document.getElementById('loader-walker');
 return {t:performance.now(),dpr:devicePixelRatio,mode:document.body.dataset.entry,entryMode:window.portfolioEntry?.mode,loader:window.portfolioLoader?.getState?.(),loaderPresent:!!document.getElementById('studio-loader'),reveal:root?.dataset.paperReveal,revealEvents:window.__paperDeskQA?.events.filter(e=>e.type==='portfolio:deskready').length||0,key:native?.focusedKey,camera:native?.camera?{...native.camera}:null,overview:native?.workOverviewActive,character:window.portfolioCharacter?.getState?.(),walker:{hidden:walker?.hidden,blend:walker&&getComputedStyle(walker).mixBlendMode,frame:walker?.dataset.frame,poseCount:walker?.querySelectorAll('.walker-frame').length},objects:[...document.querySelectorAll('.desk-object[data-desk-object]')].map(el=>{const r=el.getBoundingClientRect(),img=el.querySelector('.desk-cutout>img');return{name:el.dataset.deskObject,tag:el.tagName,key:el.dataset.deskOpen||null,id:el.id,label:el.querySelector('.desk-label')?.textContent.trim(),rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},opacity:Number(getComputedStyle(el).opacity),display:getComputedStyle(el).display,imgCount:el.querySelectorAll('img').length,src:img?.currentSrc,loaded:!!img?.complete&&img.naturalWidth>0,natural:img?{width:img.naturalWidth,height:img.naturalHeight}:null,renderedDeviceWidth:img?img.offsetWidth*devicePixelRatio:null,imageFilter:img?getComputedStyle(img).filter:null,cutoutFilter:img?getComputedStyle(img.parentElement).filter:null}}),animations:root?.getAnimations({subtree:true}).filter(a=>a.playState==='running').map(a=>({name:a.animationName||null,time:a.currentTime}))||[],intro:document.getElementById('studio-title')?.textContent.trim()};
};

// Final-state visible pixels are mapped through the actual CSS transform chain.
const alphaLayout=()=>{
 const rect=r=>({x:r.left,y:r.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom});
 const visible=el=>{for(let n=el;n&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.01)return false}return !!el.getClientRects().length};
 const protectedAreas=[...document.querySelectorAll('#home-control,.portfolio-nav>button,.portfolio-nav>.index-wrap>button,.portfolio-nav>a,#language-control button')].filter(visible).map(el=>({name:el.id||el.className||el.textContent.trim(),...rect(el.getBoundingClientRect())}));
 const intro=document.querySelector('.studio-intro');if(intro&&visible(intro)){const textNodes=document.createTreeWalker(intro,NodeFilter.SHOW_TEXT);while(textNodes.nextNode()){const node=textNodes.currentNode;if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())protectedAreas.push({name:'intro-text:'+node.textContent.trim(),...rect(r)})}}
 const labels=[...document.querySelectorAll('.desk-label>span')].map(el=>{const owner=el.closest('[data-desk-object]').dataset.deskObject,r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2),hitObject=hit?.closest('[data-desk-object]')?.dataset.deskObject;return{name:'label:'+owner,owner,text:el.textContent.trim(),visible:visible(el),coveredBy:hit?.closest('#portfolio-ui')?'navigation':hitObject&&hitObject!==owner?hitObject:null,...rect(r)}});protectedAreas.push(...labels);
 const objects=[...document.querySelectorAll('.desk-object[data-desk-object]')].map(el=>{
  const img=el.querySelector('.desk-cutout>img');if(!img||!img.complete||!img.naturalWidth)return{name:el.dataset.deskObject,loaded:false};
  const canvas=document.createElement('canvas'),scale=96/Math.max(img.naturalWidth,img.naturalHeight);canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const r=img.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2,w=img.offsetWidth,h=img.offsetHeight,cutout=img.parentElement,imgCss=getComputedStyle(img),offsetX=parseFloat(imgCss.left)||0,offsetY=parseFloat(imgCss.top)||0;
  const alphaFilter=getComputedStyle(cutout).filter.includes('desk-paper-alpha'),table=(alphaFilter?document.querySelector('#desk-paper-alpha feFuncA')?.getAttribute('tableValues')||'':'').trim().split(/\s+/).filter(Boolean).map(Number),renderedAlpha=a=>{if(table.length<2)return a;const t=a/255*(table.length-1),i=Math.min(table.length-2,Math.floor(t));return(table[i]+(table[i+1]-table[i])*(t-i))*255};let matrix=new DOMMatrix();for(let node=img;node&&node!==document.documentElement;node=node.parentElement){const t=getComputedStyle(node).transform;if(t&&t!=='none')matrix=new DOMMatrix(t).multiply(matrix)}
  let solid=0,transparent=0,clipped=0,hit=null,best=Infinity;const overlaps={},points=[];
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const a=data[(y*canvas.width+x)*4+3];if(a<16)transparent++;if(renderedAlpha(a)<64)continue;const px=(x+.5)/canvas.width*w,py=(y+.5)/canvas.height*h;if(px+offsetX<-.5||py+offsetY<-.5||px+offsetX>cutout.clientWidth+.5||py+offsetY>cutout.clientHeight+.5)continue;solid++;const lx=px-w/2,ly=py-h/2,sx=cx+matrix.a*lx+matrix.c*ly,sy=cy+matrix.b*lx+matrix.d*ly;points.push({x:sx,y:sy});if(sx<0||sy<0||sx>innerWidth||sy>innerHeight)clipped++;for(const area of protectedAreas)if(area.owner!==el.dataset.deskObject&&sx>area.x&&sx<area.right&&sy>area.y&&sy<area.bottom)overlaps[area.name]=(overlaps[area.name]||0)+1;const distance=Math.hypot(sx-cx,sy-cy);if(distance<best&&document.elementFromPoint(sx,sy)?.closest('[data-desk-object]')===el){best=distance;hit={x:sx,y:sy}}}
  const bounds=points.length?{x:Math.min(...points.map(p=>p.x)),y:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))}:null;
  return{name:el.dataset.deskObject,loaded:true,visible:visible(el),pixelSamples:canvas.width*canvas.height,solid,transparent,transparentFraction:transparent/(canvas.width*canvas.height),clipFraction:clipped/Math.max(1,solid),overlaps:Object.fromEntries(Object.entries(overlaps).map(([k,n])=>[k,n/Math.max(1,solid)])),bounds,hit,button:el.tagName==='BUTTON',source:img.currentSrc};
 });return{viewport:{width:innerWidth,height:innerHeight},protectedAreas,labels,objects};
};

async function observe(page,r,c){
 page.on('pageerror',error=>r.errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)r.httpErrors.push({url:response.url(),status:response.status()});if(/\/hero\/desk\//.test(response.url()))r.assetResponses.push({url:response.url(),status:response.status(),at:Date.now()})});
 page.on('request',request=>{if(/paper-cut-loader\.(mp4|webp)|\/hero\/paper-laptop\.webp/.test(request.url()))r.legacyRequests.push(request.url())});
 if(c.delayImage)await page.route(origin+'/hero/desk/v2/receipt.webp',async route=>{r.delayed={requestedAt:Date.now()};await new Promise(resolve=>setTimeout(resolve,3100));r.delayed.releasedAt=Date.now();await route.continue()});
 await page.addInitScript(()=>{
  window.__paperDeskQA={frames:[],events:[],animationStarts:[]};let last=0;
  for(const type of ['portfolio:entrystate','portfolio:deskready','portfolio:navigate','portfolio:characterparked'])addEventListener(type,e=>__paperDeskQA.events.push({type,t:performance.now(),detail:e.detail}));
  document.addEventListener('animationstart',e=>{if(e.target.closest?.('#studio-home'))__paperDeskQA.animationStarts.push({t:performance.now(),name:e.animationName,object:e.target.closest('[data-desk-object]')?.dataset.deskObject,loaderPresent:!!document.getElementById('studio-loader')})},true);
  function tick(t){if(t-last>30){last=t;const root=document.getElementById('studio-home'),state=window.portfolioLoader?.getState?.();if(root||state){__paperDeskQA.frames.push({t,mode:document.body.dataset.entry,loaderPresent:!!document.getElementById('studio-loader'),loader:state,reveal:root?.dataset.paperReveal,decoded:[...document.querySelectorAll('.desk-cutout>img')].filter(i=>i.complete&&i.naturalWidth>0).length});if(__paperDeskQA.frames.length>7000)__paperDeskQA.frames.splice(0,500)}}requestAnimationFrame(tick)}requestAnimationFrame(tick);
 });
}
async function ready(page){await page.waitForFunction(()=>window.portfolioEntry?.ready&&window.portfolioRuntime?.ready&&!document.getElementById('studio-loader')&&document.getElementById('studio-home')?.dataset.paperReveal==='done',{},{timeout:22000});await page.waitForTimeout(100)}
async function returnHome(page){await page.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioRuntime.focusedKey,{},{timeout:15000});await settle(page,null);await page.waitForTimeout(750)}
async function objectClick(page,name,touch){const object=(await page.evaluate(alphaLayout)).objects.find(o=>o.name===name);if(!object?.hit)throw Error('No exposed clickable opaque pixel for '+name);if(touch)await page.touchscreen.tap(object.hit.x,object.hit.y);else await page.mouse.click(object.hit.x,object.hit.y);return object.hit}
const sameLayout=(before,after)=>before.every(a=>{const b=after.find(b=>b.name===a.name);return b&&['x','y','width','height'].every(k=>Math.abs(a.rect[k]-b.rect[k])<1)});

async function localization(page,r){
 const expected={en:{laptop:'Work',notebook:'Process',phone:'About',phrase:'I make websites.'},ro:{laptop:'Lucrări',notebook:'Proces',phone:'Despre',phrase:'Creez site-uri.'},ru:{laptop:'Работы',notebook:'Процесс',phone:'Обо мне',phrase:'Я создаю сайты.'}};
 for(const locale of ['ro','ru','en']){await page.locator(`#language-control [data-locale="${locale}"]`).click();await page.waitForFunction(locale=>document.documentElement.lang===locale,locale);await page.waitForTimeout(100);const state=await page.evaluate(view),e=expected[locale];check(r,locale.toUpperCase()+' labels and introduction are localized',state.intro.includes(e.phrase)&&['laptop','notebook','phone'].every(n=>state.objects.find(o=>o.name===n)?.label===e[n]),{intro:state.intro,labels:state.objects.filter(o=>o.tag==='BUTTON').map(o=>({name:o.name,label:o.label}))});
  const layout=await page.evaluate(alphaLayout),collisions=layout.objects.filter(o=>Object.values(o.overlaps||{}).some(v=>v>.01));check(r,locale.toUpperCase()+' title navigation and object labels remain clear',collisions.length===0,collisions);if(locale==='ru')await page.screenshot({path:path.join(out,r.name+'-ru.png')});
 }
}

async function navigation(page,r,c){
 const baseline=await page.evaluate(view),start=await page.evaluate(()=>performance.now());
 for(const [object,key]of [['notebook','process'],['phone','despre']]){
  const point=await objectClick(page,object,c.touch);await page.waitForFunction(key=>portfolioEntry.mode==='detail'&&portfolioRuntime.focusedKey===key,key,{timeout:15000});await settle(page,key);const opened=await page.evaluate(view);
  check(r,object+' opens its intended detail view',opened.key===key&&opened.entryMode==='detail'&&opened.walker.hidden,{point,key:opened.key,mode:opened.entryMode});
  await page.locator('#return-control').click();await returnHome(page);const home=await page.evaluate(view);check(r,object+' closes to the identical Home layout without reopening',home.entryMode==='home'&&home.key===null&&sameLayout(baseline.objects,home.objects)&&home.reveal==='done'&&home.revealEvents===1,{mode:home.entryMode,key:home.key,reveal:home.reveal,revealEvents:home.revealEvents,layoutSame:sameLayout(baseline.objects,home.objects)});
 }
 await objectClick(page,'laptop',c.touch);await page.waitForFunction(()=>portfolioEntry.mode==='work'&&portfolioRuntime.focusedKey===null,{},{timeout:15000});await settle(page,null);const before=await page.evaluate(view);check(r,'laptop opens native Work overview',before.entryMode==='work'&&before.overview&&!before.key&&before.walker.hidden,{mode:before.entryMode,key:before.key,overview:before.overview});
 await page.mouse.move(c.width/2,c.height/2);for(let i=0;i<8;i++){await page.mouse.wheel(0,-160);await page.waitForTimeout(65)}await page.waitForTimeout(600);await settle(page,null);const after=await page.evaluate(view);check(r,'Work wheel changes camera while staying in Work',after.entryMode==='work'&&after.key===null&&after.overview&&!equalCamera(before.camera,after.camera),{before:before.camera,after:after.camera,mode:after.entryMode,key:after.key});
 await page.locator('#home-control').click();await returnHome(page);const home=await page.evaluate(view),audit=await page.evaluate(start=>({events:__paperDeskQA.events,animationStarts:__paperDeskQA.animationStarts.filter(e=>e.t>start)}),start);
 check(r,'Work returns to Home without replaying the paper unfold',home.entryMode==='home'&&home.key===null&&sameLayout(baseline.objects,home.objects)&&home.revealEvents===1&&audit.animationStarts.length===0,{mode:home.entryMode,revealEvents:home.revealEvents,layoutSame:sameLayout(baseline.objects,home.objects),newAnimations:audit.animationStarts});
 await page.screenshot({path:path.join(out,r.name+'-returned-home.png')});
}

async function stationaryPointer(page,r){
 const laptop=(await page.evaluate(alphaLayout)).objects.find(o=>o.name==='laptop');if(!laptop?.hit)throw Error('No laptop point for pointer stability test');await page.mouse.move(laptop.hit.x,laptop.hit.y);await page.waitForTimeout(750);const samples=[];for(let i=0;i<7;i++){samples.push(await page.evaluate(view));await page.waitForTimeout(100)}const first=samples[0],maxShift=Math.max(...samples.flatMap(s=>s.objects.map(o=>{const base=first.objects.find(a=>a.name===o.name);return Math.hypot(o.rect.x-base.rect.x,o.rect.y-base.rect.y)})));
 check(r,'stationary pointer leaves all paper objects still',maxShift<.25,{maxShift,samples:samples.length,activeHomeAnimations:samples.at(-1).animations});await page.mouse.move(r.scenario.width-3,r.scenario.height-3);await page.waitForTimeout(300);
}

async function run(browser,c){
 const page=await browser.newPage({viewport:{width:c.width,height:c.height},deviceScaleFactor:c.dpr||1,isMobile:!!c.touch,hasTouch:!!c.touch,reducedMotion:c.reduced?'reduce':'no-preference'}),r={name:c.name,scenario:c,assertions:[],errors:[],httpErrors:[],assetResponses:[],legacyRequests:[]};
 try{
  await observe(page,r,c);await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.portfolioLoader?.getState,{},{timeout:8000});if(!c.reduced){await page.waitForTimeout(550);await page.screenshot({path:path.join(out,c.name+'-loading.png')})}
  await ready(page);r.home=await page.evaluate(view);r.layout=await page.evaluate(alphaLayout);await page.screenshot({path:path.join(out,c.name+'-home.png')});const audit=await page.evaluate(()=>__paperDeskQA),firstReady=audit.frames.find(f=>f.loader?.ready),firstRevealed=audit.frames.find(f=>f.reveal==='running'||f.reveal==='done'),settled=audit.frames.find(f=>f.loader?.resourcesSettled),firstExit=audit.frames.find(f=>f.loader?.phase==='complete');
  check(r,'all nine approved v2 assets are present once and decoded',r.home.objects.length===9&&names.every(n=>r.home.objects.filter(o=>o.name===n).length===1)&&r.home.objects.every(o=>o.loaded&&o.imgCount===1&&o.src.endsWith('/hero/desk/v2/'+o.name+'.webp')),r.home.objects.map(o=>({name:o.name,loaded:o.loaded,natural:o.natural,src:o.src,imgCount:o.imgCount})));
  if(c.final){check(r,'native1254 images render without alpha filters or image upscaling',r.home.objects.every(o=>o.natural.width===1254&&o.natural.height===1254&&o.renderedDeviceWidth<=1255&&o.imageFilter==='none'&&o.cutoutFilter==='none'),r.home.objects.map(o=>({name:o.name,natural:o.natural,renderedDeviceWidth:o.renderedDeviceWidth,imageFilter:o.imageFilter,cutoutFilter:o.cutoutFilter})));check(r,'requested display pixel ratio is active',r.home.dpr===(c.dpr||1),r.home.dpr)}
  check(r,'all nine files are actual transparent cutouts',r.layout.objects.every(o=>o.solid>0&&o.transparentFraction>.01&&o.transparentFraction<.995),r.layout.objects.map(o=>({name:o.name,transparentFraction:o.transparentFraction,solid:o.solid})));
  check(r,'all nine objects remain visible with only minor intended edge cropping',r.layout.objects.every(o=>o.visible&&o.clipFraction<.05),r.layout.objects.filter(o=>!o.visible||o.clipFraction>0));
  const overlaps=r.layout.objects.filter(o=>Object.values(o.overlaps||{}).some(v=>v>.01));check(r,'navigation introduction and object labels stay clear of other opaque objects',overlaps.length===0,overlaps);
  check(r,'Work Process and About labels remain visible inside viewport',r.layout.labels.length===3&&r.layout.labels.every(l=>l.visible&&!l.coveredBy&&l.width>5&&l.height>5&&l.x>=0&&l.y>=0&&l.right<=c.width&&l.bottom<=c.height),r.layout.labels);
  check(r,'exactly laptop notebook and phone are clickable',r.home.objects.filter(o=>o.tag==='BUTTON').map(o=>o.name).sort().join(',')==='laptop,notebook,phone'&&r.layout.objects.filter(o=>o.button).every(o=>o.hit),r.layout.objects.filter(o=>o.button).map(o=>({name:o.name,hit:o.hit})));
  check(r,'loader waits for every desk asset and finishes accounting',firstReady?.decoded===9&&firstReady.loader.resourcesSettled&&r.home.loader.completed===r.home.loader.total&&!r.home.loader.loadingFailed,{firstReady:firstReady?{elapsed:firstReady.loader.elapsed,decoded:firstReady.decoded,completed:firstReady.loader.completed,total:firstReady.loader.total}:null});
  check(r,'paper unfolds only after the actual loader leaves',!!firstRevealed&&!firstRevealed.loaderPresent&&audit.animationStarts.every(e=>!e.loaderPresent),{firstReveal:firstRevealed?{t:firstRevealed.t,reveal:firstRevealed.reveal,loaderPresent:firstRevealed.loaderPresent}:null,firstExit:firstExit?.t,animationStarts:audit.animationStarts});
  check(r,'first Home reveal finishes once without lingering animations',r.home.reveal==='done'&&r.home.revealEvents===1&&r.home.animations.length===0,{reveal:r.home.reveal,events:r.home.revealEvents,animations:r.home.animations});
  if(c.reduced)check(r,'reduced motion skips automatic unfold and extra minimum hold',audit.animationStarts.length===0&&!audit.frames.some(f=>f.reveal==='running')&&firstReady?.loader.elapsed<1800,{animationStarts:audit.animationStarts.length,readyElapsed:firstReady?.loader.elapsed});
  else if(c.delayImage)check(r,'delayed ninth image holds loader beyond the normal minimum',firstReady?.loader.elapsed>=2900&&firstReady?.decoded===9&&r.delayed?.releasedAt-r.delayed?.requestedAt>=3000,{delay:r.delayed,readyElapsed:firstReady?.loader.elapsed});
  else check(r,'normal loading adds no long fixed hold after assets are ready',firstReady&&settled&&firstReady.loader.elapsed>=1975&&firstReady.loader.elapsed-Math.max(2000,settled.loader.elapsed)<400,{resourceElapsed:settled?.loader.elapsed,readyElapsed:firstReady?.loader.elapsed});
  check(r,'original five-pose walker and bubble blending remain intact',r.home.walker.poseCount===5&&r.home.walker.blend==='screen'&&!r.home.walker.hidden,r.home.walker);
  if(!c.touch&&!c.delayImage&&!c.visualOnly)await stationaryPointer(page,r);
  if(c.languages)await localization(page,r);
  if(c.flows)await navigation(page,r,c);
  r.audit=await page.evaluate(()=>__paperDeskQA);check(r,'no old loader or old single-laptop media are requested',r.legacyRequests.length===0,r.legacyRequests);check(r,'no browser exceptions or HTTP errors',r.errors.length===0&&r.httpErrors.length===0,{errors:r.errors,http:r.httpErrors});
 }catch(error){r.failure=error.stack;check(r,'scenario completes',false,error.message);try{r.last=await page.evaluate(view);r.audit=await page.evaluate(()=>__paperDeskQA);await page.screenshot({path:path.join(out,c.name+'-failure.png')})}catch{}}
 finally{await page.close();r.passed=r.assertions.every(a=>a.passed);report.cases.push(r);save();console.log(`${r.passed?'PASS':'FAIL'} ${c.name} ${r.assertions.filter(a=>a.passed).length}/${r.assertions.length}`);for(const a of r.assertions.filter(a=>!a.passed))console.log(JSON.stringify(a))}
}
(async()=>{fs.mkdirSync(out,{recursive:true});if(!selected.length)throw Error('No matching scenarios');const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const c of selected)await run(browser,c)}finally{await browser.close()}report.completedAt=new Date().toISOString();const final=sourceHashes();report.sourceChangedDuringRun=sourceNames.filter(n=>final[n]!==report.sourceHashes[n]);report.summary={scenarios:report.cases.length,passed:report.cases.filter(c=>c.passed).length,assertions:report.cases.reduce((n,c)=>n+c.assertions.length,0),failures:report.cases.flatMap(c=>c.assertions.filter(a=>!a.passed).map(a=>({scenario:c.name,...a}))),sourceChangedDuringRun:report.sourceChangedDuringRun};save();console.log(JSON.stringify(report.summary,null,2));if(report.summary.failures.length)process.exitCode=1})().catch(error=>{report.fatal=error.stack;save();console.error(error);process.exitCode=1});
