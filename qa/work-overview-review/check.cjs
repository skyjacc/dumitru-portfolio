const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const {instrumentation,settle,equalCamera,drag}=require('../open-close-review/helpers.cjs');
const report={checks:[],errors:[]},note=(name,passed,detail={})=>{report.checks.push({name,passed,...detail});if(!passed)console.log('FAIL',name,detail)};
const reducedOnly=process.env.QA_REDUCED_ONLY==='1';
if(reducedOnly&&fs.existsSync(path.join(__dirname,'report.json'))){const previous=JSON.parse(fs.readFileSync(path.join(__dirname,'report.json'),'utf8'));report.checks=previous.checks.filter(check=>!check.name.includes('/reduced'));report.errors=previous.errors.filter(error=>!error.label?.includes('/reduced'))}
const nav=(p,detail)=>p.evaluate(detail=>{if(window.portfolioEntry){if(detail.action==='overview')return portfolioEntry.enterWork();if(detail.key&&detail.key!=='home')return portfolioEntry.open(detail.key)}return window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail}))},detail);
const state=p=>p.evaluate(()=>portfolioRuntime);
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [width,height,reduced]of [[1440,900,false],[390,844,false],[320,568,false],[854,480,false],[1440,900,true],[390,844,true]].filter(run=>!reducedOnly||run[2])){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500,reducedMotion:reduced?'reduce':'no-preference'}),label=`${width}x${height}/${reduced?'reduced':'normal'}`;
 page.on('pageerror',error=>report.errors.push({label,error:error.message}));await instrumentation(page);await page.goto('http://127.0.0.1:8943');await page.waitForFunction(()=>window.portfolioRuntime?.ready&&(!window.portfolioEntry||portfolioEntry.ready)&&!document.getElementById('studio-loader'));await settle(page);await page.waitForTimeout(500);
 const target=(await state(page)).workOverviewCamera,start=(await state(page)).camera,entering=nav(page,{action:'overview'});
 const frames=[];for(let i=0;i<12;i++){frames.push((await state(page)).camera);await page.waitForTimeout(45)}await entering;await settle(page,null);
 const overview=await state(page),centers=await page.evaluate(()=>__qaProjectCenters().filter(p=>['andra','btb','fkd','ora','bonanza'].includes(p.key)));
 note(`${label}: exact fitted overview`,equalCamera(overview.camera,target)&&overview.focusedKey===null,{target,actual:overview.camera});
 note(`${label}: five cases inside safe viewport`,centers.length===5&&centers.every(p=>p.x>20&&p.x<width-20&&p.y>80&&p.y<height-60),{centers});
 note(`${label}: native flight has intermediate positions`,reduced||frames.some(frame=>!equalCamera(frame,start)&&!equalCamera(frame,target)),{samples:frames.length});
 await page.screenshot({path:path.join(__dirname,`${width}-${height}-${reduced?'reduced':'normal'}.png`)});
 for(const key of ['btb','despre','process']){
  await nav(page,{key});await settle(page,key);const opened=await state(page);note(`${label}/${key}: saved Work overview`,equalCamera(opened.returnCamera,target));await nav(page,{action:'return'});await settle(page,null);note(`${label}/${key}: exact overview return`,equalCamera((await state(page)).camera,target));
 }
 await drag(page,{x:width*.48,y:height*.50},{x:width*.53,y:height*.53},width<500);await settle(page);note(`${label}: drag retains overview zoom`,Math.abs((await state(page)).camera.zoom-target.zoom)<1e-6,{actual:(await state(page)).camera.zoom,target:target.zoom});
 await nav(page,{action:'overview'});await settle(page,null);await page.mouse.move(width*.48,height*.55);await page.mouse.wheel(0,80);await page.waitForTimeout(650);const wheelState=await settle(page,null);await page.waitForTimeout(250);const wheelStable=await state(page);note(`${label}: wheel retains stable gesture zoom without focus`,wheelStable.workOverviewActive&&!wheelStable.focusedKey&&equalCamera(wheelState.camera,wheelStable.camera)&&Math.abs(wheelStable.camera.zoom-target.zoom)>1e-6,{actual:wheelStable.camera.zoom,initial:target.zoom});
 await nav(page,{key:'btb'});await settle(page,'btb');await nav(page,{action:'overview'});await settle(page,null);note(`${label}: overview safely leaves focused route`,equalCamera((await state(page)).camera,target)&&new URL(page.url()).pathname==='/');
 if(width===1440&&!reduced){await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await settle(page,null);const resized=await state(page);note('Work overview refits on resize',resized.workOverviewActive&&equalCamera(resized.camera,resized.workOverviewCamera),{resized:resized.camera,target:resized.workOverviewCamera})}
 await page.evaluate(()=>{window.__nativeHomeEvents=0;addEventListener('portfolio:nativehome',()=>window.__nativeHomeEvents++);portfolioEntry.showHome()});await page.waitForTimeout(150);note(`${label}: native Home signal and context reset`,await page.evaluate(()=>__nativeHomeEvents>0&&!portfolioRuntime.workOverviewActive&&portfolioEntry.mode==='home'));
 await page.close();
}
await browser.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failures:report.checks.filter(c=>!c.passed),errors:report.errors},null,2));if(report.errors.length||report.checks.some(c=>!c.passed))process.exitCode=1;
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify({...report,fatal:error.message},null,2));process.exitCode=1});
