const {chromium,request}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {settle,equalCamera,clickUI,pointer}=require('../open-close-review/helpers.cjs');
const arg=process.argv[2];if(!arg)throw new Error('Usage: node check-public.cjs https://deployed-site.example/');
const parsed=new URL(arg);if(!/^https?:$/.test(parsed.protocol))throw new Error('Pass an HTTP(S) deployment URL');
const origin=parsed.origin,site=path.resolve(__dirname,'../../site'),epsilon=1e-6;
const report={origin,checkedAt:new Date().toISOString(),epsilon,http:[],hashes:[],checks:[],screens:[],runs:[],errors:[]};
const save=()=>fs.writeFileSync(path.join(__dirname,'public-check.json'),JSON.stringify(report,null,2));
function check(name,passed,detail={}){report.checks.push({name,passed,...detail});save();console.log(`${passed?'PASS':'FAIL'} ${name}`)}
const same=(a,b)=>equalCamera(a,b,epsilon),sha=body=>crypto.createHash('sha1').update(body).digest('hex');
const state=p=>p.evaluate(()=>({runtime:portfolioRuntime,about:portfolioSurfaces.getState('despre'),process:portfolioSurfaces.getState('process'),locale:portfolioI18n.locale}));
async function stable(p,key){await settle(p,key);await p.waitForTimeout(180);return state(p)}
async function loaded(p,key,index,locale){await p.waitForFunction(({key,index,locale})=>{const s=window.portfolioSurfaces?.getState(key);return s&&s.index===index&&s.appliedIndex===index&&!s.loading&&s.locale===locale},{key,index,locale},{timeout:20000});await p.waitForTimeout(180);return state(p)}
async function language(p,width,code){await clickUI(p,`[data-locale="${code}"]`,width);await p.waitForFunction(code=>portfolioI18n.locale===code,code)}
async function capture(p,width,name){const file=`public-${width}-${name}.png`;await p.screenshot({path:path.join(__dirname,file)});report.screens.push(file);save()}
async function ready(p){await p.waitForFunction(()=>window.portfolioRuntime?.ready&&window.portfolioSurfaces&&document.querySelector('#help-control'),null,{timeout:30000});await p.waitForTimeout(2200)}
(async()=>{
const api=await request.newContext({baseURL:origin});let browser;
try{
 const routes=['/','/work/andra','/work/btb','/work/fkd','/work/ora','/work/bonanza','/work/despre','/work/process','/assets/about/phone/profile-en.svg','/assets/about/phone/photo-6-en.svg','/assets/about/phone/profile-ru.svg','/assets/about/phone/photo-6-ru.svg','/assets/process/step-4-ru.svg'];
 for(const route of routes){const response=await api.get(route),contentType=response.headers()['content-type']||'',isSvg=route.endsWith('.svg'),isPage=!isSvg;const row={route,status:response.status(),contentType};report.http.push(row);check(`HTTP ${route}`,response.status()===200&&(!isSvg||/^image\/svg\+xml(?:;|$)/i.test(contentType))&&(!isPage||/^text\/html(?:;|$)/i.test(contentType)),row)}
 const manifestFile=path.join(__dirname,'manifest.json'),manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):null;
 check('Release manifest is available',Array.isArray(manifest));
 for(const file of ['portfolio-ui.js','portfolio.css','portfolio-data.json','portfolio-i18n.js','_next/static/chunks/0n9xfy8bxft48.js','_next/static/chunks/1l2px902fb04m.js']){
  const response=await api.get('/'+file),publicBody=await response.body(),localBody=fs.readFileSync(path.join(site,file)),entry=manifest?.find(x=>x.file===file),localHash=sha(localBody),publicHash=sha(publicBody),row={file,status:response.status(),contentType:response.headers()['content-type'],cacheControl:response.headers()['cache-control'],localHash,publicHash,manifestHash:entry?.sha,localBytes:localBody.length,publicBytes:publicBody.length,manifestBytes:entry?.size};
  report.hashes.push(row);check(`Published/manifest/local bytes ${file}`,response.status()===200&&publicHash===localHash&&entry?.sha===localHash&&entry?.size===localBody.length&&publicBody.length===localBody.length,row);
 }
 browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [1440,390]){
  const height=width===1440?900:844,context=await browser.newContext({viewport:{width,height},locale:'ro-RO',hasTouch:width<500,isMobile:width<500}),page=await context.newPage(),run={width,height,errors:[],consoleErrors:[],badResponses:[],failedRequests:[]};report.runs.push(run);
  page.on('pageerror',e=>run.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')run.consoleErrors.push(m.text())});page.on('response',r=>{if(r.status()>=400)run.badResponses.push({url:r.url(),status:r.status()})});page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')run.failedRequests.push({url:r.url(),error:r.failure()?.errorText})});
  try{
   await page.goto(origin,{waitUntil:'domcontentloaded'});await ready(page);const home=await stable(page,null);
   const nav=await page.evaluate(()=>({locale:portfolioI18n.locale,lang:document.documentElement.lang,labels:[...document.querySelectorAll('.portfolio-nav [data-copy]')].map(e=>e.textContent),languages:[...document.querySelectorAll('[data-locale]')].map(e=>e.textContent),stored:localStorage.getItem('portfolio-language')}));run.initial=nav;
   check(`${width} anonymous default English and navigation`,nav.locale==='en'&&nav.lang.startsWith('en')&&JSON.stringify(nav.labels)===JSON.stringify(['Work','Process','About','Contact'])&&JSON.stringify(nav.languages)===JSON.stringify(['EN','RO','RU']),nav);
   check(`${width} surface counts 7 / 5`,home.about.count===7&&home.process.count===5);await capture(page,width,'home-en');
   await clickUI(page,'#about-control',width);await stable(page,'despre');const profile=await loaded(page,'despre',0,'en');
   check(`${width} About profile index 0 loaded`,profile.about.appliedIndex===0&&!profile.about.loading&&profile.about.url.endsWith('/assets/about/phone/profile-en.svg')&&same(profile.runtime.returnCamera,home.runtime.camera),{surface:profile.about});
   if(width===1440)await clickUI(page,'#material-dots [data-material="6"]',width);else for(let index=1;index<=6;index++){await clickUI(page,'#next-material',width);await loaded(page,'despre',index,'en')}
   const photo=await loaded(page,'despre',6,'en');check(`${width} About photo index 6 loaded with stable camera`,photo.about.url.endsWith('/assets/about/phone/photo-6-en.svg')&&same(profile.runtime.camera,photo.runtime.camera)&&same(profile.runtime.returnCamera,photo.runtime.returnCamera),{surface:photo.about});
   await language(page,width,'ro');const photoRo=await loaded(page,'despre',6,'ro');const aboutLabels=await page.locator('#material-dots button').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
   check(`${width} About RO preserves index and both cameras`,photoRo.about.url.endsWith('/assets/about/phone/photo-6-ro.svg')&&same(photo.runtime.camera,photoRo.runtime.camera)&&same(photo.runtime.returnCamera,photoRo.runtime.returnCamera)&&aboutLabels[0]==='Profil'&&aboutLabels[6]==='Fotografie 6',{surface:photoRo.about,labels:aboutLabels});await capture(page,width,'about-photo6-ro');
   await clickUI(page,'#return-control',width);const aboutBack=await stable(page,null);check(`${width} About Back restores saved camera`,same(profile.runtime.returnCamera,aboutBack.runtime.camera));
   await clickUI(page,'#process-control',width);const opened=await stable(page,'process');await loaded(page,'process',0,'ro');
   // Exercise visible step 04 and the last zero-based index 4, covering both meanings of "step 4".
   if(width===1440)await clickUI(page,'#material-dots [data-material="3"]',width);else for(let index=1;index<=3;index++){await clickUI(page,'#next-material',width);await loaded(page,'process',index,'ro')}
   const fourth=await loaded(page,'process',3,'ro');check(`${width} Process step 04 loads without camera movement`,same(fourth.runtime.camera,opened.runtime.camera)&&same(fourth.runtime.returnCamera,opened.runtime.returnCamera));
   await clickUI(page,'#next-material',width);const last=await loaded(page,'process',4,'ro');await language(page,width,'ru');const processRu=await loaded(page,'process',4,'ru');
   const processLabels=await page.locator('#material-dots button').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
   check(`${width} Process index 4 RU preserves index and both cameras`,processRu.process.url.endsWith('/assets/process/step-4-ru.svg')&&same(last.runtime.camera,processRu.runtime.camera)&&same(last.runtime.returnCamera,processRu.runtime.returnCamera)&&JSON.stringify(processLabels)===JSON.stringify(['Задача','Структура','Дизайн','Разработка','Запуск']),{surface:processRu.process,labels:processLabels});await capture(page,width,'process-index4-ru');
   const backBox=await page.locator('#return-control').boundingBox();await pointer(page,width,backBox.x+backBox.width/2,backBox.y+backBox.height/2);await page.waitForTimeout(180);await pointer(page,width,backBox.x+backBox.width/2,backBox.y+backBox.height/2);await stable(page,null);await page.waitForTimeout(400);const processBack=await state(page);
   check(`${width} Process double Back 180 ms restores exact saved camera`,processBack.runtime.focusedKey===null&&same(processRu.runtime.returnCamera,processBack.runtime.camera),{saved:processRu.runtime.returnCamera,actual:processBack.runtime.camera});
   await page.goto(origin+'/work/process',{waitUntil:'domcontentloaded'});await ready(page);await stable(page,'process');const direct=await loaded(page,'process',0,'ru');check(`${width} direct /work/process opens loaded Process and keeps locale`,direct.runtime.focusedKey==='process'&&direct.process.count===5&&direct.locale==='ru'&&direct.process.url.endsWith('/assets/process/step-0-ru.svg'),{surface:direct.process});
   await clickUI(page,'#return-control',width);const beforeReopen=await stable(page,null);
   await clickUI(page,'#work-toggle',width);await clickUI(page,'#work-list [data-key="andra"]',width);const reopenedAndra=await stable(page,'andra');
   await clickUI(page,'#return-control',width);await page.waitForTimeout(180);
   // Enter through the native navigation bridge, matching a canvas project opening during return.
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key:'btb'}})));
   const midReturnBtb=await stable(page,'btb');await clickUI(page,'#return-control',width);await stable(page,null);await page.waitForTimeout(400);const reopenedBack=await state(page);
   check(`${width} native BTB opened mid-return still closes to original camera`,midReturnBtb.runtime.focusedKey==='btb'&&same(reopenedAndra.runtime.returnCamera,beforeReopen.runtime.camera)&&same(midReturnBtb.runtime.returnCamera,beforeReopen.runtime.camera)&&reopenedBack.runtime.focusedKey===null&&same(reopenedBack.runtime.camera,beforeReopen.runtime.camera),{original:beforeReopen.runtime.camera,andraSaved:reopenedAndra.runtime.returnCamera,btbSaved:midReturnBtb.runtime.returnCamera,actual:reopenedBack.runtime.camera});
  }catch(error){run.fatal=error.stack;check(`${width} browser flow completed`,false,{error:error.message})}
  finally{check(`${width} no JavaScript/console/resource errors`,run.errors.length===0&&run.consoleErrors.length===0&&run.badResponses.length===0&&run.failedRequests.length===0,{errors:run.errors,consoleErrors:run.consoleErrors,badResponses:run.badResponses,failedRequests:run.failedRequests});await context.close();save()}
 }
}finally{await browser?.close();await api.dispose()}
report.finishedAt=new Date().toISOString();report.passed=report.checks.every(c=>c.passed);save();console.log(JSON.stringify({origin,passed:report.passed,checks:report.checks.length,failures:report.checks.filter(c=>!c.passed),screens:report.screens},null,2));if(!report.passed)process.exitCode=1;
})().catch(error=>{report.errors.push(error.stack);report.passed=false;save();console.error(error);process.exitCode=1});
