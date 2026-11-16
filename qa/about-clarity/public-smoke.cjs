const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const base='https://dumitru-spatial-portfolio.vercel.app',results=[];
(async()=>{
 for(const test of [{name:'chromium-desktop',engine:chromium,launch:{channel:'chrome'},viewport:{width:1440,height:900}},{name:'webkit-phone',engine:webkit,launch:{},viewport:{width:393,height:620},isMobile:true,hasTouch:true,deviceScaleFactor:3}]){
  const browser=await test.engine.launch({headless:true,...test.launch});
  const page=await browser.newPage({viewport:test.viewport,isMobile:!!test.isMobile,hasTouch:!!test.hasTouch,deviceScaleFactor:test.deviceScaleFactor||1});
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioComposition.getState().active,mode,{timeout:20000});
  try{
   await page.goto(base+'/?v=about-clear-text',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&window.portfolioEntry?.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
   await page.locator('#about-control').click();await settle('about');
   for(const locale of ['en','ro','ru']){
    await page.evaluate(locale=>portfolioI18n.setLocale(locale),locale);await page.waitForFunction(()=>!document.querySelector('.locale-rolling'));
    const measured=await page.evaluate(()=>{
     const s=document.querySelector('.about-phone-screen'),p=document.querySelector('.about-phone-profile'),r=s.getBoundingClientRect();
     return{lang:s.lang,text:p.innerText,bio:parseFloat(getComputedStyle(document.querySelector('.about-profile-bio')).fontSize),tag:parseFloat(getComputedStyle(document.querySelector('.about-profile-heading p')).fontSize),scale:r.width/parseFloat(getComputedStyle(s).width),overflow:p.scrollWidth-p.clientWidth};
    });
    checks.push({name:locale+' rendered profile',data:measured,pass:measured.lang===locale&&measured.bio>=13.9&&measured.tag>=10.9&&Math.abs(measured.scale-1)<.01&&measured.overflow<=1&&!/(?:^|[^\p{L}])(?:AI|ИИ)(?:$|[^\p{L}])/iu.test(measured.text)});
   }
   await page.evaluate(()=>portfolioI18n.setLocale('en'));
   await page.waitForFunction(()=>!document.querySelector('.locale-rolling'));
   await page.waitForFunction(()=>[...document.querySelectorAll('.about-phone-profile img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:20000});
   await page.locator('.about-phone-profile').evaluate(n=>n.scrollTop=0);
   await page.screenshot({path:path.join(__dirname,'public-'+test.name+'.png'),scale:'css'});
   await page.locator('.about-photo-grid button').first().click();await page.waitForFunction(()=>portfolioAbout.getState().view==='photo');
   await page.locator('.about-photo-next').click();checks.push({name:'photo next',pass:await page.evaluate(()=>portfolioAbout.getState().photo===1)});
   await page.locator('.about-photo-back').click();checks.push({name:'photo back retains About',pass:await page.evaluate(()=>portfolioAbout.getState().view==='profile'&&portfolioEntry.mode==='about')});
   await page.locator('.about-phone-profile').evaluate(n=>n.scrollTop=n.scrollHeight);
   await page.locator('#studio-back').click();await settle('home');await page.locator('#about-control').click();await settle('about');
   checks.push({name:'reopen starts at profile top',pass:await page.locator('.about-phone-profile').evaluate(n=>n.scrollTop===0)});
   await page.locator('#work-toggle').click();await settle('work');checks.push({name:'About to Work',pass:await page.evaluate(()=>!portfolioAbout.getState().visible)});
   await page.locator('#about-control').click();await settle('about');await page.locator('#studio-back').click();await settle('home');
   checks.push({name:'Work to About to Home',pass:await page.evaluate(()=>!portfolioAbout.getState().visible)});
  }catch(e){errors.push(String(e))}
  checks.push({name:'no JavaScript or HTTP failures',pass:errors.length===0,errors});results.push({name:test.name,checks});await browser.close();
 }
 fs.writeFileSync(path.join(__dirname,'public-smoke.json'),JSON.stringify(results,null,2));
 const failures=results.flatMap(r=>r.checks.filter(c=>!c.pass).map(c=>({browser:r.name,...c})));
 console.log(JSON.stringify({checks:results.reduce((n,r)=>n+r.checks.length,0),failures}));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
