const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
 for(const [name,width,height] of [['small',320,568],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=paper-studio-final');await page.waitForFunction(()=>portfolioEntry.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done'&&!portfolioComposition.getState().active);
  await page.screenshot({path:path.join(__dirname,'final',name+'-home.png')});
  await page.locator('#about-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);await page.waitForTimeout(500);
  await page.screenshot({path:path.join(__dirname,'final',name+'-about.png')});
  results.push(await page.evaluate(({name,errors})=>({name,errors,about:portfolioAbout.getState(),phone:document.querySelector('.desk-phone').getBoundingClientRect().toJSON(),safe:portfolioSafeArea,source:document.querySelector('.desk-phone .desk-cutout>img').currentSrc,overflow:document.documentElement.scrollWidth>innerWidth}),{name,errors}));await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'final','polish-report.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
