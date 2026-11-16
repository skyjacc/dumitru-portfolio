const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../qa/personal-final');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});const errors=[],states=[];
for(const [width,height] of [[1440,900],[390,844],[320,740]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<500});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:8943/');await page.waitForFunction(()=>window.portfolioRuntime?.ready);await page.waitForTimeout(2800);
 await page.screenshot({path:path.join(out,`${width}-home.png`)});const home=await page.evaluate(()=>window.portfolioRuntime.camera);
 if(width===320){await page.close();continue;}
 await page.locator('#about-control').click();await page.waitForFunction(()=>window.portfolioRuntime?.focusedKey==='despre'&&!window.portfolioRuntime?.moving);await page.waitForTimeout(600);const saved=await page.evaluate(()=>window.portfolioRuntime.returnCamera);
 for(let i=0;i<3;i++){await page.locator(`[data-material="${i}"]`).click();await page.waitForTimeout(750);await page.screenshot({path:path.join(out,`${width}-about-${i}.png`)})}
 await page.locator('#return-control').click();await page.waitForFunction(()=>!window.portfolioRuntime?.focusedKey&&!window.portfolioRuntime?.moving);const returned=await page.evaluate(()=>window.portfolioRuntime.camera);
 states.push({width,home,saved,returned,exactReturn:['x','y','zoom'].every(k=>Math.abs(saved[k]-returned[k])<1e-9)});
 await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=andra]').click();await page.waitForFunction(()=>window.portfolioRuntime.focusedKey==='andra'&&!window.portfolioRuntime.moving);await page.locator('[data-material="2"]').click();await page.waitForTimeout(800);await page.screenshot({path:path.join(out,`${width}-andra.png`)});await page.close();
}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({errors,states},null,2));console.log(JSON.stringify({errors,states},null,2));await browser.close()})();
