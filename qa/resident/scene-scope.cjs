/* Real navigation coverage for Work/Detail ownership; no runtime substitutions. */
const fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const configs=[{name:'desktop',engine:'chromium',width:1440,height:900},{name:'mobile-webkit',engine:'webkit',width:390,height:844,touch:true}];
(async()=>{
 const report=[];
 for(const config of configs){
  const browser=await pw[config.engine].launch({headless:true,...(config.engine==='chromium'?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},hasTouch:!!config.touch,isMobile:!!config.touch,deviceScaleFactor:config.touch?3:1});
  const checks=[],errors=[],check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
  page.on('pageerror',error=>errors.push(error.message));
  const click=selector=>config.touch?page.locator(selector).tap():page.locator(selector).click();
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:30000});
  const state=()=>page.evaluate(()=>({resident:portfolioCompanion.getState(),original:portfolioCharacter.getState(),visible:document.querySelector('#work-companion').dataset.visible,fixture:document.querySelector('#companion-fixtures').dataset.visible,publicPause:!!document.querySelector('#companion-pause')}));
  const excluded=async(mode)=>{const s=await state();check(`${mode}: SVG frames, scheduler, fixtures and input yield`,!s.resident.active&&!s.resident.life.running&&!s.resident.life.frameScheduled&&!s.resident.life.timerScheduled&&!s.resident.frameScheduled&&s.visible==='false'&&s.fixture==='false',s);if(mode==='home')check('Home original remains resumable',!s.original.retired&&s.original.active&&!s.publicPause,{original:s.original,publicPause:s.publicPause});};
  try{
   await page.goto(origin);await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await settle('home');await excluded('home');
   for(const [selector,mode]of [['#about-control','about'],['#process-control','process']]){
    await click('#work-toggle');await settle('work');await click(selector);await settle(mode);await excluded(mode);
    await click('#studio-back');await settle(mode==='process'?'work':'home');
    if(mode==='process'){await click('#studio-back');await settle('home');}
    await excluded('home');
   }
   await click('#work-toggle');await settle('work');await page.evaluate(()=>portfolioCompanion.stop());
   const camera=await page.evaluate(()=>({...portfolioRuntime.camera}));
   for(const key of ['andra','btb','fkd','ora','bonanza']){
    await page.evaluate(key=>portfolioEntry.open(key),key);await settle('detail');
    const first=await state();check(`${key}: Detail has decorative SVG input only`,first.resident.mode==='detail'&&await page.locator('#work-companion').getAttribute('tabindex')==='-1',{active:first.resident.active,reason:first.resident.hiddenReason});
    await click('#next-material');await page.waitForFunction(()=>!portfolioRuntime.moving);await page.waitForTimeout(220);
    const next=await state();check(`${key}: material changes without stale project ownership`,next.resident.project===key&&next.resident.materialIndex===1,{project:next.resident.project,index:next.resident.materialIndex});
    await click('#work-toggle');await settle('work');
    const back=await page.evaluate(()=>({...portfolioRuntime.camera}));check(`${key}: Back restores Work camera`,Math.max(...['x','y','zoom'].map(k=>Math.abs(camera[k]-back[k])))<.05,{camera,back});
   }
   await click('#studio-back');await settle('home');await excluded('home');
   check('No browser exceptions',errors.length===0,errors);
  }catch(error){check('Scenario completes',false,{error:error.message,mode:await page.evaluate(()=>window.portfolioEntry?.mode).catch(()=>null)});}
  await browser.close();report.push({config,checks});console.log(JSON.stringify({name:config.name,passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass)}));
 }
 fs.writeFileSync(path.join(__dirname,'scene-scope-report.json'),JSON.stringify(report,null,2));if(report.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
