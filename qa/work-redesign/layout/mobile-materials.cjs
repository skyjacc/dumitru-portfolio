const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=__dirname,checks=[];
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});
 for(const [w,h,lang]of[[1440,900,'en'],[390,844,'en'],[393,620,'en'],[320,640,'ru']]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:w<500,isMobile:w<500}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=work-mobile-materials');
  await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
  if(lang==='ru')await page.evaluate(()=>portfolioI18n.setLocale('ru'));
  await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving&&!portfolioEntry.pending);await page.waitForTimeout(400);
  const before=await page.evaluate(()=>({...portfolioRuntime.camera}));
  if(w===390)await page.screenshot({path:path.join(out,'390-quiet-overview.png'),scale:'css'});
  for(const key of ['andra','btb','fkd','ora','bonanza']){
   await page.evaluate(key=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key}})),key);
   await page.waitForFunction(key=>portfolioRuntime.focusedKey===key&&!portfolioRuntime.moving,key,{timeout:15000});
   const positions=[];
   for(const index of[0,1,2,3]){
    await page.evaluate(index=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'material',index}})),index);
    await page.waitForFunction(index=>portfolioRuntime.materialIndex===index,index);await page.waitForTimeout(650);
    const state=await page.evaluate(()=>{const r=portfolioRuntime,g=r.materialGeometry,front=g.boxes.find(b=>b.front),scale=r.fitScale*r.camera.zoom;return{front,reference:g.reference,scale,camera:{...r.camera},safe:{...portfolioSafeArea},footer:document.querySelector('#project-controls').getBoundingClientRect().toJSON()}});
    positions.push({camera:state.camera,footer:state.footer});
    const fw=state.front.box.w*state.scale,fh=state.front.box.h*state.scale;
    checks.push({name:`${w} ${lang} ${key} material${index} bounds`,pass:fw>0&&fw<=w-16&&fh>0&&fh<=h-state.safe.top-70,width:fw,height:fh,geometry:state.front});
    if(index===0&&key==='ora'&&w<500)checks.push({name:`${w} ORA portrait front width`,pass:fw>=w*.74&&fw<=w*.81,width:fw});
    if((key==='ora'&&(index===0||index===3))||(key==='fkd'&&index===3))await page.screenshot({path:path.join(out,`${w}-${lang}-${key}-${index}.png`),scale:'css'});
   }
   checks.push({name:`${w} ${key} stable caption camera and controls across all materials`,pass:positions.every(p=>JSON.stringify(p)===JSON.stringify(positions[0]))});
   await page.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'return'}})));
   await page.waitForFunction(()=>!portfolioRuntime.focusedKey&&!portfolioRuntime.moving);const after=await page.evaluate(()=>({...portfolioRuntime.camera}));
   checks.push({name:`${w} ${key} exact return`,pass:['x','y','zoom'].every(k=>Math.abs(before[k]-after[k])<.01)});
  }
  checks.push({name:w+' no JS errors',pass:errors.length===0,errors});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'mobile-materials-report.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
