const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
(async()=>{
 const browser=await pw.chromium.launch({channel:'chrome',headless:true}),checks=[];
 for(const [route,mode] of [['/work/andra','detail'],['/stories/despre','about'],['/work/process','process']]){
  if(process.env.REVIEW_ROUTE&&process.env.REVIEW_ROUTE!==route)continue;
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto('http://127.0.0.1:8943'+route);
   await page.waitForFunction(mode=>portfolioLoader.getState().phase==='complete'&&document.body.dataset.resident==='ready'&&window.portfolioCompanion&&portfolioEntry.mode===mode&&!portfolioEntry.pending&&(mode!=='detail'||!portfolioRuntime.moving),mode,{timeout:45000});
   await page.waitForTimeout(2200);
   const s=await page.evaluate(()=>({resident:portfolioCompanion.getState(),count:document.querySelectorAll('#work-companion').length,original:portfolioCharacter.getState(),originalHidden:document.getElementById('loader-walker').hidden,pausePresent:!!document.getElementById('companion-pause'),viewer:!!document.getElementById('resident-viewer')}));
   checks.push({name:route+' activates the SVG context while the original Home walker is suspended',pass:s.count===1&&!s.original.retired&&!s.original.active&&s.originalHidden&&!s.pausePresent&&s.resident.mode===mode&&!s.resident.life.pauseReasons.includes('input')&&errors.length===0,state:s,errors});
  }catch(e){checks.push({name:route,pass:false,error:e.message,state:await page.evaluate(()=>({entry:{mode:window.portfolioEntry?.mode,pending:window.portfolioEntry?.pending},loader:window.portfolioLoader?.getState(),native:{moving:window.portfolioRuntime?.moving,key:window.portfolioRuntime?.focusedKey},resident:window.portfolioCompanion?.getState()}))})}
  await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'direct-routes-report.json'),JSON.stringify({checks},null,2));console.log(JSON.stringify(checks.map(({name,pass,error})=>({name,pass,error}))));if(checks.some(c=>!c.pass))process.exitCode=1;
})();
