const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const base='http://127.0.0.1:8943',out=__dirname,results=[];
const close=(a,b,epsilon=.002)=>Math.abs(a-b)<epsilon;
const poseMatch=(a,b)=>close(a.progress,b.progress)&&a.poses.every((pose,i)=>['x','y','angle','scale'].every(k=>close(pose[k],b.poses[i][k])));
const cameraMatch=(a,b)=>['x','y','zoom'].every(k=>close(a[k],b[k],.01));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const scenario of[{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844,touch:true},{name:'reduced',width:1440,height:900,reduce:true}]){
  const ctx=await browser.newContext({viewport:{width:scenario.width,height:scenario.height},hasTouch:!!scenario.touch,isMobile:!!scenario.touch,reducedMotion:scenario.reduce?'reduce':'no-preference'}),p=await ctx.newPage(),checks=[],errors=[];
  const check=(label,pass,detail)=>{checks.push({label,pass,detail});console.log(scenario.name+': '+(pass?'PASS ':'FAIL ')+label)};
  p.on('pageerror',e=>errors.push(e.message));
  const state=()=>p.evaluate(()=>({entry:portfolioEntry.mode,composition:portfolioComposition.getState(),process:portfolioProcess.getState(),runtime:portfolioRuntime,path:location.pathname,reveal:document.querySelector('#studio-home').dataset.paperReveal}));
  const home=()=>p.waitForFunction(()=>portfolioEntry?.ready&&portfolioEntry.mode==='home'&&portfolioComposition.getState().enabled&&!portfolioComposition.getState().active&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',{},{timeout:20000});
  const idle=async()=>{await p.waitForTimeout(70);await p.waitForFunction(()=>!portfolioComposition.getState().active,{},{timeout:10000})};
  const work=()=>p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving,{},{timeout:20000});
  const process=()=>p.waitForFunction(()=>portfolioEntry.mode==='process'&&portfolioProcess.getState().visible&&!portfolioComposition.getState().active,{},{timeout:15000});
  try{
   await p.goto(base);await home();check('loader reaches interactive Home',(await state()).composition.objectCount===10);await p.screenshot({path:path.join(out,scenario.name+'-home0.png')});
   for(let i=1;i<=2;i++){await p.mouse.move(scenario.width/2,scenario.height*.47);await p.mouse.wheel(0,1250);await idle();const s=await state();check('wheel composition '+i+' remains Home',s.entry==='home'&&close(s.composition.progress,i),s.composition.progress);await p.screenshot({path:path.join(out,scenario.name+'-home'+i+'.png')});}
   await p.mouse.wheel(0,650);await idle();let before=(await state()).composition;
   await p.locator('#work-toggle').click();await work();check('Work opens native space',(await state()).runtime.focusedKey===null,(await state()).runtime.focusedKey);
   // Pan the existing native scene with trusted pointer input, then open Process.
   await p.mouse.move(scenario.width*.9,scenario.height*.55);await p.mouse.down();await p.mouse.move(scenario.width*.68,scenario.height*.61,{steps:10});await p.mouse.up();await p.waitForTimeout(500);let panned=(await state()).runtime.camera;
   await p.locator('#process-control').click();await process();check('Process from Work preserves camera',cameraMatch((await state()).runtime.camera,panned));await p.screenshot({path:path.join(out,scenario.name+'-process.png')});
   await p.locator('#studio-process .process-back').click();await work();check('Process Back restores panned Work',cameraMatch((await state()).runtime.camera,panned));
   await p.locator('#home-control').click();await home();check('Work Home restores exact composition',poseMatch((await state()).composition,before),{before:before.progress,after:(await state()).composition.progress});
   await p.locator('#process-control').click();await process();await p.locator('#studio-process .process-back').click();await home();check('Process Back restores exact Home',poseMatch((await state()).composition,before));
   if(scenario.touch){const session=await ctx.newCDPSession(p),prev=(await state()).composition.progress;await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:scenario.width*.5,y:scenario.height*.62}]});for(let k=1;k<=8;k++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:scenario.width*.5,y:scenario.height*.62-k*20}]});await p.waitForTimeout(16)}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await idle();const s=await state();check('touch scroll stays in Home',s.entry==='home'&&Math.abs(s.composition.progress-prev)>.1);}
   // Home navigation is allowed to interrupt transitions; the earlier task must not win later.
   await p.evaluate(()=>{portfolioEntry.enterWork();setTimeout(()=>portfolioEntry.showHome(),80)});await home();await p.waitForTimeout(1200);check('rapid Work to Home stays Home',(await state()).entry==='home');
   await p.evaluate(()=>{portfolioEntry.open('process');setTimeout(()=>portfolioEntry.closeProcess(),80)});await home();await p.waitForTimeout(1100);const rapid=await state();check('rapid Process Back never reopens',rapid.entry==='home'&&!rapid.process.visible&&rapid.composition.enabled);
   const fragment=await ctx.newPage();fragment.on('pageerror',e=>errors.push(e.message));await fragment.goto(base+'/work/process');await fragment.waitForFunction(()=>window.portfolioEntry?.ready&&portfolioEntry.mode==='process'&&portfolioProcess.getState().visible&&!portfolioComposition.getState().active,{},{timeout:25000});check('direct Process route opens panel',await fragment.locator('#studio-process').isVisible());await fragment.locator('#studio-process .process-back').click();await fragment.waitForFunction(()=>portfolioEntry.mode==='home'&&portfolioComposition.getState().enabled&&!portfolioComposition.getState().active&&document.querySelector('#studio-home').dataset.paperReveal==='done',{},{timeout:15000});await fragment.waitForTimeout(1100);check('direct Process Back stays Home',await fragment.evaluate(()=>portfolioEntry.mode==='home'&&location.pathname==='/'&&!portfolioProcess.getState().visible));await fragment.close();
   check('no browser errors',errors.length===0,errors);
  }catch(error){check('scenario completed',false,error.stack);await p.screenshot({path:path.join(out,scenario.name+'-failure.png')}).catch(()=>{});checks.push({label:'state at failure',pass:false,detail:await state().catch(()=>null)})}
  results.push({scenario,checks,errors});await ctx.close();
 }
 await browser.close();const summary={checks:results.reduce((n,s)=>n+s.checks.length,0),failed:results.flatMap(s=>s.checks.filter(c=>!c.pass).map(c=>({scenario:s.scenario.name,...c})))};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,summary},null,2));console.log(JSON.stringify(summary));if(summary.failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
