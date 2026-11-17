/* Read-only visual smoke against the published user-facing alias. */
const fs=require('node:fs'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'https://dumitru-spatial-portfolio.vercel.app/';
(async()=>{
 const results=[];
 for(const config of [{name:'desktop',engine:'chromium',width:1440,height:900},{name:'mobile-webkit',engine:'webkit',width:390,height:844,touch:true}]){
  const browser=await pw[config.engine].launch({headless:true,...(config.engine==='chromium'?{channel:'chrome'}:{})}),page=await browser.newPage({viewport:{width:config.width,height:config.height},hasTouch:!!config.touch,isMobile:!!config.touch,deviceScaleFactor:config.touch?3:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const click=selector=>config.touch?page.locator(selector).tap():page.locator(selector).click();
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:30000});
  await page.goto(origin);await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await settle('home');
  await page.screenshot({path:path.join(__dirname,config.name+'-home.png'),scale:'css'});
  await click('#about-control');await settle('about');await page.screenshot({path:path.join(__dirname,config.name+'-about.png'),scale:'css'});
  await click('#studio-back');await settle('home');await click('#work-toggle');await settle('work');await page.waitForTimeout(600);await page.screenshot({path:path.join(__dirname,config.name+'-work.png'),scale:'css'});
  await page.evaluate(()=>portfolioEntry.open('andra'));await settle('detail');await page.screenshot({path:path.join(__dirname,config.name+'-andra.png'),scale:'css'});
  results.push({config,origin,errors,state:await page.evaluate(()=>({entry:portfolioEntry.mode,resident:portfolioCompanion.getState(),title:document.title}))});await browser.close();
 }
 fs.writeFileSync(path.join(__dirname,'captures.json'),JSON.stringify({capturedAt:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results.map(r=>({name:r.config.name,errors:r.errors}))));
})().catch(e=>{console.error(e);process.exitCode=1});
