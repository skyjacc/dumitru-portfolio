const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');const path=require('path');const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const report={errors:[],cases:[]};
 try{
  for(const device of [{name:'desktop',viewport:{width:1440,height:900}},{name:'touch',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
   const {name,...options}=device;const page=await browser.newPage(options);
   page.on('pageerror',e=>report.errors.push(e.message));
   await page.goto('http://127.0.0.1:8943/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>window.portfolioNav&&!document.getElementById('studio-loader'));
   await page.evaluate(()=>{window.navTrustedEvents=[];document.addEventListener('click',e=>{const id=e.target.closest('button')?.id;if(['about-control','process-control','studio-back'].includes(id))navTrustedEvents.push({id,trusted:e.isTrusted,at:performance.now(),mode:portfolioEntry.mode,pending:portfolioEntry.pending})},true)});
   for(const target of ['about','process']){
    await page.locator(`#${target}-control`)[name==='touch'?'tap':'click']();
    await page.waitForTimeout(100);
    const before=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending}));
    assert.equal(before.mode,target);assert.equal(before.pending,true);
    const box=await page.locator('#studio-back').boundingBox();assert.ok(box);
    if(name==='touch')await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
    else await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await page.waitForTimeout(1300);
    const settled=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,back:portfolioNav.getState().backVisible,about:portfolioAbout.getState(),process:portfolioProcess.getState()}));
    assert.equal(settled.mode,'home');assert.equal(settled.pending,false);assert.equal(settled.back,false);
    await page.waitForTimeout(1700);
    const late=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,events:navTrustedEvents.slice(-2)}));
    assert.equal(late.mode,'home');assert.equal(late.pending,false);assert.ok(late.events.every(e=>e.trusted));assert.equal(late.events[1].id,'studio-back');assert.equal(late.events[1].pending,true);
    report.cases.push({device:name,target,before,settled,late});
   }
   await page.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{
  fs.writeFileSync(path.join(__dirname,'early-back-results.json'),JSON.stringify(report,null,2));await browser.close();
 }
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
