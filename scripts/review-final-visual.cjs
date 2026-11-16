const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
const dir=path.resolve(__dirname,'../qa/ui-review'),report={errors:[],checks:[]};
const browser=await chromium.launch({headless:true,channel:'chrome'});
const selectedKeys=process.argv[2]?.split(','),widths=process.argv[3]?process.argv[3].split(',').map(Number):[390,1440];
for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.stack));
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:8943/');await page.waitForSelector('#work-toggle');await page.waitForFunction(()=>window.portfolioRuntime?.ready);await page.waitForTimeout(1000);
 const settle=async()=>{await page.waitForTimeout(100);await page.waitForFunction(()=>!window.portfolioRuntime.moving);await page.waitForTimeout(500)};
 const rects=()=>page.evaluate(()=>Object.fromEntries(['.portfolio-nav','#return-control','.material-controls','#visit-control'].map(s=>{let r=document.querySelector(s).getBoundingClientRect();return[s,[r.x,r.y,r.width,r.height]]})));
 const snap=n=>page.screenshot({path:path.join(dir,`final-${width}-${n}.png`)});
 if(width===390){await snap('home');await page.locator('#work-toggle').click();await snap('index');await page.locator('#work-toggle').click()}
 for(const key of selectedKeys||(width===390?['andra','btb','fkd','ora','bonanza','despre']:['despre'])){
  if(key==='despre')await page.locator('#about-control').click();else{await page.locator('#work-toggle').click();await page.locator(`#work-list [data-key="${key}"]`).click()}
  await page.waitForFunction(k=>window.portfolioRuntime.focusedKey===k,key);await settle();await snap(`${key}-open`);
  const before=await rects();await page.locator('#material-dots [data-material="1"]').click();await page.waitForTimeout(800);await snap(`${key}-selected`);
  const after=await rects(),state=await page.evaluate(()=>window.portfolioRuntime);
  report.checks.push({width,key,material:state.materialIndex,stable:JSON.stringify(before)===JSON.stringify(after),within:Object.values(after).every(([x,y,w,h])=>x>=-1&&y>=-1&&x+w<=width+1&&y+h<=(width===390?844:900)+1),controls:after});
  if(key==='despre'){await page.locator('#material-dots [data-material="2"]').click();await page.waitForTimeout(800);await snap(`${key}-contact`)}
  await page.locator('#return-control').click();await settle();
 }
 await page.close();
}
fs.writeFileSync(path.join(dir,'final-visual-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
