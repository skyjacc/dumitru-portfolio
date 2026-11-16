const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true}),checks=[],errors=[];
const check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
try{for(const mobile of [false,true]){
 const c=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto('https://dumitru-spatial-portfolio.vercel.app/?review=process-final');await p.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete');
 await p.locator('#process-control').click();await p.waitForFunction(()=>window.portfolioProcess?.getState().visible);await p.waitForTimeout(1900);
 if(mobile){
  await p.locator('.process-step button').nth(1).tap();await p.waitForTimeout(100);
  const mid=await p.locator('.process-step-description').nth(1).evaluate(e=>e.getBoundingClientRect().height);await p.waitForTimeout(750);
  const end=await p.locator('.process-step-description').nth(1).evaluate(e=>e.getBoundingClientRect().height);
  check('mobile description animates height',mid>0&&end>mid,{mid,end});
  await p.evaluate(()=>location.hash='process-description-3');await p.waitForTimeout(800);
  check('fragment reveals collapsed text',await p.evaluate(()=>portfolioProcess.getState().opened===3&&document.querySelector('#process-description-3').hidden===false));
 }else{
  await p.locator('.process-step').nth(4).hover();await p.waitForTimeout(120);
  const mid=await p.evaluate(()=>({drift:parseFloat(getComputedStyle(document.querySelector('.process-paper-content')).translate.split(' ')[1]),rotation:portfolioProcess.getState().ringRotation}));await p.waitForTimeout(1250);
  const end=await p.evaluate(()=>{const p=document.querySelector('#studio-process').getBoundingClientRect(),h=document.querySelector('#studio-process-title').getBoundingClientRect(),r=document.querySelector('.process-follow-ring').getBoundingClientRect(),n=document.querySelectorAll('.process-step-number')[4].getBoundingClientRect();return {drift:parseFloat(getComputedStyle(document.querySelector('.process-paper-content')).translate.split(' ')[1]),headerVisible:h.top>=p.top-.5,error:Math.hypot(r.x+r.width/2-n.x-n.width/2,r.y+r.height/2-n.y-n.height/2)}});
  check('desktop content moves then settles',mid.drift<0&&mid.drift>-35&&end.drift===-35,{mid,end});
  check('one ring follows fifth number',end.error<1&&mid.rotation===30,end);
  check('heading survives drift',end.headerVisible,end);
 }
 await p.screenshot({path:path.join(__dirname,'public-process-'+(mobile?'mobile':'desktop')+'.png')});
 await p.locator('#studio-back').click();await p.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);check((mobile?'mobile':'desktop')+' Back restores Home',true);await c.close();
}check('no JS errors',!errors.length,errors);fs.writeFileSync(path.join(__dirname,'public-process.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({count:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
