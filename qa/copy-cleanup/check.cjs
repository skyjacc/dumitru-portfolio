const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const base=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const forbidden=/(?:^|[^\p{L}])(?:AI|ИИ)(?:$|[^\p{L}])/u;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),checks=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<500,isMobile:viewport.width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending,mode);
  await page.goto(base+'/?v=copy-cleanup');
  await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
  await page.locator('#process-control').click();await settle('process');await page.waitForTimeout(1600);
  for(const lang of ['en','ro','ru']){
   await page.evaluate(lang=>portfolioI18n.setLocale(lang),lang);await page.waitForFunction(()=>!document.querySelector('.locale-rolling'));
   if(viewport.width<500)await page.locator('.process-step').nth(2).locator('h3 button').click();
   const text=await page.locator('#studio-process').textContent();
   checks.push({name:viewport.width+' Process '+lang,pass:!forbidden.test(text),text});
   if(lang==='en'){if(viewport.width>500)await page.locator('.process-step').nth(2).hover();await page.waitForTimeout(400);await page.screenshot({path:path.join(__dirname,(base.includes('127.0.0.1')?'local':'public')+'-'+viewport.width+'.png'),scale:'css'});}
  }
  await page.locator('#about-control').click();await settle('about');
  for(const lang of ['en','ro','ru']){
   await page.evaluate(lang=>portfolioI18n.setLocale(lang),lang);await page.waitForFunction(()=>!document.querySelector('.locale-rolling'));
   const text=await page.locator('#studio-about').textContent();
   const fallback=await page.evaluate(()=>['help.bio','help.band','about.lines','about.title','about.paragraphs'].map(key=>portfolioI18n.t(key)));
   checks.push({name:viewport.width+' About and fallback '+lang,pass:!forbidden.test(text+JSON.stringify(fallback)),text});
  }
  checks.push({name:viewport.width+' no errors',pass:!errors.length,errors});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,base.includes('127.0.0.1')?'local.json':'public.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(x=>!x.pass)}));if(checks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
