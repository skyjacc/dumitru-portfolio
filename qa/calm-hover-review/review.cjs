'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const site=path.resolve(__dirname,'../../site');
const keys=['andra','btb','fkd','ora','bonanza'];
const files=new Map();
for(const relative of fs.readdirSync(site,{recursive:true})){
 const file=path.join(site,relative);
 if(/\.(js|css|html|json|svg)$/.test(relative)&&fs.statSync(file).isFile())files.set(file,fs.readFileSync(file));
}
const exact=(source,from,to)=>{if(source.split(from).length!==2)throw Error('Expected one instrumentation anchor: '+from);return source.replace(from,to)};
async function instrument(page){
 await page.route('http://127.0.0.1:8943/**',async route=>{
  const url=new URL(route.request().url()),relative=decodeURIComponent(url.pathname),file=path.join(site,relative==='/'?'index.html':relative);
  let body=files.get(file);
  if(!body)return route.continue();
  const name=path.basename(file);
  if(name==='1l2px902fb04m.js'){
   body=exact(body.toString(),'function N(e,r,a,s,c,p,f,m){','function N(e,r,a,s,c,p,f,m){window.__qaDrawnPlanes=[];window.__qaPlaneFrame=(window.__qaPlaneFrame||0)+1;window.__qaPlaneAt=performance.now();');
   body=exact(body,'f(i[a],y,x);','window.__qaDrawnPlanes.push({key:t.key,index:a,geometry:{...y}});f(i[a],y,x);');
  }else if(name==='0n9xfy8bxft48.js'){
   body=exact(body.toString(),'const snapshot=()=>{',`window.__qaCalmState=()=>({camera:{...rh.current},shown:{...rn.current},focusedKey:rb.current,moving:!!rM.current,fitScale:(0,s.fitScale)()});window.__qaWake=()=>{(0,C.wake)()};window.__qaPointer=(x,y)=>tI.current?.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,pointerType:'mouse',bubbles:true}));window.__qaProjectPoints=()=>u.BOARD_PROJECTS.filter(p=>p.portfolioCase).map(p=>{const s1=(0,d.pinToScreen)(rn.current,p.pin),v=(0,s.warp)(s1.x,s1.y),k=(0,s.fitScale)();return{key:p.key,x:(v.x-i.SCREEN.w/2)*k+innerWidth/2,y:(v.y-i.SCREEN.h/2)*k+innerHeight/2}});const snapshot=()=>{`);
  }else if(name==='3xdxgfbw-wtd7.js'){
   body=exact(body.toString(),'V.draw(e_,u),eD("lift",et.v)',`window.__qaStickerPoses??={},window.__qaStickerFrames??={},window.__qaStickerFrames[e]=(window.__qaStickerFrames[e]||0)+1,window.__qaStickerPoses[e]={pose:{...e_},shape:{...u},text:{...J},frame:window.__qaStickerFrames[e],at:performance.now()},V.draw(e_,u),eD("lift",et.v)`);
   body=exact(body,'let ez=()=>{ek(),eF()};',`window.__qaStickerDraw??={};window.__qaStickerDraw[e]=eF;window.__qaStickerHover??={};window.__qaStickerHover[e]=active=>k.dispatchEvent(new PointerEvent(active?'pointerenter':'pointerleave',{pointerType:'mouse',bubbles:false}));let ez=()=>{ek(),eF()};`);
  }
  return route.fulfill({body,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]});
 });
}
const nav=(page,detail)=>page.evaluate(detail=>{
 if(window.portfolioEntry&&detail.action==='overview')return window.portfolioEntry.enterWork();
 if(window.portfolioEntry&&detail.key&&detail.key!=='home')return window.portfolioEntry.open(detail.key);
 return window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail}));
},detail);
async function settled(page,key){await page.waitForTimeout(120);await page.waitForFunction(key=>window.portfolioRuntime?.ready&&!window.portfolioRuntime.moving&&(key===undefined||window.portfolioRuntime.focusedKey===key),key,{timeout:20000});await page.waitForTimeout(900)}
function flatten(value,prefix='',out={}){
 if(typeof value==='number'&&Number.isFinite(value))out[prefix]=value;
 else if(value&&typeof value==='object')for(const [key,item]of Object.entries(value))flatten(item,prefix?prefix+'.'+key:key,out);
 return out;
}
function ranges(samples,selector){
 const all=samples.map(selector).filter(Boolean).map(value=>flatten(value)),names=[...new Set(all.flatMap(Object.keys))],result={};
 for(const name of names){const values=all.map(item=>item[name]).filter(Number.isFinite);result[name]={min:Math.min(...values),max:Math.max(...values),range:Math.max(...values)-Math.min(...values)}}
 return result;
}
function maxRange(values){return Math.max(0,...Object.values(values).map(value=>value.range))}
function summarize(label,samples,scene){
 const selectedKeys=scene==='btb'?['btb']:keys;
 const planes={};
 for(const key of selectedKeys){
  const ids=[...new Set(samples.flatMap(sample=>sample.planes.filter(plane=>plane.key===key&&plane.geometry.alpha>.01).map(plane=>plane.index)))];
  for(const index of ids){const get=sample=>sample.planes.find(plane=>plane.key===key&&plane.index===index&&plane.geometry.alpha>.01)?.geometry;
   const geometry=ranges(samples,sample=>{const box=get(sample);return box?Object.fromEntries(['dx','dy','w','h','angle','alpha','dim'].map(k=>[k,box[k]])):null});
   planes[key+':'+index]={sampleCount:samples.filter(sample=>get(sample)).length,geometry,maxGeometryRange:maxRange(geometry)};
  }
 }
 const camera=ranges(samples,s=>s.state.camera),shown=ranges(samples,s=>s.state.shown);
 const stickers={};
 for(const kind of ['help','work']){
  const pose=ranges(samples,s=>s.stickers[kind]?.pose),shape=ranges(samples,s=>s.stickers[kind]?.shape),text=ranges(samples,s=>s.stickers[kind]?.text);
  stickers[kind]={pose,shape,text,faceValues:[...new Set(samples.map(s=>s.stickers[kind]?.text.face))],drawFrames:new Set(samples.map(s=>s.stickers[kind]?.frame)).size,maxGeometryRange:Math.max(maxRange(pose),maxRange(shape)),maxTextRange:maxRange(text)};
 }
 const passed=samples.length>20&&new Set(samples.map(s=>s.planeFrame)).size>20&&selectedKeys.every(key=>Object.keys(planes).some(id=>id.startsWith(key+':')))&&maxRange(camera)<1e-8&&maxRange(shown)<1e-8&&Object.values(planes).every(p=>p.maxGeometryRange<1e-8)&&Object.values(stickers).every(s=>s.drawFrames>20&&s.maxGeometryRange<1e-8&&s.maxTextRange<1e-8&&s.faceValues.length===1);
 return{label,scene,samples:samples.length,planeDrawFrames:new Set(samples.map(s=>s.planeFrame)).size,camera,shown,planes,stickers,passed};
}
async function capture(page,label,scene,moving=false){
 const points=await page.evaluate(()=>window.__qaProjectPoints());
 await page.evaluate(()=>{window.__qaSamples=[];window.__qaCapturePromise=new Promise(resolve=>{const start=performance.now();function tick(now){window.__qaWake();for(const draw of Object.values(window.__qaStickerDraw||{}))draw();window.__qaSamples.push({t:now,state:window.__qaCalmState(),planeFrame:window.__qaPlaneFrame,planes:structuredClone(window.__qaDrawnPlanes||[]),stickers:structuredClone(window.__qaStickerPoses||{})});if(now-start>=1900){resolve(window.__qaSamples);return}requestAnimationFrame(tick)}requestAnimationFrame(tick)})});
 if(moving){
  const {width,height}=page.viewportSize(),pathPoints=scene==='overview'?points:[{x:width*.25,y:height*.25},{x:width*.75,y:height*.25},{x:width*.75,y:height*.7},{x:width*.25,y:height*.7}];
  for(let i=0;i<46;i++){const a=pathPoints[i%pathPoints.length],b=pathPoints[(i+1)%pathPoints.length];await page.evaluate(({x,y})=>window.__qaPointer(x,y),{x:a.x+(b.x-a.x)*((i%5)/4),y:a.y+(b.y-a.y)*((i%5)/4)});await page.waitForTimeout(30)}
 }
 const samples=await page.evaluate(()=>window.__qaCapturePromise);
 const result=summarize(label,samples,scene);
 fs.writeFileSync(path.join(__dirname,label+'.json.gz'),zlib.gzipSync(JSON.stringify({result,samples})));
 return result;
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report={generatedAt:new Date().toISOString(),method:'Browser-routed source instrumentation only; synthetic mouse hover at both viewport sizes. Captures pre-draw geometry, displayed camera, and actual V.draw mesh/text inputs. Five cases in overview; BTB material zero in focus.',runs:[],errors:[]};
 try{
  for(const [width,height]of[[1440,900],[390,844]])for(const reduced of [false,true]){
   const name=`${width}-${reduced?'reduced':'normal'}`,run={name,viewport:{width,height},reducedMotion:reduced,checks:[]};report.runs.push(run);
   const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500,reducedMotion:reduced?'reduce':'no-preference'});
   page.on('pageerror',error=>report.errors.push({run:name,message:error.message}));
   await instrument(page);await page.goto('http://127.0.0.1:8943');await page.waitForFunction(()=>window.portfolioRuntime?.ready&&window.__qaStickerDraw?.help&&window.__qaStickerDraw?.work&&(!window.portfolioEntry||window.portfolioEntry.ready)&&!document.getElementById('studio-loader'));
   await nav(page,{action:'overview'});await settled(page,null);
   await page.evaluate(()=>{__qaPointer(innerWidth/2,innerHeight/2);__qaStickerHover.help(false);__qaStickerHover.work(false)});await page.waitForTimeout(900);
   run.checks.push(await capture(page,name+'-overview-stationary','overview'));
   run.checks.push(await capture(page,name+'-overview-moving','overview',true));
   await page.evaluate(()=>{__qaStickerHover.help(true);__qaStickerHover.work(true)});await page.waitForTimeout(900);
   run.checks.push(await capture(page,name+'-stickers-hover-stationary','overview'));
   run.checks.push(await capture(page,name+'-stickers-hover-moving','overview',true));
   await page.screenshot({path:path.join(__dirname,name+'-overview.png')});
   await page.evaluate(()=>{__qaStickerHover.help(false);__qaStickerHover.work(false)});
   await nav(page,{key:'btb'});await settled(page,'btb');await nav(page,{action:'material',index:0});await page.waitForTimeout(900);
   run.checks.push(await capture(page,name+'-btb-stationary','btb'));
   run.checks.push(await capture(page,name+'-btb-moving','btb',true));
   await page.screenshot({path:path.join(__dirname,name+'-btb.png')});
   const beforeHelp=await page.evaluate(()=>({...portfolioRuntime.camera}));
   await page.locator('[data-help-sticker] span').dispatchEvent('click',{detail:0});await page.waitForFunction(()=>portfolioRuntime.helpOpen);await page.waitForTimeout(850);
   const opened=await page.evaluate(()=>({helpOpen:portfolioRuntime.helpOpen,camera:portfolioRuntime.camera,flip:__qaStickerPoses.help.shape.roll}));
   const help=page.locator('[data-help-sticker] span');await help.dispatchEvent('pointerdown',{button:0,pointerType:'mouse',bubbles:true});await help.dispatchEvent('pointerup',{button:0,pointerType:'mouse',bubbles:true});await help.dispatchEvent('click',{detail:1,button:0});
   await page.waitForFunction(()=>!portfolioRuntime.helpOpen);await page.waitForTimeout(850);
   const closed=await page.evaluate(()=>({helpOpen:portfolioRuntime.helpOpen,camera:portfolioRuntime.camera,flip:__qaStickerPoses.help.shape.roll}));
   run.help={beforeHelp,opened,closed,passed:opened.helpOpen&&!closed.helpOpen&&opened.flip===1&&closed.flip===0&&['x','y','zoom'].every(key=>beforeHelp[key]===opened.camera[key]&&beforeHelp[key]===closed.camera[key])};
   run.passed=run.checks.every(check=>check.passed)&&run.help.passed;
   await page.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));
   console.log(JSON.stringify({run:name,passed:run.passed,checks:run.checks.map(check=>({label:check.label,passed:check.passed,draws:check.planeDrawFrames,maxPlaneRange:Math.max(0,...Object.values(check.planes).map(p=>p.maxGeometryRange)),maxStickerRange:Math.max(...Object.values(check.stickers).map(p=>p.maxGeometryRange))})),help:run.help.passed}));
  }
 }finally{await browser.close();report.passed=report.errors.length===0&&report.runs.length===4&&report.runs.every(run=>run.passed);fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2))}
 if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
