const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
(async()=>{
 const browser=await pw.chromium.launch({channel:'chrome',headless:true}),checks=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<500,isMobile:viewport.width<500});
  await page.goto('http://127.0.0.1:8943/');await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});
  await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
  await page.evaluate(()=>{
   window.__clearance={samples:0,violations:[],tracking:true};
   const loop=()=>{if(!__clearance.tracking)return;const s=portfolioCompanion.getState(),n=document.querySelector('#work-companion'),c=getComputedStyle(n);
    if(['about','process'].includes(s.mode)){__clearance.samples++;const surface=document.querySelector(s.mode==='about'?'.desk-phone':'.process-paper-content')?.getBoundingClientRect(),p=s.position,b=s.rig.bounds;
     if(n.dataset.blocked==='true'&&(n.tabIndex!==-1||n.getAttribute('aria-hidden')!=='true'))__clearance.violations.push({mode:s.mode,reason:'hidden resident still takes keyboard focus'});
     if(surface&&p&&c.display!=='none'&&c.visibility==='visible'&&Number(c.opacity)>.01){const r={left:p.x+(b.left-60)*p.scale,right:p.x+(b.right-60)*p.scale,top:p.y+(b.top-100)*p.scale,bottom:p.y+(b.bottom-100)*p.scale};
      if(r.left<surface.right&&r.right>surface.left&&r.top<surface.bottom&&r.bottom>surface.top)__clearance.violations.push({mode:s.mode,action:s.action,opacity:c.opacity,r,surface:surface.toJSON()});}}
    requestAnimationFrame(loop);};loop();
  });
  for(const [selector,mode]of [['#about-control','about'],['#process-control','process']]){
   await page.locator(selector).click();await page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending,mode);await page.waitForTimeout(1900);
  }
  const result=await page.evaluate(()=>{__clearance.tracking=false;return __clearance});
  checks.push({name:`${viewport.width}px phone/Process stay clear during approaches`,pass:result.samples>20&&!result.violations.length,result});await page.close();
 }
 await browser.close();const out=path.join(__dirname,'content-clearance-report.json');fs.writeFileSync(out,JSON.stringify({checks},null,2));console.log(JSON.stringify(checks.map(c=>({name:c.name,pass:c.pass,samples:c.result.samples,violations:c.result.violations.length,first:c.result.violations.slice(0,2)}))));if(checks.some(c=>!c.pass))process.exitCode=1;
})();
