const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const mode=process.argv[2]||'before',out=__dirname;
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:900}}); const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{
 window.__charProbe={canvas:[],loaf:[],frames:[],events:[]};
 for(const method of ['drawImage','getImageData']){const real=CanvasRenderingContext2D.prototype[method];CanvasRenderingContext2D.prototype[method]=function(...args){const start=performance.now();try{return real.apply(this,args)}finally{if(this.canvas.width===64&&this.canvas.height===64)__charProbe.canvas.push({method,start,duration:performance.now()-start})}}}
 if(PerformanceObserver.supportedEntryTypes.includes('long-animation-frame'))new PerformanceObserver(l=>__charProbe.loaf.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration,scripts:e.scripts.map(s=>({url:s.sourceURL,duration:s.duration}))})))).observe({type:'long-animation-frame',buffered:true});
 for(const ev of ['portfolio:deskready','portfolio:characterparked'])addEventListener(ev,()=>__charProbe.events.push({ev,t:performance.now()}));
 let last=0;function frame(t){if(last)__charProbe.frames.push({t,gap:t-last});last=t;requestAnimationFrame(frame)}requestAnimationFrame(frame);
});
await p.goto('http://127.0.0.1:8943/?char-probe='+mode,{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>portfolioLoader?.getState().phase==='complete');
await p.waitForFunction(()=>portfolioCharacter?.getState().maskCount===9);
await p.waitForTimeout(800);
const data=await p.evaluate(()=>({probe:__charProbe,state:portfolioCharacter.getState()}));
data.errors=errors;data.mode=mode;fs.writeFileSync(path.join(out,mode+'.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({mode,maskCount:data.state.maskCount,canvasCalls:data.probe.canvas,characterLoafs:data.probe.loaf.filter(f=>f.scripts.some(s=>s.url.includes('character-runtime'))),errors},null,2));
await b.close();})().catch(e=>{console.error(e);process.exitCode=1});
