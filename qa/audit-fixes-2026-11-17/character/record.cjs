/* Local review only: full production SVG motion at its ordinary 140px size. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(__dirname,'recordings');fs.mkdirSync(out,{recursive:true});
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
let browser;
(async()=>{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:780,height:680},recordVideo:{dir:out,size:{width:780,height:680}}}),page=await context.newPage();
 await page.setContent('<style>body{margin:0;background:#080808;color:#a6a6a3;font:13px/1.4 system-ui}h1{font-size:15px;font-weight:400;margin:20px 32px}.row{display:flex;gap:120px;margin:30px 140px 0;height:175px}.cell{width:160px;position:relative}.figure,.fixture{position:absolute;top:0;left:20px;width:84px;height:140px}.label{position:absolute;top:145px;font-size:12px}</style><h1>Complete motions · 1× · 140 px figure · both orientations</h1><main></main>');
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 await page.evaluate(()=>{
  const rigs=[];for(const action of ['stretch','sit','carryFlower']){
   const row=document.createElement('section');row.className='row';document.querySelector('main').append(row);
   for(const facing of [1,-1]){
    const cell=document.createElement('div');cell.className='cell';cell.innerHTML=`<div class="fixture"></div><div class="figure"></div><div class="label">${action} · ${facing===1?'right':'left'}<br><span></span></div>`;row.append(cell);
    rigs.push({action,facing,rig:StudioCharacterRig.create(cell.querySelector('.figure'),{fixtureHost:cell.querySelector('.fixture')}),label:cell.querySelector('span')});
   }
  }
  const started=performance.now();window.motionReview={done:false};
  function draw(now){
   let elapsed=Math.max(0,now-started-700),phase='idle',progress=0,local=0;
   for(const [name,duration]of [['prepare',1000],['perform',7000],['finish',1000]]){if(elapsed<=duration){phase=name;local=elapsed;progress=elapsed/duration;break;}elapsed-=duration;}
   for(const s of rigs){s.rig.render({action:phase==='idle'?'idle':s.action,phase:phase==='idle'?'perform':phase,progress,elapsed:local,repeats:4,facing:s.facing,variant:s.action==='sit'?1:0});s.label.textContent=phase==='idle'?'complete':phase;}
   if(now-started>10700){motionReview.done=true;return;}requestAnimationFrame(draw);
  }requestAnimationFrame(draw);
 });
 await page.waitForTimeout(1280);await page.screenshot({path:path.join(out,'prepare-ordinary.png')});
 await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'perform-entry-ordinary.png')});
 await page.waitForTimeout(6800);await page.screenshot({path:path.join(out,'flower-placement-ordinary.png')});
 await page.waitForFunction(()=>motionReview.done);const video=page.video();await context.close();await video.saveAs(path.join(out,'full-1x-both-facing.webm'));
 const siteContext=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}}),site=await siteContext.newPage(),checks=[];
 await site.goto(origin+'/__character/',{waitUntil:'commit'});await site.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});
 await site.evaluate(()=>portfolioEntry.enterWork());await site.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
 await site.evaluate(()=>{document.querySelector('#resident-viewer').open=false;portfolioCompanion.stop();portfolioCompanion.seed(42);});
 for(const action of ['stretch','sit','carryFlower']){
  if(action==='carryFlower'){await site.evaluate(()=>portfolioEntry.open('andra'));await site.waitForFunction(()=>portfolioCompanion.getState().mode==='detail'&&!portfolioRuntime.moving);}
  await site.waitForFunction(()=>portfolioCompanion.getState().life.pauseReasons.length===0);
  await site.evaluate(action=>{portfolioCompanion.stop();portfolioCompanion.seed(42);void portfolioCompanion.play(action,{variant:action==='sit'?1:0,debug:true,inPlace:true});},action);
  await site.waitForFunction(action=>{const s=portfolioCompanion.getState();return s.life.activity===action&&s.life.phase==='prepare';},action,{timeout:12000});
  checks.push({action,phase:'prepare',state:await site.evaluate(()=>portfolioCompanion.getState())});
  for(const phase of ['perform','finish']){
   await site.waitForFunction(({action,phase})=>{const s=portfolioCompanion.getState();return s.life.activity===action&&s.life.phase===phase;},{action,phase},{timeout:30000});
   checks.push({action,phase,state:await site.evaluate(()=>portfolioCompanion.getState())});await site.screenshot({path:path.join(out,`site-${action}-${phase}.png`)});
  }
  await site.waitForFunction(action=>{const s=portfolioCompanion.getState();return s.life.activity!==action&&s.life.phase==='rest';},action,{timeout:15000});await site.evaluate(()=>portfolioCompanion.stop());
 }
 const siteVideo=site.video();await siteContext.close();await siteVideo.saveAs(path.join(out,'actual-site-1x.webm'));
 fs.writeFileSync(path.join(out,'site-states.json'),JSON.stringify(checks,null,2));await browser.close();console.log(JSON.stringify({recordings:['full-1x-both-facing.webm','actual-site-1x.webm'],scenes:checks.map(x=>({action:x.action,phase:x.phase}))}));
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
