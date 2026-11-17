/* Read-only visual and keyboard audit. Own browser/context, no runtime mutation. */
const fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const out=__dirname,origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const configs=[
 {name:'desktop',w:1440,h:900,lang:'en'},
 {name:'mobile390',w:390,h:844,lang:'en',touch:true},
 {name:'mobile320-ru',w:320,h:568,lang:'ru',touch:true},
 {name:'landscape-ru',w:844,h:390,lang:'ru',touch:true},
 {name:'desktop2k',w:2560,h:1440,lang:'ro'}
];
(async()=>{
 const browser=await pw[process.env.REVIEW_ENGINE||'chromium'].launch({headless:true});const results=[];
 for(const cfg of configs){
  if(process.env.REVIEW_SIZE&&process.env.REVIEW_SIZE!==cfg.name)continue;
  const ctx=await browser.newContext({viewport:{width:cfg.w,height:cfg.h},deviceScaleFactor:cfg.touch?3:1,isMobile:!!cfg.touch,hasTouch:!!cfg.touch});
  await ctx.addInitScript(lang=>localStorage.setItem('portfolio.locale',lang),cfg.lang);
  const p=await ctx.newPage(),record={config:cfg,states:[],errors:[]};p.on('pageerror',e=>record.errors.push(e.message));
  const settled=mode=>p.waitForFunction(mode=>window.portfolioEntry?.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!window.portfolioRuntime?.moving),mode,{timeout:25000});
  const snapshot=async name=>{
   await p.waitForTimeout(1000);
   await p.screenshot({path:path.join(out,cfg.name+'-'+name+'.png'),scale:'css'});
   const state=await p.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
    const els=[...document.querySelectorAll('button,a[href],input,[tabindex="0"]')].filter(e=>{const c=getComputedStyle(e);return !e.closest('[hidden],[inert]')&&c.visibility!=='hidden'&&c.display!=='none'&&e.getBoundingClientRect().width>0});
    return{mode:portfolioEntry.mode,lang:document.documentElement.lang,title:document.title,scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],viewport:[innerWidth,innerHeight],focus:document.activeElement?.id,phone:window.portfolioAbout?.getState(),geometry:window.portfolioWorkGeometry?.(),controls:els.map(e=>({tag:e.tagName,id:e.id,cls:e.className,text:(e.getAttribute('aria-label')||e.innerText||'').slice(0,100),rect:rect(e),font:getComputedStyle(e).fontSize,ariaHidden:!!e.closest('[aria-hidden="true"]')}))};
   });
   state.name=name;record.states.push(state);
  };
  const tabAudit=async name=>{
   await p.evaluate(()=>document.activeElement.blur());const stops=[];
   for(let i=0;i<22;i++){await p.keyboard.press('Tab');stops.push(await p.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,id:e.id,text:(e.getAttribute('aria-label')||e.innerText||'').slice(0,100),rect:{x:r.x,y:r.y,w:r.width,h:r.height},outline:s.outline,hidden:!!e.closest('[aria-hidden="true"],[inert]'),clip:s.clipPath}}));}
   record[name+'Tabs']=stops;fs.writeFileSync(path.join(out,cfg.name+'-'+name+'-ax.txt'),await p.locator('body').ariaSnapshot());
  };
  try{
   await p.goto(origin,{waitUntil:'commit',timeout:60000});await p.waitForFunction(()=>window.portfolioEntry?.ready,null,{timeout:45000});await settled('home');await p.waitForTimeout(600);
   await snapshot('home');if(cfg.name==='desktop')await tabAudit('home');
   await p.locator('#process-control').click();await settled('process');await snapshot('process');
   await p.locator('#about-control').click();await settled('about');await snapshot('about');if(cfg.name==='desktop')await tabAudit('about');
   await p.locator('#nav-contact').click();await settled('about');await snapshot('contact');
   await p.locator('#work-toggle').click();await settled('work');await snapshot('work');if(cfg.name==='desktop')await tabAudit('work');
   await p.evaluate(()=>portfolioEntry.open('andra'));await settled('detail');await snapshot('andra');
   await p.locator('[data-material="2"]').click();await p.waitForFunction(()=>portfolioRuntime.materialIndex===2&&!portfolioRuntime.moving);await p.waitForTimeout(500);await snapshot('andra-mobile');if(cfg.name==='desktop')await tabAudit('detail');
   await p.locator('#work-toggle').click();await settled('work');await p.evaluate(()=>portfolioEntry.open('ora'));await settled('detail');await snapshot('ora');
  }catch(e){record.error=e.stack;record.failureState=await p.evaluate(()=>({mode:window.portfolioEntry?.mode,ready:window.portfolioEntry?.ready,pending:window.portfolioEntry?.pending,loader:window.portfolioLoader?.getState(),visibility:document.visibilityState})).catch(()=>null);await p.screenshot({path:path.join(out,cfg.name+'-ERROR.png'),scale:'css'}).catch(()=>{});}
  results.push(record);fs.writeFileSync(path.join(out,'report-'+cfg.name+'.json'),JSON.stringify(record,null,2));console.log(JSON.stringify({size:cfg.name,states:record.states.length,error:record.error,errors:record.errors}));await ctx.close();
 }
 await browser.close();
})();
