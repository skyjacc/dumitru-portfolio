/* A real-time observation, not a forced draw benchmark. */
const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
(async()=>{
 const browser=await pw.chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],samples=[],checks=[];
 const output=path.join(__dirname,'session');fs.mkdirSync(output,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943/');
  await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete'&&portfolioCharacter.getState().retired);
  await page.evaluate(()=>{portfolioCompanion.seed(21);portfolioCompanion.pause(false);portfolioEntry.enterWork()});
  await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
  for(let n=0;n<9;n++){
   await page.waitForTimeout(5000);
   samples.push(await page.evaluate(()=>{const c=portfolioCompanion.getState();return{time:performance.now(),action:c.action,phase:c.life.phase,history:c.life.history,position:c.position,world:c.worldPos,rootRAF:c.frameScheduled,lifeRAF:c.life.frameScheduled,timer:c.life.timerKind,reasons:c.life.pauseReasons,fixtureCount:c.rig.fixtures.length,active:c.active}}));
  }
  checks.push({name:'normal 45-second session has finite positions and no stranded scheduler',pass:samples.every(s=>Number.isFinite(s.position.x)&&Number.isFinite(s.position.y)&&(s.rootRAF||s.lifeRAF||s.timer||s.reasons.length))});
  checks.push({name:'session contains both active poses and quiet rest without character RAF',pass:samples.some(s=>s.lifeRAF)&&samples.some(s=>!s.rootRAF&&!s.lifeRAF&&s.timer==='rest')});
  checks.push({name:'fixture collection stays bounded',pass:samples.every(s=>s.fixtureCount<=3)});
  await page.screenshot({path:path.join(output,'work-observation.png')});
  await page.evaluate(()=>portfolioCompanion.pause(true));await page.waitForTimeout(300);
  const before=await page.evaluate(()=>portfolioCompanion.getState());await page.waitForTimeout(650);
  const after=await page.evaluate(()=>portfolioCompanion.getState());
  checks.push({name:'pause freezes pose and own clocks',pass:!after.frameScheduled&&!after.life.frameScheduled&&!after.life.timerScheduled&&JSON.stringify(before.rig.joints)===JSON.stringify(after.rig.joints)});
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>portfolioCompanion.pause(false));await page.waitForTimeout(400);
  checks.push({name:'resume still respects reduced motion',pass:await page.evaluate(()=>{const s=portfolioCompanion.getState();return s.life.reduced&&!s.life.frameScheduled&&!s.frameScheduled&&!s.life.timerScheduled})});
  checks.push({name:'no browser errors',pass:errors.length===0,errors});
 }catch(error){checks.push({name:'session completed',pass:false,error:error.stack})}
 await browser.close();const result={checks,samples};fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({checks,samples:samples.map(({action,phase,timer,rootRAF,lifeRAF})=>({action,phase,timer,rootRAF,lifeRAF}))}));if(checks.some(c=>!c.pass))process.exitCode=1;
})();
