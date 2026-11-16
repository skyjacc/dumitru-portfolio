const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');const out=__dirname;
(async()=>{
 const runs=[];
 for(const test of [
  {name:'chrome-desktop',engine:chromium,viewport:{width:1280,height:800}},
  {name:'chrome-mobile',engine:chromium,viewport:{width:390,height:844}},
  {name:'webkit-mobile',engine:webkit,viewport:{width:390,height:844}},
  {name:'canvas2d-reduced',engine:chromium,viewport:{width:390,height:844},reduced:true,fallback:true}
 ]){
  const browser=await test.engine.launch({headless:true,...(test.engine===chromium?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:test.viewport,isMobile:test.viewport.width<500,hasTouch:test.viewport.width<500,reducedMotion:test.reduced?'reduce':'no-preference'});
  if(test.fallback)await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return ['webgl','webgl2','experimental-webgl'].includes(type)?null:original.call(this,type,...args)}});
  const checks=[],errors=[];page.on('pageerror',e=>{if(!errors.includes(e.stack||e.message))errors.push(e.stack||e.message)});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:20000});
  try{
   await page.goto('http://127.0.0.1:8943/?v=continuous-field');
   await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
   await page.evaluate(()=>portfolioEntry.enterWork());await settle('work');
   await page.evaluate(()=>document.querySelector('canvas').dispatchEvent(new WheelEvent('wheel',{deltaY:-120,clientX:innerWidth*.5,clientY:innerHeight*.5,bubbles:true,cancelable:true})));await page.waitForTimeout(750);
   const before=await page.evaluate(()=>({...portfolioRuntime.camera}));
   const trace=await page.evaluate(async()=>{
    const frames=[];const started=performance.now();portfolioEntry.open('process');
    await new Promise(resolve=>{const frame=now=>{const panel=document.querySelector('#studio-process');frames.push({at:now-started,mode:portfolioEntry.mode,opacity:Number(getComputedStyle(document.querySelector('#portfolio-root')).opacity),deskBackground:getComputedStyle(document.querySelector('#studio-home')).backgroundColor,panelVisible:!panel.hidden,panelOpacity:Number(getComputedStyle(panel).opacity)});if(now-started<1100)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});
    return frames;
   });
   await settle('process');
   checks.push({name:'transparent studio throughout Work to Process',pass:trace.every(f=>f.deskBackground==='rgba(0, 0, 0, 0)')});
   checks.push({name:'Process begins before canvas disappears',pass:test.reduced||trace.some(f=>f.panelVisible&&f.opacity>.01)});
   checks.push({name:'compositor opacity has intermediate values',pass:test.reduced||trace.some(f=>f.opacity>.05&&f.opacity<.95)});
   const reverse=await page.evaluate(async()=>{
    const frames=[],started=performance.now();portfolioEntry.enterWork();
    await new Promise(resolve=>{const frame=now=>{const panel=document.querySelector('#studio-process');frames.push({at:now-started,mode:portfolioEntry.mode,opacity:Number(getComputedStyle(document.querySelector('#portfolio-root')).opacity),panelVisible:!panel.hidden,panelOpacity:Number(getComputedStyle(panel).opacity)});if(now-started<1100)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});return frames;
   });
   await settle('work');const after=await page.evaluate(()=>({...portfolioRuntime.camera}));
   checks.push({name:'Work camera retained through Process',pass:['x','y','zoom'].every(k=>Math.abs(before[k]-after[k])<.01),before,after});
   checks.push({name:'Process fades before hidden',pass:test.reduced||reverse.some(f=>f.panelVisible&&f.panelOpacity>.05&&f.panelOpacity<.95)});
   await page.evaluate(()=>portfolioEntry.open('ora'));await settle('detail');await page.waitForTimeout(650);
   await page.screenshot({path:path.join(out,test.name+'-detail.png'),scale:'css'});
   checks.push({name:'detail uniform viewport background',pass:await page.evaluate(()=>getComputedStyle(document.body).backgroundColor==='rgb(8, 8, 8)'&&getComputedStyle(document.querySelector('#studio-home')).backgroundColor==='rgba(0, 0, 0, 0)')});
   await page.evaluate(()=>portfolioEntry.open('process'));await settle('process');
   await page.evaluate(()=>portfolioEntry.back());await settle('detail');
   checks.push({name:'Process Back returns to project',pass:await page.evaluate(()=>portfolioRuntime.focusedKey==='ora'&&!portfolioProcess.getState().visible)});
   await page.evaluate(()=>portfolioEntry.showHome());await settle('home');await page.waitForTimeout(750);
   await page.evaluate(()=>portfolioEntry.open('process'));await settle('process');await page.evaluate(()=>portfolioEntry.back());await settle('home');await page.waitForTimeout(750);
   checks.push({name:'Home Process Back enables composition',pass:await page.evaluate(()=>portfolioComposition.getState().enabled===true)});
   fs.writeFileSync(path.join(out,test.name+'-trace.json'),JSON.stringify({trace,reverse},null,2));
  }catch(e){errors.push(String(e))}
  checks.push({name:'no runtime errors',pass:!errors.length,errors});runs.push({name:test.name,checks});await browser.close();
 }
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(runs,null,2));const checks=runs.flatMap(r=>r.checks);console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
