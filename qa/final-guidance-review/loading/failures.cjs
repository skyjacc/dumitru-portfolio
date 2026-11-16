const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const origin='http://127.0.0.1:8943',results=[];
const save=()=>fs.writeFileSync(path.join(__dirname,'failures.json'),JSON.stringify(results,null,2));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 for(const scenario of ['notebook-error','slow-laptop','native-fallback','reduced']){
  const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:scenario==='reduced'?'reduce':'no-preference'}),p=await c.newPage();
  const r={scenario,checks:[],errors:[],intercepted:[]};results.push(r);
  const check=(name,pass,data)=>{r.checks.push({name,pass:!!pass,data});save();};
  p.on('pageerror',e=>r.errors.push(e.message));
  if(scenario==='notebook-error')await p.route('**/hero/desk/v3/**',async route=>{if(/notebook/.test(route.request().url())){r.intercepted.push(route.request().url());return route.fulfill({status:404,body:'Intentional review image failure'})}await route.continue()});
  if(scenario==='slow-laptop')await p.route('**/hero/desk/v2/**',async route=>{if(/laptop/.test(route.request().url())){r.intercepted.push(route.request().url());await wait(14000)}await route.continue().catch(()=>{})});
  if(scenario==='native-fallback')await p.route('**/0n9xfy8bxft48.js',async route=>{let source=fs.readFileSync(path.join(__dirname,'../../../site/_next/static/chunks/0n9xfy8bxft48.js'),'utf8');const needle="Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:snapshot});";if(!source.includes(needle))throw Error('Native QA anchor missing');source=source.replace(needle,"Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:()=>({...snapshot(),ready:window.__qaNativeRecover===true})});");r.intercepted.push(route.request().url());await route.fulfill({contentType:'application/javascript',body:source})});
  await p.goto(origin+'/?review=final-loading-'+scenario,{waitUntil:'domcontentloaded'});
  if(scenario==='slow-laptop'||scenario==='native-fallback'){
   await p.waitForFunction(()=>portfolioLoader.getState().elapsed>=700&&document.querySelector('#portfolio-ui'));
   await p.keyboard.press('Enter');await p.keyboard.press('Home');await p.mouse.wheel(0,1000);
   check('loading background remains inert',await p.evaluate(()=>!portfolioEntry.ready&&document.querySelector('#portfolio-ui').inert&&document.querySelector('#studio-home').inert));
   await p.locator('#loader-continue').waitFor({state:'visible',timeout:15000});
   check('slow loading exposes continue',await p.evaluate(()=>portfolioLoader.getState().elapsed>=6900));
   await p.locator('#loader-continue').tap();
  }
  await p.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:18000});
  await p.waitForFunction(()=>document.querySelector('#studio-home').dataset.paperReveal==='done');
  r.loader=await p.evaluate(()=>portfolioLoader.getState());
  check('loader removed and Home available',await p.evaluate(()=>!document.querySelector('#studio-loader')&&portfolioEntry.ready&&portfolioEntry.mode==='home'&&!document.querySelector('#portfolio-ui').inert));
  if(scenario==='notebook-error'){
   check('image failure recognized and broken image hidden',await p.evaluate(()=>portfolioLoader.getState().loadingFailed&&document.querySelector('.desk-notebook .desk-cutout>img').hidden));
   await p.locator('#process-control').tap();await p.waitForFunction(()=>portfolioEntry.mode==='process'&&!portfolioEntry.pending);
   check('Process still opens after image failure',await p.locator('#studio-process').isVisible());
  }
  if(scenario==='slow-laptop'){
   check('continue does not wait for slow image',r.loader.skipped&&r.loader.elapsed<13000);
   await p.waitForFunction(()=>document.querySelector('.desk-laptop .desk-cutout>img').naturalWidth>0,null,{timeout:18000});
   await p.locator('#enter-work').tap();await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);
   check('late laptop loads and opens Work',await p.evaluate(()=>portfolioRuntime.workOverviewActive));
  }
  if(scenario==='native-fallback'){
   await p.waitForFunction(()=>document.querySelectorAll('#studio-fallback a').length===5);
   check('native fallback provides five direct case links',await p.locator('#studio-fallback a').count()===5);
   await p.evaluate(()=>window.__qaNativeRecover=true);await p.waitForFunction(()=>!document.querySelector('#studio-fallback'));
   await p.locator('#work-toggle').tap();await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);
   check('native readiness recovers without reload',await p.evaluate(()=>portfolioRuntime.workOverviewActive));
  }
  if(scenario==='reduced')check('reduced motion removes artificial hold',r.loader.elapsed<2000&&!r.loader.walking);
  check('no JavaScript errors',!r.errors.length,r.errors);
  await p.screenshot({path:path.join(__dirname,scenario+'.png')});await c.close();save();console.log(JSON.stringify({scenario,checks:r.checks.length,failed:r.checks.filter(c=>!c.pass)}));
 }
}finally{await b.close();save()}
if(results.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;
})().catch(e=>{console.error(e);save();process.exitCode=1});
