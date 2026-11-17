const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[];
 const add=(name,pass,data)=>checks.push({name,pass:!!pass,data}),state=()=>page.evaluate(()=>portfolioCompanion.getState());
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const quiet=async()=>{await page.evaluate(()=>{portfolioCompanion.setExternalPause(false);portfolioCompanion.pause(false);portfolioCompanion.stop()});await page.waitForTimeout(500)};
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/__character/');await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});
  await page.evaluate(()=>portfolioEntry.enterWork());await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);await quiet();
  const rigDirection=await page.evaluate(()=>{
   const host=document.createElement('div');document.body.append(host);host.hidden=true;const r=StudioCharacterRig.create(host);const cases=[];
   for(const facing of [1,-1]){const sample=look=>r.render({action:'idle',phase:'perform',progress:0,facing,look});const neutral=sample({x:0,y:0}),left=sample({x:-.8*facing,y:0}),right=sample({x:.8*facing,y:0}),up=sample({x:0,y:-.55}),down=sample({x:0,y:.55}),diagonals=[[-.8,-.55],[-.8,.55],[.8,-.55],[.8,.55]].map(([x,y])=>sample({x:x*facing,y}));cases.push({facing,neutral,left,right,up,down,diagonals});}r.destroy();host.remove();return cases;
  });
  for(const c of rigDirection){
   add(`rig facing ${c.facing}: independent horizontal and vertical head direction`,c.right.head.x>c.left.head.x+.5&&c.down.head.y>c.up.head.y+.5,{left:c.left.head,right:c.right.head,up:c.up.head,down:c.down.head});
   const parts=['hip','shoulder','leftHand','rightHand','leftFoot','rightFoot'];
   add(`rig facing ${c.facing}: diagonals do not cancel or move body`,c.diagonals.every(s=>distance(s.head,c.neutral.head)>.25&&parts.every(k=>distance(s.joints[k],c.neutral.joints[k])<.0001)));
  }
  const center=await page.evaluate(()=>{const s=portfolioCompanion.getState();return{x:s.position.x+(s.rig.head.x-60)*s.position.scale,y:s.position.y+(s.rig.head.y-100)*s.position.scale}});
  await page.mouse.move(center.x+140,center.y-95);await page.waitForTimeout(700);const tracking=await state();
  await page.mouse.move(center.x-130,center.y+95);await page.waitForTimeout(25);await page.evaluate(()=>portfolioCompanion.pause(true));const paused=await state();await page.waitForTimeout(400);const held=await state();
  add('pause during interpolation freezes exact drawn head and gaze',distance(paused.rig.head,held.rig.head)<.00001&&distance(paused.gaze.look,held.gaze.look)<.00001&&!held.frameScheduled,{paused:paused.gaze,held:held.gaze});
  await page.evaluate(()=>portfolioCompanion.pause(false));await page.waitForTimeout(750);const resumed=await state();
  add('resume completes gaze with finite RAF',!resumed.frameScheduled&&distance(resumed.gaze.look,resumed.gaze.target)<.005&&distance(paused.gaze.look,resumed.gaze.look)>.03,{resumed:resumed.gaze});
  // A camera update must recalculate relative direction even without a pointermove.
  await page.mouse.move(center.x+100,center.y+35);await page.waitForTimeout(600);const beforeCamera=await state();
  await page.mouse.wheel(0,-260);await page.waitForTimeout(1100);const afterCamera=await state();
  add('stationary pointer target is recalculated after camera settle',distance(beforeCamera.position,afterCamera.position)>.5&&distance(beforeCamera.gaze.target,afterCamera.gaze.target)>.005&&!afterCamera.frameScheduled,{before:beforeCamera.gaze,after:afterCamera.gaze,beforePosition:beforeCamera.position,afterPosition:afterCamera.position});
  await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerout',{pointerType:'mouse',relatedTarget:null,bubbles:true})));await page.waitForTimeout(750);const exited=await state();
  add('pointer exit settles to neutral without idle frames',Math.hypot(exited.gaze.look.x,exited.gaze.look.y)<.001&&!exited.frameScheduled);
  for(const action of ['coffee','pushups','work']){
   await quiet();const p=await page.evaluate(()=>portfolioCompanion.getState().position);await page.mouse.move(Math.min(1400,p.x+240),Math.max(100,p.y-180));await page.waitForTimeout(700);const before=await state();
   await page.evaluate(action=>{void portfolioCompanion.play(action,{variant:0,duration:8500,debug:true})},action);
   await page.waitForFunction(action=>{const s=portfolioCompanion.getState();return s.action===action||s.action==='walk'||s.action==='turn'},action,{timeout:5000});
   const early=await state();await page.waitForTimeout(50);await page.evaluate(()=>portfolioCompanion.setExternalPause(true));const stopped=await state();await page.waitForTimeout(220);const stoppedAfter=await state();
   add(`${action}: scene starts and gaze releases continuously`,Math.hypot(before.gaze.look.x,before.gaze.look.y)>.05&&distance(before.gaze.look,early.gaze.look)<.4,{before:before.gaze,early:early.gaze,action:early.action});
   add(`${action}: external pause freezes gaze during release`,distance(stopped.gaze.look,stoppedAfter.gaze.look)<.00001&&!stoppedAfter.frameScheduled,{stopped:stopped.gaze,after:stoppedAfter.gaze});
   await page.evaluate(()=>portfolioCompanion.setExternalPause(false));await page.waitForTimeout(700);const released=await state();add(`${action}: authored scene owns head after finite release`,Math.hypot(released.gaze.look.x,released.gaze.look.y)<.001,{released:released.gaze,action:released.action});
   if(action==='coffee'){await page.waitForFunction(()=>portfolioCompanion.getState().rig.coffee?.sipping,null,{timeout:12000});const sip=await state();await page.mouse.move(40,800);await page.waitForTimeout(100);const sipMoved=await state();add('pointer cannot detach actual cup rim during sip',sip.rig.coffee.sipError<.02&&sipMoved.rig.coffee.sipError<.02&&!sipMoved.gaze.following,{sip:sip.rig.coffee,sipMoved:sipMoved.rig.coffee});}
  }
  await quiet();await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(10,50);await page.waitForTimeout(300);const reduced=await state();add('reduced motion leaves gaze still and finite',Math.hypot(reduced.gaze.look.x,reduced.gaze.look.y)<.001&&!reduced.frameScheduled&&reduced.life.reduced);
  await page.screenshot({path:path.join(__dirname,'gaze-site.png')});
 }catch(error){add('gaze transition scenario completed',false,{error:error.stack,state:await state().catch(()=>null)})}
 add('no browser errors',errors.length===0,errors);await browser.close();fs.writeFileSync(path.join(__dirname,'gaze-transitions.json'),JSON.stringify({checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
