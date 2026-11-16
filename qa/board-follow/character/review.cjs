const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin='http://127.0.0.1:8943',out=__dirname;
const near=(a,b,keys=['x','y'])=>keys.every(k=>Math.abs(a[k]-b[k])<.03);
(async()=>{
 const checks=[],errors=[];const check=(name,pass,data)=>checks.push({name,pass,data});
 for(const mobile of [false,true]){
  const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1}),label=mobile?'touch':'desktop';
  page.on('pageerror',e=>{const text=label+': '+e.message;if(!errors.includes(text))errors.push(text)});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:25000});
  const idle=()=>page.waitForFunction(()=>!portfolioCompanion.getState().frameScheduled&&!portfolioCompanion.getState().dragging,null,{timeout:12000});
  const state=()=>page.evaluate(()=>({c:portfolioCompanion.getState(),g:portfolioWorkGeometry(),camera:{...portfolioRuntime.camera}}));
  await page.goto(origin+'/?review=board-follow');await page.waitForFunction(()=>portfolioEntry?.ready&&portfolioLoader.getState().phase==='complete',null,{timeout:45000});
  await page.locator('#work-toggle').click();await settle('work');await idle();
  await page.evaluate(()=>{window.__follow=[];addEventListener('portfolio:boardframe',event=>{const c=portfolioCompanion.getState(),home=portfolioWorkGeometry().home,{camera,fitScale}=event.detail,unit=camera.zoom*fitScale;if(c.mode!=='work'||c.dragging||c.action!=='idle'||!c.position)return;const p=c.position,expected={x:innerWidth/2+(home.x+c.worldPos.x-camera.x)*unit,y:innerHeight/2+(home.y+c.worldPos.y-camera.y)*unit,scale:unit*c.worldSize};window.__follow.push({error:Math.max(Math.abs(p.x-expected.x),Math.abs(p.y-expected.y)),scaleError:Math.abs(p.scale-expected.scale),position:p,unit,world:c.worldPos});if(window.__follow.length>3000)window.__follow.splice(0,1000);});});
  const initial=await state();
  if(!mobile){
   await page.mouse.move(900,560);await page.mouse.down();await page.mouse.move(1220,700,{steps:18});await page.mouse.up();await page.waitForTimeout(1300);
   const pan=await state();check(label+' board drag moves screen position, not world position',near(initial.c.worldPos,pan.c.worldPos)&&!near(initial.c.position,pan.c.position),{before:initial.c,after:pan.c});
   await page.mouse.move(1000,500);for(let i=0;i<8;i++){await page.mouse.wheel(0,-180);await page.waitForTimeout(50);}await page.waitForTimeout(1400);
  }else{
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:320,y:480}]});
   for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:320-i*14,y:480-i*3}]});await page.waitForTimeout(20);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(1300);
   const pan=await state();check(label+' board pan keeps world position',near(initial.c.worldPos,pan.c.worldPos)&&!near(initial.c.position,pan.c.position),{before:initial.c.position,after:pan.c.position});
   const fingers=d=>[{id:1,x:195-d,y:510},{id:2,x:195+d,y:510}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers(28)});
   for(let i=1;i<=14;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:fingers(28+i*5)});await page.waitForTimeout(20);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await page.waitForTimeout(1400);
  }
  const zoomed=await state(),samples=await page.evaluate(()=>window.__follow);
  check(label+' character scales with board zoom',Math.abs(zoomed.g.unitScale-initial.g.unitScale)>.005&&Math.abs(zoomed.c.position.scale/initial.c.position.scale-zoomed.g.unitScale/initial.g.unitScale)<.001,{before:initial.c.position,after:zoomed.c.position,unitBefore:initial.g.unitScale,unitAfter:zoomed.g.unitScale});
  check(label+' every rendered gesture frame is board anchored',samples.length>20&&samples.every(s=>s.error<.03&&s.scaleError<.0001),{samples:samples.length,maxError:Math.max(...samples.map(s=>s.error)),maxScaleError:Math.max(...samples.map(s=>s.scaleError))});
  check(label+' pan and zoom never rewrite world position',near(initial.c.worldPos,zoomed.c.worldPos),zoomed.c.worldPos);
  await page.screenshot({path:path.join(out,label+'-zoomed.png'),scale:'css'});
  const saved=await state();await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=andra]').click();await settle('detail');
  await page.waitForFunction(()=>!portfolioCompanion.getState().awaitingProject&&document.getElementById('work-companion').dataset.visible==='true');await idle();
  const observer=await page.evaluate(()=>{const n=document.getElementById('work-companion'),r=n.getBoundingClientRect(),front=portfolioWorkGeometry().front,controls=['previous-material','next-material'].map(id=>document.getElementById(id).getBoundingClientRect()),overlap=b=>r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top;return{visible:getComputedStyle(n).visibility==='visible'&&Number(getComputedStyle(n).opacity)>.9,frontOverlap:overlap(front),arrowOverlap:controls.some(overlap),rect:r.toJSON()}});
  check(label+' detail observer is visible and clear of artwork and arrows',observer.visible&&!observer.frontOverlap&&!observer.arrowOverlap,observer);
  await page.screenshot({path:path.join(out,label+'-detail.png'),scale:'css'});
  await page.locator('#studio-back').click();await settle('work');await idle();const back=await state();
  check(label+' Back restores saved world position and camera',near(saved.c.worldPos,back.c.worldPos)&&near(saved.camera,back.camera,['x','y','zoom']),{saved:saved.c.worldPos,back:back.c.worldPos});
  await page.setViewportSize(mobile?{width:390,height:760}:{width:1280,height:800});await page.waitForTimeout(250);const resize=await state();
  check(label+' viewport resize does not relocate world object',near(back.c.worldPos,resize.c.worldPos),resize.c.worldPos);
  // Return to the normal Work composition so the handle can be exercised.
  await page.evaluate(()=>portfolioEntry.showHome());await settle('home');await page.locator('#work-toggle').click();await settle('work');await idle();
  const beforeDrag=await state(),p=beforeDrag.c.position;
  if(mobile){
   const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:p.x,y:p.y}]});
   for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:p.x+4*i,y:p.y+2*i}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+55,p.y+25,{steps:8});await page.mouse.up();}
  await idle();const dragged=await state();check(label+' explicit character drag still moves it without camera',!near(beforeDrag.c.worldPos,dragged.c.worldPos)&&near(beforeDrag.camera,dragged.camera,['x','y','zoom']),{before:beforeDrag.c.worldPos,after:dragged.c.worldPos});
  await browser.close();
 }
 check('no browser errors',errors.length===0,errors);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
