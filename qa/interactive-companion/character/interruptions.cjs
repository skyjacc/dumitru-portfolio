const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const checks=[],errors=[];const check=(name,pass,data)=>checks.push({name,pass,data});
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 const idle=()=>page.waitForFunction(()=>portfolioCompanion.getState().action==='idle'&&!portfolioCompanion.getState().frameScheduled&&!portfolioRuntime.moving,null,{timeout:8000}).catch(async e=>{console.log(JSON.stringify(await page.evaluate(()=>({companion:portfolioCompanion.getState(),camera:portfolioRuntime.camera,moving:portfolioRuntime.moving}))));throw e});
 const snap=()=>page.evaluate(()=>portfolioCompanion.getState());
 await page.goto('http://127.0.0.1:8943/?review=companion-interruptions');await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready);
 await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving);await idle();
 const startDrag=async()=>{const s=await snap();await page.mouse.move(s.position.x,s.position.y-24);await page.mouse.down();await page.mouse.move(s.position.x+90,s.position.y+35,{steps:8});return s;};
 let before=await startDrag();await page.evaluate(()=>{const el=document.querySelector('#work-companion');for(let id=1;id<5;id++)if(el.hasPointerCapture(id))el.releasePointerCapture(id)});await page.mouse.up();await idle();let after=await snap();check('lost capture cancels and restores origin',!after.dragging&&JSON.stringify(after.worldPos)===JSON.stringify(before.worldPos),after);
 before=await startDrag();await page.keyboard.press('Escape');await page.mouse.up();await idle();after=await snap();check('Escape during actual drag',!after.dragging&&!after.selected&&JSON.stringify(after.worldPos)===JSON.stringify(before.worldPos),after);
 await startDrag();await page.setViewportSize({width:1000,height:760});await page.mouse.up();await idle();after=await snap();check('resize releases pointer and reaches idle',!after.dragging&&!after.selected&&after.position.x>0&&after.position.x<1000,after);
 before=await startDrag();await page.evaluate(()=>portfolioEntry.open('process'));await page.waitForFunction(()=>portfolioEntry.mode==='process'&&!portfolioEntry.pending);await page.mouse.up();after=await snap();check('leaving Work during drag cleans interaction',!after.dragging&&!after.selected&&after.mode==='hidden'&&!after.frameScheduled&&JSON.stringify(after.worldPos)===JSON.stringify(before.worldPos),after);
 await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving);await idle();check('Work re-entry remains draggable',await page.evaluate(()=>!document.querySelector('#work-companion').inert&&document.querySelector('#work-companion').tabIndex===0));
 await browser.close();
 const mobile=await webkit.launch({headless:true}),phone=await mobile.newPage({viewport:{width:320,height:640},isMobile:true,hasTouch:true,deviceScaleFactor:2});phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto('http://127.0.0.1:8943/?review=companion-narrow');await phone.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready);await phone.locator('#work-toggle').click();await phone.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving);
 for(const key of ['andra','btb','fkd','ora','bonanza']){
  await phone.evaluate(key=>portfolioEntry.open(key),key);await phone.waitForFunction(key=>portfolioRuntime.focusedKey===key&&!portfolioRuntime.moving,key);await phone.waitForFunction(()=>!portfolioCompanion.getState().awaitingProject&&portfolioCompanion.getState().action==='idle',null,{timeout:12000});await phone.waitForTimeout(220);
  const d=await phone.evaluate(()=>{const el=document.querySelector('#work-companion');return{s:portfolioCompanion.getState(),r:el.getBoundingClientRect().toJSON(),f:portfolioWorkGeometry().front,visible:el.dataset.visible,inert:el.inert,animations:el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}});
  check('320 WebKit '+key+' observer visible outside artwork',d.visible==='true'&&d.inert&&d.r.left>=0&&d.r.right<=320&&!(d.r.left<d.f.right&&d.r.right>d.f.left&&d.r.top<d.f.bottom&&d.r.bottom>d.f.top)&&d.animations===0,d);
  await phone.screenshot({path:path.join(__dirname,'320-'+key+'-observer.png'),scale:'css'});await phone.locator('#studio-back').click();await phone.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving);
 }
 await mobile.close();check('no browser errors',errors.length===0,errors);fs.writeFileSync(path.join(__dirname,'interruptions-report.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
