const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943',suffix=process.env.REVIEW_SUFFIX||'local';
const output=path.join(__dirname,'integration-'+suffix);fs.mkdirSync(output,{recursive:true});
(async()=>{const runs=[];
 for(const spec of [{name:'desktop',engine:chromium,viewport:{width:1440,height:900}},{name:'mobile',engine:chromium,viewport:{width:390,height:844}},{name:'short-webkit',engine:webkit,viewport:{width:393,height:620}},{name:'2k',engine:chromium,viewport:{width:2560,height:1440}}]){
  const browser=await spec.engine.launch({headless:true,...(spec.engine===chromium?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:spec.viewport,deviceScaleFactor:spec.viewport.width<500?3:1,isMobile:spec.viewport.width<500,hasTouch:spec.viewport.width<500});
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:20000});
  const camera=()=>page.evaluate(()=>({...portfolioRuntime.camera}));
  const close=(a,b)=>['x','y','zoom'].every(k=>Math.abs(a[k]-b[k])<.02);
  try{
   await page.goto(origin+'/?review=work-redesign');
   await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
   await page.locator('#work-toggle').click();await settle('work');await page.waitForTimeout(1800);
   const character=await page.evaluate(()=>{const n=document.querySelector('#work-companion'),r=n.getBoundingClientRect(),a=portfolioWorkGeometry();return{...portfolioCompanion.getState(),visible:n.dataset.visible,rect:r.toJSON(),anchor:a,passThrough:getComputedStyle(n).pointerEvents==='none',idleAnimations:n.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}});
   checks.push({name:'character anchored in Work',pass:character.visible==='true'&&character.passThrough&&Math.abs(character.rect.x+character.rect.width/2-character.anchor.x)<2&&Math.abs(character.rect.y+character.rect.height/2-character.anchor.y)<2,data:character});
   await page.screenshot({path:path.join(output,spec.name+'-work.png'),scale:'css'});
   const start=await camera();await page.locator('#process-control').click();await settle('process');await page.waitForTimeout(1300);
   checks.push({name:'Work to Process hides character',pass:await page.evaluate(()=>!portfolioCompanion.getState().active&&getComputedStyle(document.querySelector('#studio-process')).opacity!=='0')});
   await page.locator('#work-toggle').click();await settle('work');
   checks.push({name:'Process to Work saved camera',pass:close(start,await camera())});
   await page.waitForTimeout(1000);checks.push({name:'second visit changes pose',pass:await page.evaluate(pose=>portfolioCompanion.getState().pose!==pose,character.pose)});
   await page.screenshot({path:path.join(output,spec.name+'-sketch.png'),scale:'css'});
   await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=ora]').click();await settle('detail');await page.waitForTimeout(700);
   const detail=await page.evaluate(()=>({character:portfolioCompanion.getState().active,returnVisible:!!document.querySelector('#return-control').getClientRects().length,backVisible:!!document.querySelector('#studio-back').getClientRects().length,thumbs:document.querySelectorAll('#material-dots button img').length,overflow:document.documentElement.scrollWidth>innerWidth,visit:document.querySelector('#visit-control').href,text:document.querySelector('#project-controls').textContent}));
   checks.push({name:'ORA paper controls and single Back',pass:!detail.character&&!detail.returnVisible&&detail.backVisible&&detail.thumbs===4&&!detail.overflow&&detail.visit.includes('ora-lenta'),data:detail});
   await page.screenshot({path:path.join(output,spec.name+'-ora.png'),scale:'css'});
   await page.locator('#material-dots [data-material="3"]').click();await page.waitForFunction(()=>portfolioRuntime.materialIndex===3);await page.waitForTimeout(600);
   checks.push({name:'manual material selection',pass:await page.locator('#material-dots [data-material="3"]').getAttribute('aria-pressed')==='true'});
   await page.locator('#studio-back').click();await settle('work');checks.push({name:'project exact return',pass:close(start,await camera())});
   await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,spec.name+'-build.png'),scale:'css'});
   await page.locator('#about-control').click();await settle('about');checks.push({name:'About keeps companion hidden',pass:await page.evaluate(()=>portfolioAbout.getState().visible&&!portfolioCompanion.getState().active)});
   await page.locator('#work-toggle').click();await settle('work');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
   const reduced=await page.evaluate(()=>document.querySelector('#work-companion').getAnimations({subtree:true}).filter(a=>a.playState==='running').length);checks.push({name:'companion respects reduced motion',pass:reduced===0});
  }catch(e){errors.push(String(e))}
  checks.push({name:'no JS or HTTP errors',pass:!errors.length,errors});runs.push({name:spec.name,checks});await browser.close();
 }
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({origin,runs},null,2));const all=runs.flatMap(x=>x.checks);console.log(JSON.stringify({checks:all.length,failures:all.filter(x=>!x.pass)}));if(all.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
