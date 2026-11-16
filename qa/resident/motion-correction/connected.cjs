const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({viewport:{width:1440,height:900}}),results=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8943/');await p.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});
 await p.locator('#work-toggle').click();await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
 for(const action of ['coffee','measure','pushups']){
  await p.evaluate(action=>{portfolioCompanion.pause(false);portfolioCompanion.seed(42);void portfolioCompanion.play(action,{variant:0,debug:true});},action);
  await p.waitForFunction(action=>{const s=portfolioCompanion.getState();return s.life.activity===action&&s.life.phase==='perform'&&s.life.phaseElapsed>(action==='coffee'?2100:action==='pushups'?900:1600)},action,{timeout:20000});
  await p.evaluate(()=>portfolioCompanion.pause(true));
  const s=await p.evaluate(()=>{const c=portfolioCompanion.getState();return {action:c.action,position:c.position,phase:c.life.phase,phaseElapsed:c.life.phaseElapsed,contacts:c.rig.contacts,active:c.active};});
  results.push(s);const {x,y,scale}=s.position;
  await p.screenshot({path:path.join(__dirname,action+'-connected.png'),clip:{x:Math.max(0,x-110*scale),y:Math.max(0,y-105*scale),width:250*scale,height:220*scale},scale:'css'});
 }
 fs.writeFileSync(path.join(__dirname,'connected-report.json'),JSON.stringify({results,errors},null,2));await b.close();console.log(JSON.stringify({results,errors}));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
