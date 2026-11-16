const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),report=[];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [name,width,height,touch,reduced] of [['desktop',1440,900,false,false],['tablet',900,900,false,false],['mobile',390,844,true,false],['small',320,568,true,false],['reduced',1440,900,false,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[],checks=[];
  const check=(label,ok,data)=>{checks.push({label,ok:!!ok,data});if(!ok)console.log('FAIL',name,label,data)};page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?v=refined-studio');await page.waitForFunction(()=>window.portfolioEntry?.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done');await page.waitForTimeout(800);
  for(const lang of ['ro','ru','en']){
   const before=await page.evaluate(()=>portfolioComposition.getState().poses);
   await page.locator('[data-locale='+lang+']').click();await page.waitForFunction(l=>portfolioI18n.locale===l,lang);
   if(lang==='ru')await page.screenshot({path:path.join(__dirname,name+'-flip.png')});
   const active=await page.evaluate(()=>portfolioLanguageMotion.getState());check(lang+' motion follows preference',reduced?!active.active:active.active,active);
   await page.waitForTimeout(680);
   check(lang+' clean final text',await page.evaluate(l=>document.documentElement.lang===l&&!portfolioLanguageMotion.getState().active&&!document.querySelector('.locale-flaps')&&[...document.querySelectorAll('[data-copy]')].every(el=>el.style.opacity!=='0'),lang));
   check(lang+' camera/scene unchanged',await page.evaluate(poses=>portfolioComposition.getState().poses.every((p,i)=>['x','y','angle','scale'].every(k=>Math.abs(p[k]-poses[i][k])<.02)),before));
   const boxes=await page.evaluate(()=>[...document.querySelectorAll('.portfolio-nav>.nav-pill,.index-wrap,#language-control,#home-control')].filter(e=>!e.hidden).map(e=>({id:e.id,r:e.getBoundingClientRect().toJSON()})));
   check(lang+' header stays inside',boxes.every(b=>b.r.x>=0&&b.r.right<=width),boxes);
  }
  await page.screenshot({path:path.join(__dirname,name+'-home.png')});
  await page.locator('#process-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='process'&&!portfolioEntry.pending);
  await page.locator('[data-locale=ru]').click();await page.waitForFunction(()=>portfolioI18n.locale==='ru');await page.waitForTimeout(140);await page.screenshot({path:path.join(__dirname,name+'-process-flip.png')});await page.waitForTimeout(600);
  check('Process retains mode and steps',await page.evaluate(()=>portfolioEntry.mode==='process'&&document.querySelectorAll('.process-step').length===5&&!portfolioLanguageMotion.getState().active));
  await page.locator('#about-control').click();await page.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending);
  await page.locator('[data-locale=ro]').click();await page.waitForFunction(()=>portfolioI18n.locale==='ro');await page.waitForTimeout(680);
  check('About screen changes locale in place',await page.evaluate(()=>portfolioAbout.getState().visible&&portfolioAbout.getState().locale==='ro'&&portfolioComposition.getState().phase==='phone'));
  await page.locator('#studio-back').click();await page.waitForFunction(()=>portfolioEntry.mode==='home'&&!portfolioEntry.pending);await page.waitForTimeout(750);
  await page.evaluate(()=>{portfolioI18n.setLocale('ru');setTimeout(()=>portfolioI18n.setLocale('en'),35);setTimeout(()=>portfolioI18n.setLocale('ro'),70)});await page.waitForTimeout(900);
  check('rapid switches settle on last locale',await page.evaluate(()=>portfolioI18n.locale==='ro'&&!portfolioLanguageMotion.getState().active&&!document.querySelector('.locale-flaps')));
  await page.locator('[data-locale=en]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(900);check('keyboard switch works',await page.evaluate(()=>portfolioI18n.locale==='en'));
  check('no JS errors',errors.length===0,errors);report.push({name,checks,errors});console.log(name+' done');await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.flatMap(r=>r.checks).filter(c=>c.ok).length,failed:report.flatMap(r=>r.checks).filter(c=>!c.ok).length}));
})().catch(e=>{console.error(e);process.exit(1)});
