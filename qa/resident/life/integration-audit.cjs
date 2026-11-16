/* Focused real-browser lifecycle/prop audit; no visual quality assertions. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');}
const root=path.resolve(__dirname,'../../..'),origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const files=['site/studio-companion.js','site/studio-character-rig.js','site/studio-character-life.js'];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,16)]));
(async()=>{
 const report={started:new Date().toISOString(),source:hashes(),checks:[],errors:[]};
 const browser=await pw.chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',error=>report.errors.push(error.message));
 const check=(name,pass,data)=>{report.checks.push({name,pass:!!pass,data});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
 const state=()=>page.evaluate(()=>portfolioCompanion.getState());
 const owners=()=>page.evaluate(()=>({original:portfolioCharacter.getState(),resident:portfolioCompanion.getState(),originalHidden:document.getElementById('loader-walker').hidden}));
 const originalOwnsHome=s=>s.original.active&&!s.original.retired&&!s.originalHidden&&!s.resident.active&&!s.resident.life.running&&!s.resident.frameScheduled&&!s.resident.life.frameScheduled&&!s.resident.life.timerScheduled;
 const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:30000});
 async function load(){
  await page.goto(origin+'/?review=life-integration');
  await page.waitForFunction(()=>window.portfolioCompanion&&portfolioLoader.getState().phase==='complete'&&document.body.dataset.resident==='ready',null,{timeout:45000});
  await settle('home');await page.waitForTimeout(2000);
  await page.evaluate(()=>{StudioCharacterLife.config.initialDelay=[100000,100000];portfolioCompanion.pause(false);});
 }
 try{
  await load();
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
  await page.locator('body').focus();await page.keyboard.press('w');await page.waitForTimeout(100);
  const reducedW=await owners();
  check('Home W remains owned by the original walker with no SVG activity',originalOwnsHome(reducedW)&&reducedW.original.activated&&reducedW.original.reducedMotion&&!reducedW.original.heldKeys.length,reducedW);

  await load();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
  await page.locator('body').focus();await page.keyboard.down('d');await page.waitForTimeout(100);
  await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.up('d');await page.waitForTimeout(100);
  const reducedDuringMove=await owners();
  check('changing reduced motion during Home movement leaves the original owner and clears held keys',originalOwnsHome(reducedDuringMove)&&reducedDuringMove.original.activated&&reducedDuringMove.original.reducedMotion&&!reducedDuringMove.original.heldKeys.length,reducedDuringMove);
  await load();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
  await page.locator('#work-toggle').click();await settle('work');await page.waitForTimeout(2000);
  await page.locator('#work-companion').focus();await page.keyboard.press('ArrowRight');
  const beforeHide=await state();
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  await page.waitForTimeout(100);
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await page.waitForTimeout(600);
  const afterShow=await state();
  check('pagehide/pageshow during landing releases direct-control state',!afterShow.life.pauseReasons.includes('drag')&&!afterShow.frameScheduled,{beforeHide,afterShow});

  await page.evaluate(()=>portfolioEntry.showHome());await settle('home');await page.waitForTimeout(2000);
  await page.locator('body').focus();await page.keyboard.down('d');await page.waitForTimeout(100);
  await page.evaluate(()=>portfolioEntry.open('process'));await page.keyboard.up('d');await settle('process');await page.waitForTimeout(1500);
  const afterKeyNavigation=await owners();
  check('leaving Home while holding D suspends its controller and releases SVG input ownership',!afterKeyNavigation.original.active&&!afterKeyNavigation.original.retired&&afterKeyNavigation.originalHidden&&!afterKeyNavigation.original.heldKeys.length&&!afterKeyNavigation.original.animating&&afterKeyNavigation.resident.mode==='process'&&!afterKeyNavigation.resident.life.pauseReasons.includes('drag'),afterKeyNavigation);

  await page.evaluate(()=>{
   StudioCharacterLife.config.timeScale=.22;
   StudioCharacterLife.config.contextDelay=[200,200];
   StudioCharacterLife.config.restDelay=[3000,3000];
   portfolioCompanion.seed(1);
   portfolioEntry.open('andra');
  });await settle('detail');
  const transitionReady=await page.waitForFunction(()=>!portfolioCompanion.getState().life.pauseReasons.includes('input'),null,{timeout:6000}).then(()=>true,()=>false);
  check('Process to project settles without a stale navigation blocker',transitionReady,await state());
  if(!transitionReady)throw Error('Process → detail retained inputBusy after actual navigation completed');
  await page.evaluate(()=>{
   window.__lifeAuditFrames=[];window.__lifeAuditActive=true;
   const sample=()=>{if(!__lifeAuditActive)return;const s=portfolioCompanion.getState();
    __lifeAuditFrames.push({at:performance.now(),activity:s.life.activity,phase:s.life.phase,token:s.life.token,variant:s.life.variant,
     action:s.action,hidden:s.hiddenReason,position:s.position,fixture:s.fixture,held:s.held,hand:s.rig?.handProp,props:s.rig?.fixtures,
     mask:document.querySelector('.resident-body')?.style.clipPath||document.querySelector('[data-resident-layer=body]')?.style.clipPath||'',
     occluded:document.querySelector('#work-companion').dataset.occluded});requestAnimationFrame(sample)};sample();
   window.__fetchResult=portfolioCompanion.play('fetch',{debug:false});__fetchResult.then(result=>window.__fetchFinished=result);
  });
  await page.waitForFunction(()=>__lifeAuditFrames.some(x=>x.activity==='carryFlower'&&x.phase==='finish'),null,{timeout:20000});
  await page.waitForFunction(()=>__lifeAuditFrames.some(x=>x.props?.some(p=>p.kind==='flower')&&x.hand===null),null,{timeout:12000});
  await page.waitForTimeout(300);
  const flower=await page.evaluate(()=>{__lifeAuditActive=false;return{frames:__lifeAuditFrames,result:portfolioCompanion.getState()}});
  const fetch=flower.frames.filter(x=>x.activity==='fetch'),carry=flower.frames.filter(x=>x.activity==='carryFlower');
  const placed=flower.frames.filter(x=>x.props?.some(p=>p.kind==='flower'));
  check('ANDRA fetch approaches then carries using a new scene token',fetch.length&&carry.length&&fetch.at(-1).token!==carry[0].token,{fetch:fetch.filter((_,i)=>i%12===0),carry:carry.filter((_,i)=>i%12===0)});
  check('flower is released at planting contact without a duplicate held flower',placed.length&&placed.every(x=>!x.hand)&&placed.some(x=>x.phase==='finish'),placed.filter((_,i)=>i%5===0));
  check('fetch uses actual occlusion and a finite hide/return displacement',fetch.some(x=>x.occluded==='true')&&Math.max(...fetch.map(x=>x.position.x))-Math.min(...fetch.map(x=>x.position.x))>10,fetch.filter((_,i)=>i%10===0));
  check('carryFlower fixture adopts the new token at its own destination',carry.filter(x=>x.fixture).every(x=>x.fixture.owner===x.token),carry.filter(x=>x.fixture).filter((_,i)=>i%8===0));
  for(const [key,variant,prop] of [['ora',12,'schematic'],['bonanza',11,'menu']]){
   await page.evaluate(key=>portfolioEntry.open(key),key);await settle('detail');
   await page.waitForFunction(()=>portfolioCompanion.getState().life.activity==='read'&&portfolioCompanion.getState().life.phase==='perform',null,{timeout:15000});
   const reading=await state();check(key+' uses the matching contextual read variant',reading.life.variant===variant&&reading.rig.handProp?.kind===prop,reading);
  }
 }catch(error){report.error=error.stack;report.failureState=await page.evaluate(()=>({companion:window.portfolioCompanion?.getState(),entry:window.portfolioEntry?.mode,pending:window.portfolioEntry?.pending,moving:window.portfolioRuntime?.moving,fetchFinished:window.__fetchFinished,frames:window.__lifeAuditFrames?.filter((_,i)=>i%12===0)})).catch(()=>null);console.error(error.stack);process.exitCode=1;}
 finally{
  report.endSource=hashes();report.finished=new Date().toISOString();report.allPass=!report.error&&!report.errors.length&&report.checks.every(x=>x.pass);
  fs.writeFileSync(path.join(__dirname,'integration-audit-results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({checks:report.checks.map(({name,pass})=>({name,pass})),errors:report.errors,sourceChanged:JSON.stringify(report.source)!==JSON.stringify(report.endSource)}));
  await browser.close();if(!report.allPass)process.exitCode=1;
 }
})();
