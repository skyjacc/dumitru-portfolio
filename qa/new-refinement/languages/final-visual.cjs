const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
 for(const [name,width,height,touch] of [['desktop',1440,900,false],['mobile',390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch});const page=await context.newPage(),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  const check=(label,ok,data)=>checks.push({label,ok:!!ok,data});
  await page.goto('http://127.0.0.1:8943/?v=refined-studio');
  await page.waitForFunction(()=>portfolioEntry.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done');await page.waitForTimeout(700);
  await page.evaluate(()=>{window.languageLongTasks=[];if(PerformanceObserver.supportedEntryTypes.includes('longtask'))new PerformanceObserver(l=>languageLongTasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask'});});
  await page.locator('[data-locale=ru]').click();await page.waitForFunction(()=>portfolioI18n.locale==='ru');await page.waitForTimeout(100);
  await page.screenshot({path:path.join(__dirname,name+'-final-home-flip.png')});
  await page.waitForTimeout(650);check('home text visible after flip',await page.evaluate(()=>!portfolioLanguageMotion.getState().active&&document.getElementById('studio-title').style.opacity!=='0'));
  await page.locator('#process-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='process'&&!portfolioEntry.pending);
  await page.locator('[data-locale=ro]').click();await page.waitForFunction(()=>portfolioI18n.locale==='ro');await page.waitForTimeout(100);
  await page.screenshot({path:path.join(__dirname,name+'-final-process-flip.png')});
  check('Process long descriptions remain readable during flip',await page.evaluate(()=>[...document.querySelectorAll('.process-step-description p')].every(e=>e.style.opacity!=='0')));
  await page.waitForTimeout(650);
  await page.locator('#about-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);
  await page.locator('[data-locale=en]').click();await page.waitForFunction(()=>portfolioI18n.locale==='en');await page.waitForTimeout(100);
  await page.screenshot({path:path.join(__dirname,name+'-final-about-flip.png')});await page.waitForTimeout(650);
  check('About text and profile survive locale change',await page.evaluate(()=>portfolioAbout.getState().visible&&portfolioAbout.getState().locale==='en'&&!portfolioLanguageMotion.getState().active));
  await page.locator('#studio-back').click();await page.waitForTimeout(200);
  check('Back clears About selected state during retreat',await page.evaluate(()=>document.body.dataset.entryTarget==='home'&&document.querySelector('#about-control').getAttribute('aria-current')!=='page'));
  await page.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);
  await page.locator('[data-locale=ru]').click();await page.waitForFunction(()=>portfolioI18n.locale==='ru');await page.locator('#about-control').click();
  await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);
  check('navigation during locale animation leaves no ghost text',await page.evaluate(()=>!document.querySelector('.locale-flaps')&&!portfolioLanguageMotion.getState().hidden));
  await page.locator('#studio-back').click();await page.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);await page.waitForTimeout(100);
  await page.locator('[data-locale=en]').click();await page.waitForTimeout(750);await page.screenshot({path:path.join(__dirname,name+'-final-home.png')});
  check('no page errors',errors.length===0,errors);report.push({name,checks,longTasks:await page.evaluate(()=>languageLongTasks)});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'final-visual-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.flatMap(r=>r.checks).filter(c=>c.ok).length,failed:report.flatMap(r=>r.checks).filter(c=>!c.ok),longTaskCount:report.map(r=>({name:r.name,count:r.longTasks.length,max:Math.max(0,...r.longTasks.map(t=>t.duration))}))}));
})().catch(e=>{console.error(e);process.exit(1)});
