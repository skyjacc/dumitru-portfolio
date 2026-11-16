const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');
const path=require('path');
const {settle,equalCamera}=require('../open-close-review/helpers.cjs');
const origin=process.argv[2];
if(!origin) throw new Error('Pass the deployed URL');
const report={origin,checkedAt:new Date().toISOString(),http:[],screens:[],errors:[]};
const save=()=>fs.writeFileSync(path.join(__dirname,'public-check.json'),JSON.stringify(report,null,2));
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  for(const route of ['/','/work/andra','/work/btb','/work/fkd','/work/ora','/work/bonanza','/work/despre','/portfolio-i18n.js','/assets/manrope-cyrillic.woff2']){
    const response=await context.request.get(origin+route);
    report.http.push({route,status:response.status(),contentType:response.headers()['content-type']});
    if(response.status()!==200)throw new Error(`Public request failed ${route}: ${response.status()}`);
  }
  const video=await context.request.get(origin+'/assets/hero-bouquet-hd.mp4',{headers:{Range:'bytes=0-1023'}});
  report.http.push({route:'/assets/hero-bouquet-hd.mp4',status:video.status(),contentType:video.headers()['content-type'],contentRange:video.headers()['content-range']});
  if(![200,206].includes(video.status())) throw new Error('Video unavailable');
  for(const width of [1440,390]){
    const ctx=width===1440?context:await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true});
    const page=await ctx.newPage();
    const errors=[],badResponses=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()})});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.portfolioRuntime?.ready&&document.querySelector('[data-locale="en"]'));
    await page.waitForTimeout(2400); // Allow the native intro to finish before visual capture.
    await settle(page);
    const initial=await page.evaluate(()=>({locale:portfolioI18n.locale,title:document.title,lang:document.documentElement.lang}));
    if(initial.locale!=='en')throw new Error('Default is not English');
    await page.screenshot({path:path.join(__dirname,`public-${width}-home-en.png`)});
    await page.locator('[data-locale="ru"]').click();
    await page.waitForFunction(()=>portfolioI18n.locale==='ru');
    await page.locator('#about-control').click();
    await settle(page,'despre');
    const before=await page.evaluate(()=>portfolioRuntime);
    await page.locator('[data-locale="ro"]').click();
    await page.waitForFunction(()=>portfolioI18n.locale==='ro');
    const after=await page.evaluate(()=>portfolioRuntime);
    if(!equalCamera(before.camera,after.camera)||after.focusedKey!=='despre')throw new Error('Language switch changed the scene');
    await page.screenshot({path:path.join(__dirname,`public-${width}-about-ro.png`)});
    await page.locator('#return-control').click();
    await settle(page,null);
    if(!equalCamera(before.returnCamera,(await page.evaluate(()=>portfolioRuntime)).camera))throw new Error('Return camera mismatch');
    await page.goto(origin+'/work/andra');
    await page.waitForFunction(()=>window.portfolioRuntime?.ready);
    await settle(page,'andra');
    await page.locator('#material-dots [data-material="1"]').click();
    await page.waitForTimeout(1100);
    await page.screenshot({path:path.join(__dirname,`public-${width}-andra.png`)});
    report.screens.push({width,initial,directProject:(await page.evaluate(()=>portfolioRuntime)).focusedKey,localePersisted:await page.evaluate(()=>portfolioI18n.locale),errors,badResponses});
    if(errors.length||badResponses.length)throw new Error('Browser errors or missing assets');
    save();
    if(width!==1440)await ctx.close();
  }
  await browser.close();report.passed=true;save();console.log(JSON.stringify(report,null,2));
})().catch(e=>{report.errors.push(e.stack);report.passed=false;save();console.error(e);process.exitCode=1});
