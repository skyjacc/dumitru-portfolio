const fs=require('node:fs'),path=require('node:path'),pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const base=process.env.ORIGIN||'http://127.0.0.1:8943';
(async()=>{const results=[];
for(const cfg of [{name:'chromium390',engine:'chromium',width:390,height:844},{name:'webkit320',engine:'webkit',width:320,height:640}].filter(c=>!process.env.ENGINE||c.name===process.env.ENGINE)){
const browser=await pw[cfg.engine].launch({headless:true});const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},isMobile:true,hasTouch:true,deviceScaleFactor:3});page.setDefaultTimeout(8000);
const report={cfg,checks:[],errors:[]};results.push(report);page.on('pageerror',e=>report.errors.push(e.message));
const state=()=>page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,intent:document.body.dataset.entryTarget,key:portfolioRuntime.focusedKey,index:portfolioRuntime.materialIndex,moving:portfolioRuntime.moving,about:portfolioAbout.getState(),lang:portfolioI18n.locale,rootInert:document.querySelector('#portfolio-root').inert,homeInert:document.querySelector('#studio-home').inert,processVisible:!document.querySelector('#studio-process').hidden,url:location.pathname}));
const wait=m=>page.waitForFunction(m=>portfolioEntry.mode===m&&!portfolioEntry.pending&&!portfolioRuntime.moving,m,{timeout:15000});
const tap=async(s,m)=>{await page.locator(s).tap();if(m)await wait(m)};
async function check(name,pass,data){report.checks.push({name,pass,data});console.log(JSON.stringify({browser:cfg.name,name,pass,data}));if(!pass)await page.screenshot({path:path.join(__dirname,cfg.name+'-'+name.replace(/\W+/g,'-')+'.png'),scale:'css'});}
try{
await page.goto(base,{waitUntil:'commit',timeout:30000});await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await wait('home');
// Real UI inputs with different timing, not synthetic state mutation.
const targets=[['#about-control','about'],['#process-control','process'],['#work-toggle','work'],['#nav-contact','about']];
for(const [a,am]of targets){for(const [b,bm]of targets){if(a===b)continue;await page.evaluate(()=>portfolioEntry.showHome());await wait('home');await tap(a);await page.waitForTimeout(90);await tap(b);await page.waitForTimeout(2200);const s=await state();await check(a+' then '+b,(!s.pending)&&(['home','about','process'].includes(s.mode)?!s.homeInert:!s.rootInert),s);await tap('#studio-back').catch(()=>{});await page.waitForTimeout(1000);}}
await page.evaluate(()=>portfolioEntry.showHome());await wait('home');await tap('#about-control','about');
for(let i=0;i<6;i++){
await tap('.about-photo-grid button[data-photo="'+i+'"]');await page.waitForTimeout(100);
await check('gallery opens photo '+i,(await state()).about.photo===i,await state());
await tap('.about-photo-back');await page.waitForTimeout(100);await check('gallery back '+i,(await state()).about.view==='profile',await state());
}
await tap('#nav-contact');await page.waitForTimeout(260);await tap('.about-copy-email');await page.waitForTimeout(260);
await check('copy contact gives status',await page.locator('.about-copy-status').textContent().then(Boolean),{text:await page.locator('.about-copy-status').textContent()});
await tap('.about-contact-back');await page.waitForTimeout(260);await check('contact back profile',(await state()).about.view==='profile',await state());
// Language burst, including a resize mid-transition, must leave coherent text.
await page.evaluate(()=>{portfolioI18n.setLocale('ru');setTimeout(()=>portfolioI18n.setLocale('ro'),10);setTimeout(()=>portfolioI18n.setLocale('en'),20)});await page.waitForTimeout(1400);await check('last language wins',(await state()).lang==='en',await state());
await page.setViewportSize({width:844,height:390});await page.waitForTimeout(650);await tap('.about-nav-contact');await page.waitForTimeout(260);await tap('.about-contact-back');await page.waitForTimeout(260);await tap('#studio-back','home');
await tap('#work-toggle','work');
for(const key of ['andra','btb','fkd','ora','bonanza']){
await page.evaluate(k=>portfolioEntry.open(k),key);await wait('detail');
let seq=[(await state()).index];for(let i=0;i<4;i++){await tap('#next-material');await page.waitForTimeout(1000);seq.push((await state()).index);}
await check('four nexts '+key,seq.join(',')==='0,1,2,3,0',seq);
await tap('#process-control','process');await tap('#studio-back');await page.waitForTimeout(1000);await check('Process back detail '+key,(await state()).mode==='detail'&&(await state()).key===key,await state());
await tap('#studio-back');await wait('work');
}
await check('no page errors',report.errors.length===0,report.errors);
}catch(e){report.failure=e.stack;report.state=await state().catch(()=>null);console.error(cfg.name,e.message);await page.screenshot({path:path.join(__dirname,cfg.name+'-scenario-failure.png'),scale:'css'}).catch(()=>{});}
fs.writeFileSync(path.join(__dirname,'races-phone'+(process.env.ENGINE?'-'+process.env.ENGINE:'')+'.json'),JSON.stringify({base,results},null,2));await browser.close();
}})();
