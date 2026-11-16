const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),checks=[],errors=[];
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:width===1440?900:844},hasTouch:width<500});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/');await page.waitForFunction(()=>window.portfolioRuntime?.ready);await page.waitForTimeout(700);
  const identity=await page.evaluate(()=>({title:document.title,fullName:document.body.innerText.includes('Dumitru Andrusciac'),email:document.querySelector('#contact-control').getAttribute('href')}));
  await page.locator('#help-control').click();await page.waitForFunction(()=>window.portfolioRuntime.helpOpen);await page.waitForTimeout(500);
  const hintHidden=await page.locator('#home-hint').isHidden();
  await page.screenshot({path:path.resolve(__dirname,`../qa/personal-final/${width}-help.png`)});
  await page.locator('#home-control').click();await page.waitForFunction(()=>!window.portfolioRuntime.helpOpen);await page.waitForTimeout(150);
  const hintReturned=await page.locator('#home-hint').isVisible();
  checks.push({width,identity,hintHidden,hintReturned,passed:identity.title.startsWith('Dumitru —')&&!identity.fullName&&identity.email==='mailto:andrusciac.dumitru@gmail.com'&&hintHidden&&hintReturned});
  await page.close();
 }
 const report={checks,errors};fs.writeFileSync(path.resolve(__dirname,'../qa/personal-final/chrome-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
 if(errors.length||checks.some(c=>!c.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
