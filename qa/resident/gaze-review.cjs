const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
const out=path.join(__dirname,'gaze-review');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'chrome'}),checks=[];
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const add=(name,pass,data)=>checks.push({name,pass:!!pass,data});
 const snapshot=()=>page.evaluate(()=>{const c=portfolioCompanion.getState();return{joints:c.rig.joints,head:c.rig.head,position:c.position,world:c.worldPos,action:c.action,frame:c.frameScheduled,life:c.life,mode:c.mode,legacy:portfolioCharacter.getState()}});
 const settled=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:30000});
 try{
  await page.goto('http://127.0.0.1:8943/');await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});
  await page.locator('#work-toggle').click();await settled('work');
  await page.waitForFunction(()=>portfolioCompanion.getState().active&&!portfolioCompanion.getState().frameScheduled);
  await page.evaluate(()=>portfolioCompanion.stop());
  const baseline=await snapshot();
  await page.mouse.move(1350,300);await page.waitForTimeout(900);const right=await snapshot();
  await page.mouse.move(50,300);await page.waitForTimeout(900);const left=await snapshot();
  add('head follows left/right screen direction',right.head.x-left.head.x>2&&right.head.x-left.head.x<8,{left:left.head,right:right.head});
  const bodyKeys=['hip','shoulder','leftHand','rightHand','leftFoot','rightFoot'];
  add('gaze moves neither limbs nor board anchor',bodyKeys.every(k=>JSON.stringify(right.joints[k])===JSON.stringify(left.joints[k]))&&JSON.stringify(right.world)===JSON.stringify(left.world),{left,right});
  add('gaze settles without an idle RAF',!left.frame&&!right.frame&&!left.life.frameScheduled&&!left.life.timerScheduled,{leftFrame:left.frame,rightFrame:right.frame});
  await page.screenshot({path:path.join(out,'desktop-left.png'),scale:'css'});
  await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerout',{pointerType:'mouse',relatedTarget:null,bubbles:true})));await page.waitForTimeout(900);
  const neutral=await snapshot();
  add('pointer exit restores neutral head',Math.hypot(neutral.head.x-baseline.head.x,neutral.head.y-baseline.head.y)<.05&&!neutral.frame,{neutral:neutral.head,baseline:baseline.head});
  await page.mouse.move(1350,300);await page.waitForTimeout(900);
  await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.waitForTimeout(50);
  const blurred=await snapshot();add('blur redraws the neutral idle head',Math.hypot(blurred.head.x-baseline.head.x,blurred.head.y-baseline.head.y)<.05&&!blurred.frame);
  await page.evaluate(()=>portfolioCompanion.pause(true));const beforePause=await snapshot();
  await page.mouse.move(1350,50);await page.waitForTimeout(350);const afterPause=await snapshot();
  add('developer pause freezes gaze',JSON.stringify(beforePause.head)===JSON.stringify(afterPause.head)&&!afterPause.frame);
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>portfolioCompanion.pause(false));
  const beforeReduced=await snapshot();await page.mouse.move(50,800);await page.waitForTimeout(350);const afterReduced=await snapshot();
  add('reduced motion suppresses pointer animation',JSON.stringify(beforeReduced.head)===JSON.stringify(afterReduced.head)&&!afterReduced.frame&&afterReduced.life.reduced);
  await page.locator('#home-control').click();await settled('home');await page.mouse.move(1300,100);await page.waitForTimeout(250);const home=await snapshot();
  add('original Home walker is untouched by gaze',home.legacy.active&&!home.legacy.retired&&!home.life.running&&!home.frame);
  const phone=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await phone.goto('http://127.0.0.1:8943/');await phone.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});
  await phone.locator('#work-toggle').tap();await phone.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
  await phone.evaluate(()=>portfolioCompanion.stop());
  const touchBefore=await phone.evaluate(()=>portfolioCompanion.getState().rig.head);
  await phone.evaluate(()=>{document.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',isPrimary:true,clientX:380,clientY:300,bubbles:true}));document.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',isPrimary:true,clientX:380,clientY:300,bubbles:true}));});
  await phone.waitForTimeout(300);const touchAfter=await phone.evaluate(()=>portfolioCompanion.getState());
  add('coarse-pointer viewport keeps static head',JSON.stringify(touchBefore)===JSON.stringify(touchAfter.rig.head)&&!touchAfter.frameScheduled);
  await phone.close();add('no browser errors',errors.length===0,errors);
 }catch(e){add('scenario completed',false,{error:e.stack,state:await snapshot().catch(()=>null)})}
 await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks},null,2));console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})();
