/* About blank-space dismissal and Work section toggle: real browser input. */
const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
const out=path.join(__dirname,'nav-correction');fs.mkdirSync(out,{recursive:true});
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const sizes=[{name:'desktop',engine:'chromium',w:1440,h:900},{name:'touch390',engine:'chromium',w:390,h:844,touch:true},{name:'webkit320',engine:'webkit',w:320,h:640,touch:true}];
(async()=>{
 const report=[];
 for(const cfg of sizes){
  if(process.env.REVIEW_ENGINE&&process.env.REVIEW_ENGINE!==cfg.name)continue;
  const browser=await pw[cfg.engine].launch({headless:true,...(cfg.engine==='chromium'?{channel:'chrome'}:{})});
  const page=await browser.newPage({viewport:{width:cfg.w,height:cfg.h},hasTouch:!!cfg.touch,isMobile:!!cfg.touch,deviceScaleFactor:cfg.touch?3:1});
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  const check=(name,pass,data)=>checks.push({name,pass,data});
  const click=selector=>cfg.touch?page.locator(selector).tap():page.locator(selector).click();
  const settled=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:30000});
  const blank=()=>page.evaluate(()=>{const r=document.querySelector('.desk-phone').getBoundingClientRect();for(const y of [innerHeight*.8,innerHeight*.55,innerHeight-22])for(const x of [12,innerWidth-12]){const target=document.elementFromPoint(x,y);if((x<r.left||x>r.right||y<r.top||y>r.bottom)&&!target?.closest('#portfolio-ui,.desk-phone,button,a,#work-companion'))return{x,y};}throw Error('No blank test point');});
  const tap=async p=>cfg.touch?page.touchscreen.tap(p.x,p.y):page.mouse.click(p.x,p.y);
  const gesture=async(from,to,returnToStart=false)=>{
   if(cfg.touch&&cfg.engine==='chromium'){
    const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...from}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...to}]});
    if(returnToStart)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...from}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
   }else{
    await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:6});if(returnToStart)await page.mouse.move(from.x,from.y,{steps:6});await page.mouse.up();
   }
  };
  try{
   await page.goto(origin);await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await settled('home');
   check('Work has no menu or popup semantics',await page.evaluate(()=>!document.getElementById('work-list')&&!document.getElementById('work-toggle').hasAttribute('aria-controls')&&!document.getElementById('work-toggle').hasAttribute('aria-expanded')));
   await click('#work-toggle');await settled('work');await click('#work-toggle');await settled('home');
   check('Work toggles Home → Work → Home',true);
   await click('#work-toggle');await page.waitForFunction(()=>document.body.dataset.entryTarget==='work');await click('#work-toggle');await settled('home');await page.waitForTimeout(1200);
   check('second Work press during approach cancels without late reopening',await page.evaluate(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending));
   await click('#work-toggle');await settled('work');
   const camera=await page.evaluate(()=>({...portfolioRuntime.camera}));
   await page.evaluate(()=>portfolioEntry.open('andra'));await settled('detail');await click('#work-toggle');await settled('work');
   const returned=await page.evaluate(()=>({...portfolioRuntime.camera}));
   check('Work from project returns to saved gallery camera',Math.max(...['x','y','zoom'].map(k=>Math.abs(camera[k]-returned[k])))<.05,{camera,returned});
   await click('#about-control');await settled('about');
   await click('.about-profile-bio');check('phone text click keeps About open',await page.evaluate(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending));
   await click('#language-toggle');await page.waitForTimeout(150);check('language navigation keeps About open',await page.evaluate(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending));await click('#language-toggle');
   const p=await blank();await gesture(p,{x:p.x,y:p.y-45},true);await page.waitForTimeout(200);
   check('background drag ending at its start does not dismiss',await page.evaluate(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending));
   const phone=await page.locator('.about-profile-bio').boundingBox();await gesture({x:phone.x+phone.width/2,y:phone.y+phone.height/2},p);await page.waitForTimeout(200);
   check('gesture beginning inside phone and ending outside does not dismiss',await page.evaluate(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending));
   await tap(await blank());await settled('home');await page.waitForTimeout(350);
   const dismissed=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,visible:portfolioAbout.getState().visible,focus:document.activeElement.id,tag:document.activeElement.tagName}));
   check('blank-space tap closes About opened from Work to Home once',dismissed.mode==='home'&&!dismissed.pending&&!dismissed.visible&&dismissed.focus==='about-control',dismissed);
   await click('#about-control');await settled('about');
   await click('.about-photo-grid button[data-photo="0"]');check('photo opens inside phone without dismissal',await page.evaluate(()=>portfolioEntry.mode==='about'&&portfolioAbout.getState().photo===0));
   await click('.about-photo-back');check('photo Back stays in About',await page.evaluate(()=>portfolioEntry.mode==='about'&&portfolioAbout.getState().photo===-1));
   await click('#work-toggle');await settled('work');check('About → Work uses gallery with no index popup',await page.evaluate(()=>!portfolioAbout.getState().visible&&!document.getElementById('work-list')));
   await click('#process-control');await settled('process');await click('#work-toggle');await settled('work');check('Process → Work enters gallery',true);
   await page.keyboard.press('Escape');await settled('home');check('Escape still closes Work without obsolete index DOM',true);
   await page.emulateMedia({reducedMotion:'reduce'});await click('#about-control');await settled('about');await tap(await blank());await settled('home');
   check('reduced-motion About dismissal completes',await page.evaluate(()=>!portfolioAbout.getState().visible));
   await page.screenshot({path:path.join(out,cfg.name+'-home.png'),scale:'css'});
   check('no browser errors',errors.length===0,errors);
  }catch(e){check('scenario completed',false,{error:e.message,state:await page.evaluate(()=>({mode:window.portfolioEntry?.mode,pending:window.portfolioEntry?.pending,intent:document.body.dataset.entryTarget})).catch(()=>null)});}
  report.push({config:cfg,checks,errors});console.log(JSON.stringify({name:cfg.name,total:checks.length,failed:checks.filter(x=>!x.pass)}));await browser.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(report.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;
})();
