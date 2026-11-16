const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const width=Number(process.argv[2]||1440),height=width<600?844:900,tag=width<600?'mobile':'desktop';
 const dir=path.resolve(__dirname,'../qa/ui-review');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600,deviceScaleFactor:1});
 const report={width,height,started:new Date().toISOString(),errors:[],checks:[]};
 page.on('pageerror',e=>report.errors.push(e.stack));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url())});
 const state=()=>page.evaluate(()=>window.portfolioRuntime);
 const settled=async()=>{await page.waitForTimeout(150);await page.waitForFunction(()=>window.portfolioRuntime?.ready&&!window.portfolioRuntime.moving,{},{timeout:15000});await page.waitForTimeout(250)};
 const same=(a,b)=>['x','y','zoom'].every(k=>Math.abs(a[k]-b[k])<.000001);
 const bounds=()=>page.evaluate(()=>Object.fromEntries(['.portfolio-nav','#project-controls','#return-control','.material-controls','#visit-control','#work-list'].map(s=>{let e=document.querySelector(s),r=e.getBoundingClientRect();return[s,{visible:!e.hidden&&r.width>0&&r.height>0,x:r.x,y:r.y,w:r.width,h:r.height}]})));
 const within=b=>!b.visible||b.x>=-1&&b.y>=-1&&b.x+b.w<=width+1&&b.y+b.h<=height+1;
 const screenshot=label=>page.screenshot({path:path.join(dir,`${tag}-${label}.png`)});
 await page.goto('http://127.0.0.1:8943/');await page.waitForSelector('#work-toggle');await settled();await page.waitForTimeout(1100);await screenshot('home');
 await page.locator('#work-toggle').click();let indexBounds=await bounds();await screenshot('index');
 report.checks.push({name:'Index menu visible and within viewport',passed:await page.locator('#work-list').isVisible()&&within(indexBounds['#work-list']),bounds:indexBounds['#work-list']});
 await page.keyboard.press('Escape');report.checks.push({name:'Escape closes Index without navigation',passed:!(await page.locator('#work-list').isVisible())});
 for(const key of ['andra','btb','fkd','ora','bonanza','despre']){
  const before=await state();
  if(key==='despre')await page.locator('#about-control').click();else{await page.locator('#work-toggle').click();await page.locator(`#work-list [data-key="${key}"]`).click()}
  await page.waitForFunction(k=>window.portfolioRuntime?.focusedKey===k,key);await settled();
  const initial=await state(),boxBefore=await bounds();await screenshot(`${key}-open`);
  await page.locator('#material-dots [data-material="1"]').click();await page.waitForTimeout(850);
  const selected=await state(),boxAfter=await bounds();await screenshot(`${key}-material`);
  report.checks.push({name:`${key}: actual material click and stable controls`,passed:selected.materialIndex===1&&same(initial.camera,selected.camera)&&JSON.stringify(boxBefore)===JSON.stringify(boxAfter),initial,selected,bounds:boxAfter});
  report.checks.push({name:`${key}: controls within viewport`,passed:Object.values(boxAfter).every(within)});
  await page.locator('#previous-material').click();await page.waitForTimeout(700);
  report.checks.push({name:`${key}: previous material button`,passed:(await state()).materialIndex===0});
  await page.locator('#return-control').click();await settled();const returned=await state();
  report.checks.push({name:`${key}: actual return preserves field camera`,passed:returned.focusedKey===null&&same(before.camera,returned.camera),before:before.camera,after:returned.camera});
 }
 const beforeBack=await state();await page.locator('#about-control').click();await settled();await page.goBack();await settled();
 const afterBack=await state();report.checks.push({name:'Browser Back closes About and restores prior place',passed:afterBack.focusedKey===null&&same(beforeBack.camera,afterBack.camera),before:beforeBack.camera,after:afterBack.camera,url:page.url()});
 report.finished=new Date().toISOString();
 fs.writeFileSync(path.join(dir,`${tag}-report.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify({width,errors:report.errors,checks:report.checks.map(({name,passed})=>({name,passed}))},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
