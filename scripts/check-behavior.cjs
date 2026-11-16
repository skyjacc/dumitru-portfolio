const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}}),report={started:new Date().toISOString(),errors:[],checks:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const state=()=>page.evaluate(()=>window.portfolioRuntime),nav=detail=>page.evaluate(detail=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail})),detail);
const settled=async()=>{await page.waitForTimeout(100);await page.waitForFunction(()=>window.portfolioRuntime?.ready&&!window.portfolioRuntime.moving,{},{timeout:20000});};
const same=(a,b)=>['x','y','zoom'].every(k=>Math.abs(a[k]-b[k])<.000001);
await page.goto('http://127.0.0.1:8943/');await page.waitForTimeout(4000);await settled();report.initial=await state();
await page.mouse.move(1100,700);await page.mouse.wheel(0,110);await page.waitForTimeout(900);await settled();let before=await state();
await nav({key:'btb'});await settled();let opened=await state();await page.mouse.wheel(0,480);await page.waitForTimeout(900);let wheeled=await state();report.checks.push({name:'focused wheel preserves camera and project',passed:same(opened.camera,wheeled.camera)&&wheeled.focusedKey==='btb',opened,wheeled});
await nav({action:'material',index:2});await page.waitForTimeout(700);let manual=await state();await page.waitForTimeout(4500);let later=await state();report.checks.push({name:'manual material selection and no timed advance',passed:manual.materialIndex===2&&later.materialIndex===2,manual,later});
await page.screenshot({path:path.join(__dirname,'../qa/behavior-btb-selected.png')});await nav({action:'return'});await settled();let returned=await state();report.checks.push({name:'exact return to prior overview camera',passed:same(before.camera,returned.camera)&&returned.focusedKey===null,before,returned});
await nav({key:'despre'});await page.waitForTimeout(120);await nav({action:'return'});await page.waitForTimeout(90);await nav({key:'btb'});await settled();await nav({action:'return'});await settled();let rapid=await state();report.checks.push({name:'interrupted return/reopen retains original snapshot',passed:same(before.camera,rapid.camera)&&rapid.focusedKey===null,rapid});
for(const key of ['andra','btb','fkd','ora','bonanza','despre']){await nav({key});await settled();await page.waitForTimeout(120);let first=await state();await nav({action:'material',index:1});await page.waitForTimeout(700);let next=await state();report.checks.push({name:`${key} material selector`,passed:next.materialIndex===1&&next.focusedKey===key,mode:first.materialMode,next});await nav({action:'return'});await settled();}
await page.emulateMedia({reducedMotion:'reduce'});let reducedBefore=await state();await nav({key:'btb'});await settled();await nav({action:'return'});await settled();let reducedAfter=await state();report.checks.push({name:'reduced-motion exact return',passed:same(reducedBefore.camera,reducedAfter.camera)});
report.finished=new Date().toISOString();fs.writeFileSync(path.join(__dirname,'../qa/behavior-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.map(({name,passed,mode})=>({name,passed,mode})),errors:report.errors,initial:report.initial},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
