'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const qa=path.resolve(__dirname,'../qa/sigil-motion/runtime');fs.mkdirSync(qa,{recursive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report={errors:[],consoleErrors:[],views:[],checks:[]};
 const makePage=async(viewport,mode='normal')=>{
  const page=await browser.newPage({viewport,deviceScaleFactor:1,reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  page.on('pageerror',error=>report.errors.push({mode,error:error.message}));
  page.on('console',message=>{if(message.type()==='error')report.consoleErrors.push({mode,error:message.text()})});
  await page.addInitScript(mode=>{
   window.__sigilQA={videos:[],canvasDraws:0,readbacks:0,uploads:0};
   const make=Document.prototype.createElement;
   Document.prototype.createElement=function(tag,...args){const el=make.call(this,tag,...args);if(String(tag).toLowerCase()==='video')window.__sigilQA.videos.push(el);return el};
   const draw=CanvasRenderingContext2D.prototype.drawImage,read=CanvasRenderingContext2D.prototype.getImageData;
   CanvasRenderingContext2D.prototype.drawImage=function(source,...args){this.__sigilDraw=source?.dataset?.portfolioSigil==='1';if(this.__sigilDraw)window.__sigilQA.canvasDraws++;return draw.call(this,source,...args)};
   CanvasRenderingContext2D.prototype.getImageData=function(...args){if(this.__sigilDraw)window.__sigilQA.readbacks++;return read.apply(this,args)};
   for(const name of ['texImage2D','texSubImage2D']){const native=WebGL2RenderingContext.prototype[name];WebGL2RenderingContext.prototype[name]=function(...args){if(args.some(arg=>arg?.dataset?.portfolioSigil==='1'))window.__sigilQA.uploads++;return native.apply(this,args)}}
   if(mode==='denied')HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('QA denied play','NotAllowedError'))};
   if(mode==='canvas'){const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl'||type==='experimental-webgl')return null;return get.call(this,type,...args)}}
  },mode);
  return page;
 };
 const state=page=>page.evaluate(()=>({runtime:window.portfolioRuntime,stats:{canvasDraws:__sigilQA.canvasDraws,readbacks:__sigilQA.readbacks,uploads:__sigilQA.uploads},videos:__sigilQA.videos.filter(v=>v.dataset.portfolioSigil==='1').map(v=>({paused:v.paused,currentTime:v.currentTime,readyState:v.readyState,width:v.videoWidth,height:v.videoHeight,muted:v.muted,loop:v.loop,inline:v.playsInline,error:v.error?.message||null,seeking:v.seeking}))}));
 const settled=page=>page.waitForFunction(()=>window.portfolioRuntime?.ready&&!window.portfolioRuntime.moving,null,{timeout:30000});
 const capture=async(page,name)=>{await page.screenshot({path:path.join(qa,name+'.png')});return name+'.png'};
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await makePage(viewport);
  await page.goto('http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});await settled(page);
  await page.waitForFunction(()=>window.__sigilQA?.videos.some(v=>v.dataset.portfolioSigil==='1'&&v.currentTime>.2),null,{timeout:25000});await page.waitForTimeout(2500);
  const a=await state(page),screenshot=await capture(page,viewport.width+'-motion');await page.waitForTimeout(1100);const b=await state(page);
  report.views.push({viewport,playing:b.videos[0]?.currentTime!==a.videos[0]?.currentTime,video:b.videos[0],stats:b.stats,screenshot});
  if(viewport.width===1440){
   await page.evaluate(()=>{const v=__sigilQA.videos.find(v=>v.dataset.portfolioSigil==='1');v.currentTime=7.70});await page.waitForTimeout(600);const loop=await state(page);
   report.checks.push({mode:'loop',time:loop.videos[0].currentTime,playing:!loop.videos[0].paused,stats:loop.stats});await capture(page,'1440-after-loop');
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key:'fkd'}})));await settled(page);await page.waitForTimeout(1000);const away=await state(page);
   report.checks.push({mode:'offscreen',video:away.videos[0],camera:away.runtime.camera});
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'return'}})));await settled(page);await page.waitForTimeout(900);const back=await state(page);
   report.checks.push({mode:'return',video:back.videos[0]});
   await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(330,300);await page.waitForTimeout(800);const reduced=await state(page);
   report.checks.push({mode:'live-reduced',video:reduced.videos[0],screenshot:await capture(page,'1440-live-reduced')});
  }
  await page.close();
 }
 for(const mode of ['reduced','denied','canvas','delayed']){
  const page=await makePage({width:390,height:844},mode);let requests=0;
  if(mode==='delayed')await page.route('**/hero/sigil-loop.mp4',async route=>{requests++;await pause(15000);try{await route.continue()}catch{}});
  await page.goto('http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});await settled(page);await page.waitForTimeout(3000);
  const current=await state(page);report.checks.push({mode,video:current.videos[0]||null,stats:current.stats,requests,ready:current.runtime.ready,screenshot:await capture(page,'390-'+mode)});await page.close();
 }
 fs.writeFileSync(path.join(qa,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
