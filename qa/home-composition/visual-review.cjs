const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.join(__dirname,'integrated-visual');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small',320,568],['wide',2560,1440],['landscape',844,390]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=composition-review',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>portfolioEntry?.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done',{timeout:25000});await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(out,name+'-home.png')});
  const states=[];
  for(let i=0;i<3;i++){
   if(i){await page.mouse.move(width/2,height/2);await page.mouse.wheel(0,1250);await page.waitForTimeout(1300);await page.screenshot({path:path.join(out,name+'-layout-'+i+'.png')})}
   states.push(await page.evaluate(()=>({mode:portfolioEntry.mode,composition:portfolioComposition.getState(),assets:[...document.querySelectorAll('.desk-cutout>img')].map(i=>({url:i.currentSrc,width:i.naturalWidth,complete:i.complete})),overflow:document.documentElement.scrollWidth>innerWidth})));
  }
  await page.locator('#process-control').click();await page.waitForFunction(()=>portfolioProcess.getState().visible);await page.waitForTimeout(600);await page.screenshot({path:path.join(out,name+'-process.png')});
  const process=await page.evaluate(()=>({state:portfolioProcess.getState(),overflow:document.documentElement.scrollWidth>innerWidth,rect:document.querySelector('#studio-process').getBoundingClientRect().toJSON(),nav:document.querySelector('.portfolio-nav').getBoundingClientRect().toJSON(),title:document.title}));
  await page.locator('[data-locale=ru]').click();await page.waitForTimeout(250);await page.screenshot({path:path.join(out,name+'-process-ru.png')});
  await page.locator('.process-back').click();await page.waitForTimeout(850);
  report.push({name,width,height,errors,states,process,back:await page.evaluate(()=>({mode:portfolioEntry.mode,comp:portfolioComposition.getState()}))});console.log(name+' captured');await context.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
