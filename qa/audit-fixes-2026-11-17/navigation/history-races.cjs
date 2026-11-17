const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright')}
const engine=process.env.ENGINE||'webkit',origin=process.env.ORIGIN||'http://127.0.0.1:8943',out=process.env.OUT||path.join(__dirname,engine+'-history-races');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await pw[engine].launch({headless:true}),page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,deviceScaleFactor:3}),report={checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const state=()=>page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,key:portfolioRuntime.focusedKey,view:portfolioAbout.getState().view,url:location.pathname+location.search}));
const check=async(name,test)=>{const s=await state(),pass=await test(s);report.checks.push({name,pass,state:s});console.log((pass?'PASS ':'FAIL ')+name);if(!pass)throw Error(name)};
const settled=mode=>page.waitForFunction(mode=>window.portfolioEntry?.mode===mode&&!portfolioEntry.pending&&(!['detail','work'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:25000,polling:100});
const home=async()=>{await page.locator('#home-control').tap();await settled('home')};
try{await page.goto(origin,{waitUntil:'commit'});await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});
for(const [selector,mode,query] of [['#about-control','about','about'],['#process-control','process','process'],['#work-toggle','work','work'],['#nav-contact','about','contact']]){
 await home();await page.locator(selector).tap();await page.waitForTimeout(90);await page.goBack();await settled('home');await page.waitForTimeout(1200);await check('Back during '+query+' approach',s=>s.mode==='home'&&s.url==='/');
 await page.goForward();await page.waitForTimeout(90);await page.locator(query==='work'?'#nav-contact':'#work-toggle').tap();await settled(query==='work'?'about':'work');await check('Latest intent during Forward '+query,s=>query==='work'?s.mode==='about'&&s.url==='/?view=contact':s.mode==='work'&&s.url==='/?view=work');
}
await home();await page.locator('#about-control').tap();await settled('about');await page.goBack();await page.waitForTimeout(90);await page.goForward();await settled('about');await check('Back then Forward during phone retreat',s=>s.mode==='about'&&s.url==='/?view=about');
await home();await page.locator('#process-control').tap();await page.waitForTimeout(90);await page.locator('#studio-back').tap();await settled('home');await check('App Back during Process entrance',s=>s.mode==='home'&&s.url==='/');
await page.emulateMedia({reducedMotion:'reduce'});
for(const [route,mode,key,view] of [['/?view=work','work'],['/?view=process','process'],['/?view=about','about',null,'profile'],['/?view=contact','about',null,'contact'],['/work/despre','about',null,'profile'],['/work/process','process'],...['andra','btb','fkd','ora','bonanza'].map(key=>['/work/'+key,'detail',key])]){
 await page.goto(origin+route,{waitUntil:'commit'});await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await settled(mode);await check('Direct route '+route,s=>s.mode===mode&&(!key||s.key===key)&&(!view||s.view===view));
 if(key){await page.locator('#studio-back').tap();await settled('work');await check('Direct case Back '+key,s=>s.mode==='work')}
}
await page.screenshot({path:path.join(out,'last.png'),scale:'css'});await check('No browser errors',()=>report.errors.length===0);
}catch(e){report.failure=e.stack;report.last=await state().catch(()=>null);console.error(report.failure,report.last);await page.screenshot({path:path.join(out,'failure.png'),scale:'css'}).catch(()=>{});process.exitCode=1}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close()}})();
