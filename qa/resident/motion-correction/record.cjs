/* Full-motion local evidence: both mirror orientations at ordinary UI size,
   plus the real-site viewer at 1x and .5x. No production UI or clock changes. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..'),out=path.join(__dirname,'recordings');fs.mkdirSync(out,{recursive:true});
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
 const siteOnly=process.argv.includes('--site-only'),rigOnly=process.argv.includes('--rig-only');
 if(siteOnly)for(const speed of [1,.5])results.push({file:`full-motions-${speed===1?'1x':'half'}-both-facing.webm`,speed,kind:'rig',height:140});
 for(const speed of siteOnly?[]:[1,.5]){
  const context=await browser.newContext({viewport:{width:900,height:520},recordVideo:{dir:out,size:{width:900,height:520}}}),page=await context.newPage();
  await page.setContent(`<style>body{margin:0;background:#080808;color:#a6a6a3;font:13px/1.4 system-ui}h1{font-size:15px;font-weight:400;margin:20px 32px}.row{display:flex;gap:110px;margin:30px 120px 0;height:180px}.cell{width:200px;position:relative}.figure,.fixture{position:absolute;top:0;left:20px;width:84px;height:140px}.figure svg,.fixture svg{width:100%;height:100%;overflow:visible}.label{position:absolute;top:145px;font-size:12px}.note{position:absolute;left:32px;bottom:15px;font-size:12px;color:#777}</style><h1>Complete motions · ${speed}× · 140 px figure · both orientations</h1><main></main><div class="note">The complete preparation, action and return play in real time. No joint markers.</div>`);
  await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
  await page.evaluate(speed=>{
   const rigs=[];for(const action of ['coffee','pushups']){const row=document.createElement('section');row.className='row';document.querySelector('main').append(row);for(const facing of [1,-1]){const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<div class="fixture"></div><div class="figure"></div><div class="label">'+action+' · '+(facing===1?'right':'left')+'<br><span></span></div>';row.append(cell);rigs.push({action,facing,rig:StudioCharacterRig.create(cell.querySelector('.figure'),{fixtureHost:cell.querySelector('.fixture')}),label:cell.querySelector('span')});}}
   const timings={coffee:[['prepare',875],['perform',4800],['finish',825]],pushups:[['prepare',2000],['perform',6300],['finish',1700]]},started=performance.now();window.motionRecording={done:false};
   function draw(now){
    for(const s of rigs){let elapsed=Math.max(0,(now-started-700)*speed),phase='idle',progress=0,local=0;for(const [name,duration]of timings[s.action]){if(elapsed<=duration){phase=name;local=elapsed;progress=elapsed/duration;break;}elapsed-=duration;}
     s.rig.render({action:phase==='idle'?'idle':s.action,phase:phase==='idle'?'perform':phase,progress,elapsed:local,repeats:3,facing:s.facing});s.label.textContent=phase==='idle'?'complete':phase;}
    if((now-started-700)*speed>11000){window.motionRecording.done=true;return;}requestAnimationFrame(draw);
   }requestAnimationFrame(draw);
  },speed);
  await page.waitForFunction(()=>motionRecording.done,null,{timeout:40000});const video=page.video();await context.close();const filename=`full-motions-${speed===1?'1x':'half'}-both-facing.webm`;await video.saveAs(path.join(out,filename));results.push({file:filename,speed,kind:'rig',height:140});
 }
 if(rigOnly){const previous=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));results.push(...previous.filter(r=>r.kind==='actual-site'));}
 for(const speed of rigOnly?[]:[1,.5]){
  const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}}),page=await context.newPage();const checkpoints=[];
  await page.goto(origin+'/__character/');await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});await page.evaluate(()=>portfolioEntry.enterWork());await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
  await page.evaluate(speed=>{document.querySelector('#resident-viewer').open=false;portfolioCompanion.stop();portfolioCompanion.seed(42);StudioCharacterLife.config.timeScale=1/speed;},speed);
  for(const action of ['coffee','pushups']){
   await page.evaluate(action=>{portfolioCompanion.stop();portfolioCompanion.seed(42);void portfolioCompanion.play(action,{variant:0})},action);
   await page.waitForFunction(action=>portfolioCompanion.getState().life.activity===action&&portfolioCompanion.getState().life.phase==='prepare',action,{timeout:10000});
   checkpoints.push({action,speed,start:await page.evaluate(()=>({time:performance.now(),state:portfolioCompanion.getState()}))});
   for(const phase of ['perform','finish']){await page.waitForFunction(({action,phase})=>{const s=portfolioCompanion.getState();return s.life.activity===action&&s.life.phase===phase},{action,phase},{timeout:30000});await page.screenshot({path:path.join(out,`${action}-${phase}-${speed===1?'1x':'half'}-site.png`)});}
   await page.waitForFunction(action=>{const s=portfolioCompanion.getState();return s.life.activity!==action&&s.life.phase==='rest'},action,{timeout:15000});await page.evaluate(()=>portfolioCompanion.stop());await page.waitForTimeout(500);
  }
  const video=page.video();await context.close();const filename=`actual-site-${speed===1?'1x':'half'}.webm`;await video.saveAs(path.join(out,filename));results.push({file:filename,speed,kind:'actual-site',checkpoints});
 }
 await browser.close();fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(results,null,2));
 fs.writeFileSync(path.join(__dirname,'replay.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Resident complete motion review</title><style>html{color-scheme:dark}body{max-width:1440px;margin:32px auto;padding:0 20px;background:#080808;color:#c8c8c3;font:16px/1.5 system-ui}h1{font-size:24px;font-weight:500}h2{font-size:18px;font-weight:500;margin-top:36px}p{max-width:850px;color:#999}a{color:#ddd}video,img{display:block;max-width:100%;height:auto;border:1px solid #242424;margin:12px 0 28px}video{width:900px}video.site{width:1440px}</style><h1>Dumitru · complete motion review</h1><p>Full preparation, action and return. The first two recordings use the production SVG at ordinary140px height in both orientations. The actual-site videos include the normal loader and Work navigation, then complete coffee and pushup scenes. No joint markers are shown.</p><p><a href="http://127.0.0.1:8943/__character/">Interactive local viewer</a>: choose Work, coffee or pushups, a speed and Play scene. Interrupt leaves the figure quiet so mouse tracking can be inspected. Developer controls are not published.</p>${results.map(r=>`<h2>${r.kind==='rig'?'140px · both orientations':'Real portfolio · coffee then pushups'} · ${r.speed}×</h2><video ${r.kind==='actual-site'?'class="site" ':''}controls preload="metadata" src="recordings/${r.file}"></video>`).join('')}<h2>Key poses · ordinary size</h2><img src="full-contact-sheet.png" alt="Coffee and pushup preparation, action and return in both orientations"></html>`);
 console.log(JSON.stringify(results.map(({checkpoints,...r})=>r)));
})().catch(error=>{console.error(error);process.exitCode=1});
