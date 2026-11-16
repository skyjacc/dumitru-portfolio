const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');
const out=__dirname;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const reports=[];
 for(const size of [{width:320,height:568},{width:390,height:844},{width:480,height:800},{width:844,height:390}]){
  const page=await browser.newPage({viewport:size,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8943/?audit=mobile-baseline');
  await page.waitForFunction(()=>window.portfolioEntry?.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done');
  const record=async(name)=>{await page.waitForTimeout(500);const data=await page.evaluate(()=>{
   const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom}};
   const visible=e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&b.width>0&&b.height>0&&!e.closest('[hidden],[inert]')};
   const controls=[...document.querySelectorAll('#portfolio-ui button,#portfolio-ui a,#studio-home button')].filter(visible).map(e=>({id:e.id||e.dataset.material||e.dataset.key||e.dataset.locale,text:e.textContent.trim(),r:r(e),label:e.getAttribute('aria-label')}));
   return {mode:portfolioEntry.mode,focused:portfolioRuntime.focusedKey,viewport:{width:innerWidth,height:innerHeight},scroll:{w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight},controls,tooSmall:controls.filter(c=>c.r.w<43.9||c.r.h<43.9),outside:controls.filter(c=>c.r.x<0||c.r.right>innerWidth+1||c.r.y<0||c.r.bottom>innerHeight+1),overlaps:controls.flatMap((a,i)=>controls.slice(i+1).filter(b=>a.r.x<b.r.right&&a.r.right>b.r.x&&a.r.y<b.r.bottom&&a.r.bottom>b.r.y).map(b=>[a.id,b.id]))};
  });await page.screenshot({path:`${out}/before-${size.width}-${name}.png`});reports.push({size,name,...data,errors});};
  await record('home');
  await page.locator('#process-control').tap();await page.waitForFunction(()=>portfolioRuntime.focusedKey==='process'&&!portfolioRuntime.moving);await record('process');
  await page.locator('#about-control').tap();await page.waitForFunction(()=>portfolioRuntime.focusedKey==='despre'&&!portfolioRuntime.moving);await record('about');
  await page.locator('#work-toggle').tap();await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioRuntime.moving);await page.locator('#work-toggle').tap();await record('index');
  await page.locator('#work-list [data-key="andra"]').tap();await page.waitForFunction(()=>portfolioRuntime.focusedKey==='andra'&&!portfolioRuntime.moving);await record('andra');
  await page.locator('[data-locale="ru"]').tap();await record('andra-ru');
  await page.close();
 }
 fs.writeFileSync(`${out}/baseline.json`,JSON.stringify(reports,null,2));
 console.log(JSON.stringify(reports.map(r=>({size:r.size,name:r.name,tooSmall:r.tooSmall.map(c=>[c.id,c.r.w,c.r.h]),outside:r.outside.map(c=>c.id),overlaps:r.overlaps,errors:r.errors})),null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
