const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),out=path.join(__dirname,'final');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),report=[];
 const check=(ok,label,detail)=>{report.push({ok:!!ok,label,detail});if(!ok)console.log('FAIL',label,detail)};
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small',320,568],['landscape',844,390],['wide',2560,1440]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=paper-studio-final',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.portfolioEntry?.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done',{timeout:25000});
  await page.waitForTimeout(900);
  check(await page.locator('.desk-object').count()===9,name+' nine props');
  check(await page.locator('.desk-cable').count()===0,name+' cable removed');
  check(await page.locator('.desk-phone').evaluate(el=>el.tagName==='DIV'&&!el.hasAttribute('data-desk-open')),name+' phone nonclickable');
  await page.screenshot({path:path.join(out,name+'-home.png')});
  await page.mouse.move(width/2,height*.45);await page.mouse.wheel(0,1250);await page.waitForFunction(()=>!portfolioComposition.getState().active);
  check(await page.evaluate(()=>portfolioEntry.mode==='home'),name+' wheel stays Home');
  await page.screenshot({path:path.join(out,name+'-composition.png')});
  const home=await page.evaluate(()=>portfolioComposition.getState());
  await page.locator('#process-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='process'&&!portfolioEntry.pending);await page.waitForTimeout(350);
  await page.screenshot({path:path.join(out,name+'-process.png')});
  check(await page.locator('.process-step').count()===5,name+' Process five stages');
  await page.locator('[data-locale=ru]').click();await page.waitForTimeout(100);await page.screenshot({path:path.join(out,name+'-process-ru.png')});
  await page.locator('#studio-back').click();await page.waitForTimeout(850);
  check(await page.evaluate(p=>Math.abs(portfolioComposition.getState().progress-p)<.0001,home.progress),name+' Process restores composition');
  await page.locator('[data-locale=en]').click();
  await page.locator('#about-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);await page.waitForTimeout(500);
  const about=await page.evaluate(()=>({state:portfolioAbout.getState(),phone:document.querySelector('.desk-phone').getBoundingClientRect().toJSON(),native:portfolioRuntime.focusedKey,screen:document.querySelector('#studio-about').getBoundingClientRect().toJSON(),nav:document.querySelector('.portfolio-nav').getBoundingClientRect().toJSON()}));
  check(about.state.visible&&about.native!=='despre',name+' About in paper scene',about);
  check(about.phone.x>=0&&about.phone.y>=0&&about.phone.right<=width+1&&about.phone.bottom<=height+1,name+' phone fits',about.phone);
  await page.screenshot({path:path.join(out,name+'-about.png')});
  await page.locator('.about-photo-grid button').first().click();await page.waitForTimeout(150);
  check(await page.evaluate(()=>portfolioAbout.getState().photo===0),name+' photo opens');
  await page.keyboard.press('Escape');
  check(await page.evaluate(()=>portfolioEntry.mode==='about'&&portfolioAbout.getState().view==='profile'),name+' photo Escape returns profile');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);await page.waitForTimeout(100);
  check(await page.evaluate(p=>Math.abs(portfolioComposition.getState().progress-p)<.0001,home.progress),name+' About restores composition');
  await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);await page.waitForTimeout(450);
  await page.screenshot({path:path.join(out,name+'-work.png')});
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('#studio-home')).opacity==='1'),name+' Work keeps perimeter props');
  await page.locator('#about-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);await page.waitForTimeout(200);
  check(await page.evaluate(()=>portfolioAbout.getState().visible&&!portfolioRuntime.focusedKey),name+' Work to Home to About');
  await page.locator('#work-toggle').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);
  check(await page.evaluate(()=>!portfolioAbout.getState().visible&&portfolioComposition.getState().phase==='edge'),name+' About to Home to Work');
  if(name==='desktop'||name==='mobile'){
   for(const key of ['andra','btb','fkd','ora','bonanza']){
    await page.locator('#work-toggle').click();await page.locator('#work-list [data-key='+key+']').click();
    await page.waitForFunction(k=>portfolioEntry.mode==='detail'&&portfolioRuntime.focusedKey===k&&!portfolioEntry.pending,key);await page.waitForTimeout(300);
    check(await page.locator('#return-control').isVisible(),name+' '+key+' opens');
    await page.locator('#next-material').click();await page.waitForTimeout(250);
    await page.locator('#return-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.focusedKey&&!portfolioRuntime.moving);
    await page.waitForTimeout(300);check(await page.evaluate(()=>!portfolioRuntime.focusedKey),name+' '+key+' stays closed');
   }
  }
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' no horizontal overflow');
  check(errors.length===0,name+' no JS errors',errors);console.log(name+' checked');await context.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({passed:report.filter(r=>r.ok).length,failed:report.filter(r=>!r.ok).length}));
})().catch(e=>{console.error(e);process.exit(1)});
