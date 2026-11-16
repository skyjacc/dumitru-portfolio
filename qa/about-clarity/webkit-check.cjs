const {webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const report={started:new Date().toISOString(),engine:'Playwright WebKit on Windows; iPhone touch/viewport emulation, not a physical iPhone',runs:[]};
const save=()=>fs.writeFileSync(path.join(__dirname,'webkit-report.json'),JSON.stringify(report,null,2));
(async()=>{const browser=await webkit.launch({headless:true});try{for(const [w,h] of [[390,844],[393,620]])for(const dpr of [1,3]){
 const context=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'});const p=await context.newPage();p.setDefaultTimeout(20000);
 const run={w,h,dpr,errors:[],checks:[],locales:[]};report.runs.push(run);p.on('pageerror',e=>run.errors.push(e.message));
 const check=(name,pass,data)=>{run.checks.push({name,pass:!!pass,data});save();if(!pass)console.log('FAIL',w,h,dpr,name,JSON.stringify(data));};
 await p.goto('http://127.0.0.1:8943/?v=about-webkit',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.portfolioEntry?.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done',null,{timeout:30000});
 run.loader=await p.evaluate(()=>portfolioLoader.getState());run.ua=await p.evaluate(()=>navigator.userAgent);
 for(const locale of ['en','ro','ru']){
  if(locale!=='en'){await p.locator('#language-toggle').tap();await p.locator(`[data-locale="${locale}"]`).tap();await p.waitForFunction(l=>portfolioI18n.locale===l,locale);await p.waitForTimeout(600)}
  await p.locator('#about-control').tap();await p.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);await p.waitForTimeout(250);
  const data=await p.evaluate(()=>{
   const rect=e=>e.getBoundingClientRect().toJSON(),phone=document.querySelector('.desk-phone'),screen=document.querySelector('#studio-about'),profile=document.querySelector('.about-phone-profile');
   const metrics=selector=>{const e=document.querySelector(selector);let scale=1;for(let n=e;n;n=n.parentElement){const t=getComputedStyle(n).transform;if(t!=='none'){const m=new DOMMatrix(t);scale*=Math.hypot(m.a,m.b)}}const s=getComputedStyle(e);return{text:e.textContent,font:parseFloat(s.fontSize),effectiveFont:parseFloat(s.fontSize)*scale,scale,rect:rect(e),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth}};
   return{mode:portfolioEntry.mode,locale:portfolioI18n.locale,lang:document.documentElement.lang,phone:rect(phone),screen:rect(screen),profile:rect(profile),scrollHeight:profile.scrollHeight,clientHeight:profile.clientHeight,profileScroll:profile.scrollTop,htmlOverflow:document.documentElement.scrollWidth>innerWidth,orientation:phone.dataset.aboutOrientation,scale:phone.style.getPropertyValue('--about-focus-scale'),bio:metrics('.about-profile-bio'),tag:metrics('.about-profile-heading p'),name:metrics('.about-profile-heading h2'),place:metrics('.about-profile-place'),instagram:metrics('.about-instagram')};
  });run.locales.push(data);
  check(locale+' bio >=14px',data.bio.effectiveFont>=13.99,data.bio);
  check(locale+' tagline >=11px',data.tag.effectiveFont>=10.99,data.tag);
  check(locale+' name >=20px',data.name.effectiveFont>=19.99,data.name);
  check(locale+' secondary >=12px',data.place.effectiveFont>=11.99,data.place);
  check(locale+' screen stays inside phone',data.screen.left>=data.phone.left-1&&data.screen.top>=data.phone.top-1&&data.screen.right<=data.phone.right+1&&data.screen.bottom<=data.phone.bottom+1,{phone:data.phone,screen:data.screen});
  check(locale+' key copy stays within screen width',[data.bio,data.tag,data.name,data.place].every(v=>v.rect.left>=data.screen.left-1&&v.rect.right<=data.screen.right+1&&v.scrollWidth<=v.clientWidth+1),{bio:data.bio.rect,tag:data.tag.rect});
  check(locale+' no horizontal overflow',!data.htmlOverflow);
  check(locale+' no AI mention in profile',!/(\bAI\b|ИИ|\bIA\b)/u.test([data.bio.text,data.tag.text].join(' ')),{bio:data.bio.text,tag:data.tag.text});
  await p.screenshot({path:path.join(__dirname,`webkit-${w}x${h}-dpr${dpr}-${locale}.png`)});
  if(h<700){await p.locator('.about-instagram').scrollIntoViewIfNeeded();const bottom=await p.evaluate(()=>{const s=document.querySelector('#studio-about').getBoundingClientRect(),a=document.querySelector('.about-instagram').getBoundingClientRect(),profile=document.querySelector('.about-phone-profile');return{scrollTop:profile.scrollTop,screenBottom:s.bottom,linkTop:a.top,linkBottom:a.bottom}});check(locale+' full short profile reachable by native scrolling',bottom.scrollTop>0&&bottom.linkBottom<=bottom.screenBottom+1,bottom);await p.screenshot({path:path.join(__dirname,`webkit-${w}x${h}-dpr${dpr}-${locale}-scrolled.png`)});}
  await p.locator('[data-photo="0"]').tap();check(locale+' photo tap opens',await p.evaluate(()=>portfolioAbout.getState().photo===0));
  if(locale==='en')await p.screenshot({path:path.join(__dirname,`webkit-${w}x${h}-dpr${dpr}-photo.png`)});
  await p.locator('.about-photo-back').tap();check(locale+' photo back restores profile',await p.evaluate(()=>portfolioAbout.getState().view==='profile'));
  await p.locator('#studio-back').tap();await p.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);check(locale+' scene Back restores Home',await p.evaluate(()=>!portfolioAbout.getState().visible));
 }
 check('no JavaScript errors',run.errors.length===0,run.errors);await context.close();console.log(w+'x'+h+' dpr'+dpr+' done');
 }}finally{await browser.close();report.finished=new Date().toISOString();save()}console.log(JSON.stringify({runs:report.runs.length,checks:report.runs.flatMap(r=>r.checks).length,failures:report.runs.flatMap(r=>r.checks).filter(c=>!c.pass)}));})().catch(e=>{report.error=e.stack;save();console.error(e);process.exitCode=1});
