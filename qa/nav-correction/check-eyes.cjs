const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const tag=process.env.REVIEW_SUFFIX||'local';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const checks=[],errors=[];
 const check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
 try{const c=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:path.join(__dirname,'video-'+tag),size:{width:1440,height:900}}});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/?review=eye-correction-'+tag);await p.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete');
  for(const mode of ['home','process','about','work']){
   if(mode!=='home'){await p.locator(mode==='process'?'#process-control':mode==='about'?'#about-control':'#work-toggle').click();await p.waitForFunction(m=>portfolioEntry.mode===m&&!portfolioEntry.pending,mode);}
   const box=await p.locator('.studio-eye-art').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
   for(const [name,dx,dy] of [['right',250,0],['left',-250,0],['up',0,-35],['down',0,250],['near',6,0]]){
    await p.mouse.move(cx+dx,cy+dy,{steps:12});await p.waitForTimeout(280);
    const state=await p.evaluate(()=>portfolioNav.getState()),v=state.eyeOffset;
    check(mode+' '+name+' correct direction',v.every(([x,y])=>x*dx+y*dy>0),v);
    check(mode+' '+name+' coherent bounded pupils',v[0].every((n,j)=>Math.abs(n-v[1][j])<.001)&&v.every(([x,y])=>(x/20)**2+(y/34)**2<=1.001),v);
    if(mode==='home')await p.locator('#about-control').screenshot({path:path.join(__dirname,'eye-'+tag+'-'+name+'.png')});
   }
  }
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(50);
  check('dynamic reduced motion immediately neutral',await p.evaluate(()=>!portfolioNav.getState().eyeAnimating&&portfolioNav.getState().eyeOffset.flat().every(n=>n===0)));
  await p.evaluate(()=>{window.__motionChanged=false;matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{window.__motionChanged=true},{once:true});});
  await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>window.__motionChanged);await p.mouse.move(100,400);await p.waitForTimeout(320);
  check('motion resumes on next pointer',await p.evaluate(()=>portfolioNav.getState().eyeOffset.flat().some(n=>Math.abs(n)>1)));
  await p.evaluate(()=>dispatchEvent(new Event('blur')));await p.waitForTimeout(350);
  check('blur settles and stops frame loop',await p.evaluate(()=>!portfolioNav.getState().eyeAnimating&&portfolioNav.getState().eyeOffset.flat().every(n=>n===0)));
  await p.setViewportSize({width:900,height:700});await p.locator('#studio-back').click();await p.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);
  await p.locator('#language-toggle').click();await p.locator('[data-locale=ru]').click();await p.waitForTimeout(750);await p.mouse.move(100,400);await p.waitForTimeout(300);
  check('after resize and locale follows new geometry',await p.evaluate(()=>portfolioNav.getState().eyeOffset.every(([x,y])=>x<0&&y>0)));
  check('no JavaScript errors',!errors.length,errors);await c.close();
  fs.writeFileSync(path.join(__dirname,'eyes-'+tag+'-checks.json'),JSON.stringify({base,checks,errors},null,2));console.log(JSON.stringify({count:checks.length,failures:checks.filter(x=>!x.pass)}));if(checks.some(x=>!x.pass))process.exitCode=1;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
