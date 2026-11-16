const fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const suffix=process.env.REVIEW_SUFFIX||'local';
const smoke=process.env.REVIEW_SMOKE==='1';
const out=path.join(__dirname,'integration-'+suffix);fs.mkdirSync(out,{recursive:true});
const close=(a,b,keys=['x','y','zoom'])=>keys.every(k=>Math.abs(a[k]-b[k])<.025);
(async()=>{
 const runs=[];
 for(const spec of [{name:'desktop',engine:chromium,w:1440,h:900},{name:'narrow-touch',engine:chromium,w:320,h:640},{name:'webkit-phone',engine:webkit,w:390,h:844}]){
  if(smoke&&spec.name==='narrow-touch')continue;
  const browser=await spec.engine.launch({headless:true,...(spec.engine===chromium?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:{width:spec.w,height:spec.h},deviceScaleFactor:spec.w<500?3:1,isMobile:spec.w<500,hasTouch:spec.w<500});
  const errors=[],checks=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  const check=(name,pass,data)=>checks.push({name,pass,...(data===undefined?{}:{data})});
  const state=()=>page.evaluate(()=>portfolioCompanion.getState());
  const camera=()=>page.evaluate(()=>({...portfolioRuntime.camera}));
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:25000});
  const rest=()=>page.waitForFunction(()=>!portfolioCompanion.getState().dragging&&!portfolioCompanion.getState().frameScheduled,null,{timeout:16000});
  try{
   await page.goto(origin+'/?review=interactive-companion');
   await page.waitForFunction(()=>portfolioEntry?.ready&&portfolioLoader.getState().phase==='complete',null,{timeout:45000});
   await page.locator('#work-toggle').click();await settle('work');await rest();
   const initial=await state(),startCamera=await camera();
   check('Work exposes a focusable character',await page.locator('#work-companion').evaluate(n=>n.tagName==='BUTTON'&&!n.inert&&n.tabIndex===0),initial);
   await page.screenshot({path:path.join(out,spec.name+'-work.png'),scale:'css'});
   const box=await page.locator('#work-companion').boundingBox(),x=box.x+box.width*.5,y=box.y+box.height*.5;
   if(spec.name==='narrow-touch'){
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+42*i/6,y:y+35*i/6}]});
    check('touch drag is captured',!!(await state()).dragging);
    await page.screenshot({path:path.join(out,spec.name+'-lift.png'),scale:'css'});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
   }else if(spec.name==='desktop'){
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+72,y+44,{steps:8});
    check('mouse drag is captured',!!(await state()).dragging);
    await page.screenshot({path:path.join(out,spec.name+'-lift.png'),scale:'css'});await page.mouse.up();
   }else{
    await page.locator('#work-companion').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowDown');
   }
   await rest();const placed=await state();
   check('character moved while camera and Work stayed fixed',!close(initial.worldPos,placed.worldPos,['x','y'])&&close(startCamera,await camera())&&await page.evaluate(()=>portfolioEntry.mode==='work'),placed);
   await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=bonanza]').click();await settle('detail');await rest();
   await page.waitForFunction(()=>portfolioCompanion.getState().project==='bonanza'&&!portfolioCompanion.getState().awaitingProject,null,{timeout:15000});await rest();
   const detail=await state();
   const observer=await page.locator('#work-companion').evaluate(n=>({visible:n.dataset.visible==='true'&&Number(getComputedStyle(n).opacity)>.9,rect:n.getBoundingClientRect().toJSON(),front:portfolioWorkGeometry().front}));
   const b=observer.rect,f=observer.front,intersects=f&&b.x<f.right&&b.x+b.width>f.left&&b.y<f.bottom&&b.y+b.height>f.top;
   check('character visibly accompanies project without covering material',detail.active&&detail.project==='bonanza'&&!detail.dragging&&observer.visible&&!intersects,{detail,observer});
   await page.screenshot({path:path.join(out,spec.name+'-project.png'),scale:'css'});
   const detailCamera=await camera();await page.locator('#material-dots [data-material="3"]').click();
   await page.waitForFunction(()=>portfolioRuntime.materialIndex===3&&portfolioCompanion.getState().materialIndex===3);await rest();
   const selected=await state();
   check('material reaction preserves selection and camera',selected.active&&selected.materialIndex===3&&close(detailCamera,await camera()),selected);
   await page.screenshot({path:path.join(out,spec.name+'-material.png'),scale:'css'});
   await page.locator('#studio-back').click();await settle('work');await rest();
   const returned=await state();
   check('Back restores character spot and camera',close(returned.worldPos,placed.worldPos,['x','y'])&&close(startCamera,await camera()),returned);
   if(smoke){check('no browser or HTTP errors',errors.length===0,errors);runs.push({name:spec.name,checks});await browser.close();continue;}
   await page.locator('#process-control').click();await settle('process');
   check('Process clears character input and animation',!(await state()).active&&!(await state()).dragging);
   await page.locator('#work-toggle').click();await settle('work');await rest();
   await page.locator('#about-control').click();await settle('about');
   check('About clears character input',!(await state()).active);
   await page.locator('#work-toggle').click();await settle('work');await rest();
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=ora]').click();await settle('detail');await rest();
   check('reduced motion keeps visible final state',!!(await state()).active&&await page.locator('#work-companion').evaluate(n=>n.getAnimations({subtree:true}).every(a=>a.playState!=='running')));
   await page.setViewportSize({width:spec.w<500?spec.w:1280,height:spec.w<500?620:720});await page.waitForTimeout(350);await rest();
   const resized=await page.locator('#work-companion').boundingBox();
   check('observer stays reachable after resize',resized&&resized.x>=-1&&resized.y>=-1&&resized.x+resized.width<=page.viewportSize().width+1&&resized.y+resized.height<=page.viewportSize().height+1,resized);
  }catch(e){errors.push(String(e));await page.screenshot({path:path.join(out,spec.name+'-failure.png'),scale:'css'}).catch(()=>{});}
  check('no browser or HTTP errors',errors.length===0,errors);runs.push({name:spec.name,checks});await browser.close();
 }
 const checks=runs.flatMap(r=>r.checks);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({origin,runs},null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
