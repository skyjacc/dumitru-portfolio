const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const results=[];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [w,h]of [[1440,900],[390,844],[393,620],[320,640]]){
  const page=await browser.newPage({viewport:{width:w,height:h},hasTouch:w<500,isMobile:w<500,deviceScaleFactor:2});
  const checks=[],errors=[];page.on('pageerror',e=>{if(!errors.includes(e.message))errors.push(e.message)});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:25000});
  try{
   await page.goto('http://127.0.0.1:8943/?v=paper-controls');
   await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
   await page.locator('#work-toggle').click();await settle('work');
   for(const key of !process.env.CONTROLS_FOCUSED&&(w===1440||w===390)?['andra','btb','fkd','ora','bonanza']:['ora']){
    await page.locator('#work-toggle').click();await page.locator('#work-list [data-key='+key+']').click();await settle('detail');
    for(let i=0;i<4;i++){
     const button=page.locator('#material-dots [data-material="'+i+'"]');await button.click();
     await page.waitForFunction(i=>portfolioRuntime.materialIndex===i,i);await page.waitForTimeout(450);
     const state=await page.evaluate(()=>{
      const strip=document.querySelector('#material-dots'),controls=document.querySelector('#project-controls'),visit=document.querySelector('#visit-control');
      const targets=[...strip.querySelectorAll('button')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed')}));
      const r=controls.getBoundingClientRect(),v=visit.getBoundingClientRect();
      return {index:portfolioRuntime.materialIndex,targets,controlRect:r.toJSON(),visitRect:v.toJSON(),kind:document.querySelector('#project-kind').textContent,scrollWidth:document.documentElement.scrollWidth,width:innerWidth,fit:r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&v.left>=0&&v.right<=innerWidth,duplicateBack:document.querySelector('#return-control').getClientRects().length>0,src:[...strip.querySelectorAll('img')].map(n=>({src:n.getAttribute('src'),complete:n.complete,width:n.naturalWidth}))};
     });
     checks.push({name:key+' material '+i,pass:state.index===i&&state.fit&&!state.duplicateBack&&state.targets.every(t=>t.w>=44&&t.h>=44&&t.label)&&state.targets.filter(t=>t.pressed==='true').length===1&&state.scrollWidth<=state.width&&state.src.every(s=>s.complete&&s.width>0),state});
    }
    await page.locator('#material-dots [data-material="0"]').click();await page.waitForTimeout(700);
    await page.screenshot({path:path.join(__dirname,w+'x'+h+'-'+key+'.png'),scale:'css'});
    await page.locator('#studio-back').click();await settle('work');checks.push({name:key+' upper Back returns',pass:true});
   }
   if(w===320){
    await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=ora]').click();await settle('detail');
    for(const lang of ['ro','ru']){await page.evaluate(lang=>portfolioI18n.setLocale(lang),lang);await page.waitForFunction(()=>!document.querySelector('.locale-rolling'));await page.waitForTimeout(250);const m=await page.locator('#visit-control').evaluate(el=>({text:el.textContent,w:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right,viewport:innerWidth}));checks.push({name:'320 visit '+lang,pass:m.right<=m.viewport&&m.w>=44,data:m});await page.screenshot({path:path.join(__dirname,w+'x'+h+'-'+lang+'.png'),scale:'css'});}
   }
  }catch(e){errors.push(String(e))}
  checks.push({name:'no errors',pass:errors.length===0,errors});results.push({viewport:[w,h],checks});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,process.env.CONTROLS_FOCUSED?'layout-report.json':'report.json'),JSON.stringify(results,null,2));const checks=results.flatMap(r=>r.checks);console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass).map(c=>({name:c.name,errors:c.errors}))}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
