const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const dir=__dirname,results={};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});
for(const mode of ['desktop','touch','reduced']){
 const p=await browser.newPage(mode==='touch'?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:960},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
 const errors=[];p.on('pageerror',error=>errors.push(error.message));
 await p.goto('http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>portfolioEntry?.ready&&portfolioEntry.mode==='home');
 await p.waitForTimeout(600);
 const r=results[mode]={errors};
 r.start=await p.evaluate(()=>({mode:portfolioEntry.mode,nav:portfolioNav.getState(),width:innerWidth,docWidth:document.documentElement.scrollWidth}));
 if(mode!=='touch'){
  await p.locator('#process-control').hover();
  r.process=await p.evaluate(async()=>{const start=performance.now(),out=[];for(let i=0;i<5;i++){await new Promise(r=>setTimeout(r,120));const node=document.querySelector('.studio-process-mark');out.push({time:performance.now()-start,...portfolioNav.getState(),width:getComputedStyle(node).width,height:getComputedStyle(node).height})}return out});
  await p.locator('#nav-contact').hover();
  r.heart=await p.evaluate(async()=>{const start=performance.now(),out=[];for(let i=0;i<35;i++){await new Promise(r=>setTimeout(r,25));out.push({time:performance.now()-start,transform:document.querySelector('.studio-heart').style.transform,...portfolioNav.getState()})}return out});
  await p.screenshot({path:path.join(dir,mode+'-heart.png')});
  await p.mouse.move(700,650);await p.waitForTimeout(600);
  r.afterHeart=await p.evaluate(()=>portfolioNav.getState());
 }
 await p.mouse.click(10,200);
 await p.waitForTimeout(90);
 r.burst=await p.evaluate(()=>[...document.querySelectorAll('.studio-click-burst')].map(e=>({src:e.src,opacity:getComputedStyle(e).opacity,scale:getComputedStyle(e).scale,box:e.getBoundingClientRect().toJSON()})));
 await p.screenshot({path:path.join(dir,mode+'-click.png')});
 await p.waitForTimeout(350);
 r.afterBurst=await p.locator('.studio-click-burst').count();
 await p.locator('#work-toggle').click({noWaitAfter:true});
 r.earlyBack=await p.evaluate(async()=>{const start=performance.now(),out=[];for(let i=0;i<8;i++){const button=document.querySelector('#studio-back');out.push({time:performance.now()-start,mode:portfolioEntry.mode,target:document.body.dataset.entryTarget,pending:portfolioEntry.pending,visible:!button.hidden,opacity:getComputedStyle(button).opacity});await new Promise(r=>setTimeout(r,20))}return out});
 await p.screenshot({path:path.join(dir,mode+'-early-back.png')});
 const back=await p.locator('#studio-back').boundingBox();if(back)await p.mouse.click(back.x+back.width/2,back.y+back.height/2);
 await p.waitForTimeout(1800);
 r.cancelled=await p.evaluate(()=>({mode:portfolioEntry.mode,nav:portfolioNav.getState(),body:document.body.dataset,animations:document.querySelector('#work-toggle').getAnimations().length}));
 await p.screenshot({path:path.join(dir,mode+'-returned.png')});
 await p.close();
}
await browser.close();fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{errors:v.errors,processAngles:v.process?.map(x=>x.processAngle),heartMinMax:v.heart?[Math.min(...v.heart.map(x=>+(x.transform.match(/[\d.]+/)?.[0]||1))),Math.max(...v.heart.map(x=>+(x.transform.match(/[\d.]+/)?.[0]||1)))]:null,burst:v.burst.length,afterBurst:v.afterBurst,earlyBack:v.earlyBack,cancelled:v.cancelled.mode,overflow:v.start.docWidth-v.start.width}]))));
})().catch(error=>{console.error(error);process.exitCode=1});
