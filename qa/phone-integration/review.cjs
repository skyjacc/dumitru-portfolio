/* Real-input review of the shared spatial About/Contact phone. No runtime edits. */
const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
const out=__dirname,origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const configs=[{name:'desktop',engine:'chromium',w:1440,h:900},{name:'touch390',engine:'chromium',w:390,h:844,touch:true},{name:'webkit320',engine:'webkit',w:320,h:640,touch:true},{name:'landscape',engine:'chromium',w:844,h:390,touch:true}];
const selectors={contact:'#nav-contact',about:'#about-control',work:'#work-toggle',back:'#studio-back',phone:'.desk-phone',screen:'#studio-about',profile:'.about-phone-profile',photoBack:'.about-photo-back',previous:'.about-photo-previous',next:'.about-photo-next',photos:'.about-photo-grid button',story:'.about-phone-story'};
const EMAIL='andrusciac.dumitru@gmail.com';
(async()=>{
 const report=[];
 for(const cfg of configs){
  if(process.env.REVIEW_ENGINE&&process.env.REVIEW_ENGINE!==cfg.name)continue;
  const browser=await pw[cfg.engine].launch({headless:true,...(cfg.engine==='chromium'?{channel:'chrome'}:{})});
  const context=await browser.newContext({viewport:{width:cfg.w,height:cfg.h},isMobile:!!cfg.touch,hasTouch:!!cfg.touch,deviceScaleFactor:cfg.touch?3:1});
  const page=await context.newPage(),checks=[],errors=[];
  page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
  const check=(name,pass,data)=>{checks.push({name,pass,...(data===undefined?{}:{data})});if(!pass)console.log(JSON.stringify({config:cfg.name,name,pass,data}));};
  const click=selector=>cfg.touch?page.locator(selector).tap():page.locator(selector).click();
  const settled=mode=>page.waitForFunction(mode=>window.portfolioEntry?.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:25000});
  const view=which=>page.waitForFunction(which=>{const s=window.portfolioAbout?.getState();return s?.visible&&s.view===which&&!s.transitioning},which,{timeout:10000});
  const tap=async point=>cfg.touch?page.touchscreen.tap(point.x,point.y):page.mouse.click(point.x,point.y);
  const blank=()=>page.evaluate(()=>{const r=document.querySelector('.desk-phone').getBoundingClientRect();for(const y of [innerHeight*.8,innerHeight*.55,innerHeight-12])for(const x of [6,innerWidth-6]){const n=document.elementFromPoint(x,y);if((x<r.left||x>r.right||y<r.top||y>r.bottom)&&!n?.closest('#portfolio-ui,.desk-phone,button,a,#work-companion'))return{x,y}}throw Error('No blank point outside phone');});
  const rect=()=>page.locator(selectors.phone).boundingBox();
  const state=()=>page.evaluate(()=>({entry:portfolioEntry.mode,pending:portfolioEntry.pending,phone:portfolioAbout.getState(),current:{about:document.getElementById('about-control').getAttribute('aria-current'),contact:document.getElementById('nav-contact').getAttribute('aria-current')},title:document.title,focus:document.activeElement.className}));
  const home=async()=>{if(await page.evaluate(()=>portfolioEntry.mode!=='home'||portfolioEntry.pending)){await click('#home-control');await settled('home')}await page.waitForTimeout(120);};
  const open=async(which)=>{await click(which==='contact'?selectors.contact:selectors.about);await settled('about');await view(which);await page.waitForTimeout(110);};
  const record=async(name,fn)=>{try{await fn()}catch(e){check(name,false,{error:e.message,state:await state().catch(()=>null)})}};
  const phoneFixedDuring=async(action)=>{
   await page.evaluate(()=>{window.__phoneQA=[];const start=performance.now();function frame(){const r=document.querySelector('.desk-phone').getBoundingClientRect();window.__phoneQA.push({x:r.x,y:r.y,width:r.width,height:r.height});if(performance.now()-start<750)requestAnimationFrame(frame)}requestAnimationFrame(frame)});
   await action();await page.waitForTimeout(780);
   return page.evaluate(()=>{const a=window.__phoneQA,first=a[0],drift=Math.max(...a.flatMap(r=>['x','y','width','height'].map(k=>Math.abs(r[k]-first[k]))));delete window.__phoneQA;return{samples:a.length,drift}});
  };
  const gesture=async(from,to)=>{
   if(cfg.touch&&cfg.engine==='chromium'){
    const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...from}]});
    for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8}]});await page.waitForTimeout(35);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
   }else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();}
  };
  try{
   await page.goto(origin);await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:30000});await settled('home');
   await record('Home → Contact',async()=>{
    await open('contact');const s=await state();check('Home Contact opens contact in spatial phone',s.phone.view==='contact'&&s.entry==='about',s);
    check('Contact nav current and title',s.current.contact==='page'&&s.current.about!=='page'&&s.title===`${await page.evaluate(()=>portfolioI18n.t('ui.contact'))} | Dumitru`,s);
    const links=await page.locator('#studio-about').evaluate(el=>[...el.querySelectorAll('a')].filter(a=>a.getClientRects().length).map(a=>({href:a.getAttribute('href'),text:a.innerText})));
    check('real email and Instagram links; no contact form',links.some(x=>x.href?.startsWith('mailto:andrusciac.dumitru@gmail.com'))&&links.some(x=>x.href==='https://www.instagram.com/_obllako_/')&&await page.locator('#studio-about form').count()===0,links);
    await page.screenshot({path:path.join(out,`${cfg.name}-contact.png`),scale:'css'});
    const reachable=[];for(const selector of ['.about-contact-email','.about-copy-email','.about-contact-instagram']){
     await page.locator(selector).scrollIntoViewIfNeeded();reachable.push(await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{selector:el.className,visible:x>=0&&x<=innerWidth&&y>=0&&y<=innerHeight&&el.contains(document.elementFromPoint(x,y))}}));
    }
    check('email copy and Instagram actions reachable inside viewport',reachable.every(x=>x.visible),reachable);
   });
   await record('Contact ↔ About interior switch',async()=>{
    const drift=await phoneFixedDuring(async()=>{await click(selectors.about);await view('profile')});check('Contact → About leaves physical phone stationary',drift.drift<1,drift);
    const s=await state();check('About nav current and title',s.current.about==='page'&&s.current.contact!=='page'&&s.title===`${await page.evaluate(()=>portfolioI18n.t('ui.about'))} | Dumitru`,s);
    await page.screenshot({path:path.join(out,`${cfg.name}-profile.png`),scale:'css'});
    const reverse=await phoneFixedDuring(async()=>{await click(selectors.contact);await view('contact')});check('About → Contact leaves physical phone stationary',reverse.drift<1,reverse);
    await page.keyboard.press('Escape');await view('profile');check('Escape from Contact returns to profile',await page.evaluate(()=>portfolioEntry.mode==='about'));
   });
   await record('Photo viewer all six and scroll restoration',async()=>{
    await home();await open('profile');
    for(let i=0;i<6;i++){
     await click(`${selectors.photos}[data-photo="${i}"]`);await view('photo');
     const data=await page.evaluate(()=>({state:portfolioAbout.getState(),image:document.querySelector('.about-photo-figure img')?.src,count:document.querySelector('.about-photo-count')?.textContent}));
     check(`photo ${i+1} opens correct local asset`,data.state.photo===i&&data.image?.endsWith(`photo-${i+1}.jpg`),data);
     if(i%2)await page.keyboard.press('Escape');else await click(selectors.photoBack);
     await view('profile');
    }
    await page.locator(selectors.profile).evaluate(el=>{el.scrollTop=el.scrollHeight});
    const requestedOffset=await page.locator(selectors.profile).evaluate(el=>el.scrollTop);
    // Bringing a clipped thumbnail into view is normal browser behavior. Compare
    // with the actual offset at activation, not a fixture offset before that scroll.
    await page.locator(`${selectors.photos}[data-photo="5"]`).scrollIntoViewIfNeeded();
    const before=await page.locator(selectors.profile).evaluate(el=>el.scrollTop);
    await click(`${selectors.photos}[data-photo="5"]`);await view('photo');await click(selectors.photoBack);await view('profile');
    const after=await page.locator(selectors.profile).evaluate(el=>el.scrollTop);check('profile scroll position restores after photo Back',Math.abs(before-after)<=2,{beforeRequested:requestedOffset,beforeClick:before,after});
    await click(`${selectors.photos}[data-photo="0"]`);await view('photo');
    const sequence=[];for(let i=0;i<5;i++){await click(selectors.next);await page.waitForFunction(index=>portfolioAbout.getState().photo===index&&!portfolioAbout.getState().transitioning,i+1);sequence.push(await page.evaluate(()=>portfolioAbout.getState().photo))}
    check('photo Next visits 1→2→3→4→5→6 without skips',sequence.join(',')==='1,2,3,4,5',sequence);
    check('last photo Next disabled',await page.locator(selectors.next).isDisabled());
    await click(selectors.previous);await page.waitForFunction(()=>portfolioAbout.getState().photo===4&&!portfolioAbout.getState().transitioning);check('Previous steps backward exactly once',true);
    const box=await page.locator('.about-photo-figure').boundingBox();await gesture({x:box.x+box.width*.75,y:box.y+box.height*.5},{x:box.x+box.width*.15,y:box.y+box.height*.5});
    await page.waitForTimeout(600);check(cfg.touch&&cfg.engine==='chromium'?'trusted touch swipe advances one photo':'pointer swipe advances one photo',await page.evaluate(()=>portfolioAbout.getState().photo===5),await page.evaluate(()=>portfolioAbout.getState()));
    await click(selectors.photoBack);await view('profile');
   });
   await record('Inner contact back and footer',async()=>{
    await home();await open('profile');await page.locator(selectors.profile).evaluate(el=>{el.scrollTop=el.scrollHeight});const before=await page.locator(selectors.profile).evaluate(el=>el.scrollTop);await click('.about-nav-contact');await view('contact');
    check('profile footer opens internal Contact',await page.evaluate(()=>portfolioEntry.mode==='about'));
    await click('.about-contact-back');await view('profile');check('inner Contact Back returns to profile',await page.evaluate(()=>portfolioEntry.mode==='about'));
    const after=await page.locator(selectors.profile).evaluate(el=>el.scrollTop);check('profile scroll position restores after Contact Back',Math.abs(before-after)<=2,{before,after});
   });
   await record('Clipboard success and fallback',async()=>{
    await home();await open('contact');
    if(cfg.engine==='chromium'){
     await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});await click('.about-copy-email');
     const content=await page.evaluate(()=>navigator.clipboard.readText());check('copy email writes actual browser clipboard',content===EMAIL,{content});
    }
    await page.evaluate(()=>{window.__originalClipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new DOMException('Clipboard denied','NotAllowedError'))});
    await click('.about-copy-email');await page.waitForTimeout(200);
    const fallback=await page.evaluate(()=>({text:getSelection()?.toString(),active:document.activeElement?.value||document.activeElement?.textContent,status:document.querySelector('.about-copy-status')?.textContent}));
    check('clipboard denial offers usable fallback',fallback.text===EMAIL||fallback.active===EMAIL||/copied|copiat|скопирован/i.test(fallback.status||''),fallback);
    await page.evaluate(()=>{navigator.clipboard.writeText=window.__originalClipboardWrite;delete window.__originalClipboardWrite});
   });
   await record('Blank dismissal / Work return / rapid cancellation',async()=>{
    await home();await click(selectors.work);await settled('work');const camera=await page.evaluate(()=>({...portfolioRuntime.camera}));await open('contact');
    await click(selectors.work);await settled('work');const returned=await page.evaluate(()=>({...portfolioRuntime.camera}));
    check('Work → Contact → Work returns gallery camera',Math.max(...['x','y','zoom'].map(k=>Math.abs(camera[k]-returned[k])))<.05,{camera,returned});
    await open('contact');await tap(await blank());await settled('home');await page.waitForTimeout(400);check('blank tap from Work Contact returns Home once',await page.evaluate(()=>portfolioEntry.mode==='home'&&!portfolioAbout.getState().visible));
    await open('profile');const p=await blank();await gesture(p,{x:p.x,y:p.y-40});await page.waitForTimeout(200);check('outside drag does not close profile',await page.evaluate(()=>portfolioEntry.mode==='about'));await tap(await blank());await settled('home');
    await click(selectors.contact);await page.waitForFunction(()=>document.body.dataset.entryTarget==='about');await click(selectors.contact);await settled('home');await page.waitForTimeout(800);
    check('rapid repeat Contact cancels without late reopening',await page.evaluate(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending&&!portfolioAbout.getState().visible));
    await open('profile');await click(selectors.about);await settled('home');check('repeat About closes like section toggle',true);
    await open('contact');await click(selectors.back);await settled('home');check('global Back closes whole phone from Contact',true);
   });
   await record('Localization and reduced motion',async()=>{
    await home();await open('profile');
    const samples=[];
    for(const locale of ['ro','ru','en']){
     await click('#language-toggle');await click(`[data-locale="${locale}"]`);await page.waitForFunction(l=>portfolioAbout.getState().locale===l,locale);await page.waitForTimeout(150);
     await click(selectors.contact);await view('contact');await page.waitForTimeout(150);
     samples.push(await page.evaluate(()=>({locale:portfolioAbout.getState().locale,lang:document.querySelector('#studio-about').lang,title:document.title,current:document.getElementById('nav-contact').getAttribute('aria-current'),text:document.querySelector('.about-phone-contact')?.innerText})));
     await click(selectors.about);await view('profile');
    }
    check('EN RO RU phone content, nav and title update',samples.every(s=>s.locale===s.lang&&s.current==='page')&&new Set(samples.map(s=>s.text)).size===3,samples);
    await home();await page.emulateMedia({reducedMotion:'reduce'});await open('contact');await click(selectors.about);await view('profile');await click(`${selectors.photos}[data-photo="0"]`);await view('photo');await page.keyboard.press('Escape');await view('profile');await page.keyboard.press('Escape');await settled('home');
    check('reduced motion keeps Contact/Profile/Photo/Back functional',await page.evaluate(()=>!portfolioAbout.getState().visible));
   });
   check('no uncaught browser errors',errors.length===0,errors);
  }catch(e){check('setup completed',false,{error:e.message,state:await state().catch(()=>null)})}
  report.push({config:cfg,checks,errors});fs.writeFileSync(path.join(out,`report-${cfg.name}.json`),JSON.stringify(report.at(-1),null,2));
  console.log(JSON.stringify({name:cfg.name,total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).map(c=>c.name)}));await context.close();await browser.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(report.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;
})();
