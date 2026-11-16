const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const label=process.argv[2]||'after',out=path.join(__dirname,label);fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8943/');
 await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
 async function sample(name){
  const state=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,body:document.body.dataset.entry,native:window.portfolioRuntime?.mode,focused:window.portfolioRuntime?.focusedKey,camera:{...window.portfolioRuntime?.camera},home:{bg:getComputedStyle(document.querySelector('#studio-home')).backgroundColor,opacity:getComputedStyle(document.querySelector('#studio-home')).opacity},canvasOpacity:getComputedStyle(document.querySelector('#portfolio-root')).opacity,process:portfolioProcess.getState()}));
  samples.push({name,...state});await page.screenshot({path:path.join(out,name+'.png'),scale:'css'});
 }
 async function transition(name,action){await page.evaluate(action);let previous=0;for(const at of [0,160,400,700,1100,1800]){await page.waitForTimeout(at-previous);previous=at;await sample(name+'-'+at)}}
 await transition('home-work',()=>portfolioEntry.enterWork());
 await transition('work-process',()=>portfolioEntry.open('process'));
 await transition('process-work',()=>portfolioEntry.enterWork());
 await transition('work-detail',()=>portfolioEntry.open('ora'));
 await transition('detail-process',()=>portfolioEntry.open('process'));
 await transition('process-back',()=>portfolioEntry.back());
 fs.writeFileSync(path.join(out,'states.json'),JSON.stringify({samples,errors},null,2));
 console.log(JSON.stringify({label,samples:samples.length,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
