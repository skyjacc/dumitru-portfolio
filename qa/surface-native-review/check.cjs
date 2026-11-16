const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const {instrumentation,settle,equalCamera,pointer}=require('../open-close-review/helpers.cjs');
const report={checks:[],errors:[]};
const note=(name,passed,detail={})=>{report.checks.push({name,passed,...detail});if(!passed)console.log('FAIL',name,detail)};
const nav=(p,detail)=>p.evaluate(detail=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail})),detail);
const state=p=>p.evaluate(()=>portfolioRuntime);
async function selected(p,key,index){await p.waitForFunction(({key,index})=>portfolioSurfaces.getIndex(key)===index&&!portfolioSurfaces.getState(key).loading,{key,index})}
async function hit(p,key,index){return p.evaluate(({key,index})=>{for(let y=70;y<innerHeight-65;y+=5)for(let x=20;x<innerWidth-20;x+=5){const h=__qaHitAt(x,y);if(h.surface?.key===key&&h.surface.index===index)return{x,y}}return null},{key,index})}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [width,height]of [[1440,900],[390,844],[320,568]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500});
  page.on('pageerror',error=>report.errors.push({width,error:error.message}));
  await instrumentation(page);await page.goto('http://127.0.0.1:8943');
  await page.waitForFunction(()=>window.portfolioRuntime?.ready&&window.portfolioSurfaces?.count('despre')===7);await settle(page);
  note(`${width}: seven objects`,(await state(page)).projects.length===7);
  for(const key of ['despre','process']){
   const origin=await state(page);await nav(page,{key});await settle(page,key);await selected(page,key,0);
   const opened=await state(page),count=key==='despre'?7:5;
   note(`${width}/${key}: one native plane`,opened.materialCount===1&&opened.materialGeometry?.boxes.filter(x=>x.alpha>0).length===1,{geometry:opened.materialGeometry});
   for(let index=0;index<count;index++){
    await page.evaluate(({key,index})=>portfolioSurfaces.setIndex(key,index),{key,index});await selected(page,key,index);
    const after=await state(page);note(`${width}/${key}/${index}: swap holds camera`,equalCamera(opened.camera,after.camera)&&after.materialIndex===0&&after.focusedKey===key);
   }
   await page.mouse.move(width/2,height/2);await page.mouse.wheel(0,500);await page.waitForTimeout(160);
   note(`${width}/${key}: focused wheel holds surface`,equalCamera(opened.camera,(await state(page)).camera)&&await page.evaluate(({key,count})=>portfolioSurfaces.getIndex(key)===count-1,{key,count}));
   for(const locale of ['ro','ru','en']){
    await page.evaluate(locale=>portfolioI18n.setLocale(locale),locale);await selected(page,key,count-1);
    const surface=await page.evaluate(key=>portfolioSurfaces.getState(key),key);
    note(`${width}/${key}/${locale}: localized selection retained`,surface.url.endsWith('-'+locale+'.svg')&&equalCamera(opened.camera,(await state(page)).camera),{surface});
   }
   await page.evaluate(key=>portfolioSurfaces.setIndex(key,0),key);await selected(page,key,0);
   const target=await hit(page,key,key==='despre'?6:4);note(`${width}/${key}: last native click target`,!!target,{target});
   if(target){await pointer(page,width,target.x,target.y);await selected(page,key,key==='despre'?6:4);note(`${width}/${key}: actual canvas click selects`,(await state(page)).focusedKey===key&&equalCamera(opened.camera,(await state(page)).camera));}
   if(width===390){await page.waitForTimeout(5200);note(`${key}: idle does not advance`,await page.evaluate(({key,count})=>portfolioSurfaces.getIndex(key)===count-1,{key,count}));}
   await page.screenshot({path:path.join(__dirname,`${width}-${key}.png`)});
   await nav(page,{action:'return'});await settle(page,null);note(`${width}/${key}: exact return`,equalCamera(origin.camera,(await state(page)).camera));
  }
  await page.close();
 }
 const direct=await browser.newPage({viewport:{width:390,height:844}});direct.on('pageerror',error=>report.errors.push({error:error.message}));
 for(const key of ['despre','process']){await direct.goto('http://127.0.0.1:8943/work/'+key);await direct.waitForFunction(()=>window.portfolioRuntime?.ready);await settle(direct,key);note(`${key}: direct route`,(await state(direct)).focusedKey===key)}
 const race=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 race.on('pageerror',error=>report.errors.push({error:error.message}));await instrumentation(race);
 let release;const gate=new Promise(resolve=>release=resolve);
 await race.route('**/photo-6-en.svg*',async route=>{await gate;await route.continue()});
 try{
  await race.goto('http://127.0.0.1:8943');await race.waitForFunction(()=>window.portfolioRuntime?.ready);await nav(race,{key:'despre'});await settle(race,'despre');await selected(race,'despre',0);
  const before=await state(race);await race.evaluate(()=>{void portfolioSurfaces.setIndex('despre',6)});
  await race.waitForFunction(()=>portfolioSurfaces.getState('despre').loading&&portfolioSurfaces.getIndex('despre')===6);
  const pending=await race.evaluate(()=>portfolioSurfaces.getState('despre')),visibleTile=await hit(race,'despre',1);
  note('Pending photo keeps visible profile hit semantics',pending.appliedIndex===0&&!!visibleTile,{pending,visibleTile});
  if(visibleTile){await pointer(race,390,visibleTile.x,visibleTile.y);await selected(race,'despre',1)}
  release();await race.waitForTimeout(600);
  note('Stale photo response cannot replace newer selection',await race.evaluate(()=>portfolioSurfaces.getState('despre').appliedIndex===1)&&equalCamera(before.camera,(await state(race)).camera));
 }finally{release();await race.close()}
 await browser.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:report.checks.length,failures:report.checks.filter(x=>!x.passed),errors:report.errors},null,2));
 if(report.errors.length||report.checks.some(x=>!x.passed))process.exitCode=1;
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify({...report,fatal:error.message},null,2));process.exitCode=1});
