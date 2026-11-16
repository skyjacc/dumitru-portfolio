const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const {settle,clickUI,equalCamera}=require('../../open-close-review/helpers.cjs');
const out=__dirname,results=[],errors=[];
const record=(name,pass,detail)=>{results.push({name,pass,detail});if(!pass)console.log('FAIL',name,JSON.stringify(detail));};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},hasTouch:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8943/');
 await page.waitForFunction(()=>window.portfolioEntry?.ready&&portfolioEntry.mode==='home',{},{timeout:25000});
 const expected=await page.evaluate(async()=>{const d=await(await fetch('/portfolio-data.json')).json();return d.projects.filter(p=>p.portfolioCase).map(p=>p.key)});
 for(const width of [1440,1024,901,900,854,680,390,320]){
  await page.setViewportSize({width,height:width<500?844:900});
  for(const locale of ['en','ro','ru']){
   await clickUI(page,`[data-locale="${locale}"]`,width);
   await page.waitForTimeout(160);
   const metrics=await page.evaluate(()=>{
    const selectors=['#home-control','#work-toggle','#process-control','#about-control','#nav-contact','#language-control'];
    const boxes=selectors.map(selector=>{const n=document.querySelector(selector),r=n.getBoundingClientRect(),s=getComputedStyle(n);return{selector,text:n.textContent.trim(),x:r.x,y:r.y,w:r.width,h:r.height,visible:r.width>0&&r.height>0&&s.visibility==='visible',overflow:n.scrollWidth>n.clientWidth+1}});
    const overlaps=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h)overlaps.push([a.selector,b.selector])}
    const hidden=[...document.querySelectorAll('[data-help-sticker],[data-sticker-link],[data-sticker=work]')].map(n=>({display:getComputedStyle(n).display,inert:n.inert,tabIndex:n.tabIndex,aria:n.getAttribute('aria-hidden')}));
    return{boxes,overlaps,hidden,sup:document.querySelectorAll('.portfolio-nav sup').length,locale:portfolioI18n.locale,viewport:innerWidth};
   });
   const pass=metrics.boxes.every(b=>b.visible&&!b.overflow&&b.x>=0&&b.x+b.w<=width+.1&&b.y>=0)&&!metrics.overlaps.length&&metrics.hidden.every(n=>n.display==='none'&&n.inert&&n.tabIndex===-1&&n.aria==='true')&&metrics.sup===0&&metrics.locale===locale;
   record(`header-${width}-${locale}`,pass,metrics);
   if([1440,854,390,320].includes(width)&&locale==='ru')await page.screenshot({path:path.join(out,`header-${width}-ru.png`),clip:{x:0,y:0,width,height:160}});
  }
 }
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width<500?844:900});
  await page.goto('http://127.0.0.1:8943/');
  await page.waitForFunction(()=>window.portfolioEntry?.ready&&portfolioEntry.mode==='home',{},{timeout:25000});
  await clickUI(page,'[data-locale="en"]',width);
  await clickUI(page,'#work-toggle',width);
  await page.waitForFunction(()=>portfolioEntry.mode==='work');
  await settle(page,null);
  await clickUI(page,'#work-toggle',width);
  const keys=await page.locator('#work-list [data-key]').evaluateAll(nodes=>nodes.map(n=>n.dataset.key));
  record(`data-driven-list-${width}`,JSON.stringify(keys)===JSON.stringify(expected),keys);
  await page.screenshot({path:path.join(out,`work-list-${width}.png`)});
  const camera=await page.evaluate(()=>portfolioRuntime.camera);
  await clickUI(page,'#work-list [data-key="andra"]',width);
  await settle(page,'andra');
  record(`detail-header-${width}`,await page.locator('#home-control').isVisible()&&await page.locator('.portfolio-nav').isVisible());
  await page.keyboard.press('?');await page.waitForTimeout(150);
  record(`question-mark-disabled-${width}`,!(await page.evaluate(()=>portfolioRuntime.helpOpen)));
  const before=await page.locator('#process-control svg').evaluate(n=>({transform:getComputedStyle(n).transform,box:n.getBoundingClientRect().toJSON()}));
  await page.locator('#process-control').hover();await page.waitForTimeout(300);
  const after=await page.locator('#process-control svg').evaluate(n=>({transform:getComputedStyle(n).transform,box:n.getBoundingClientRect().toJSON()}));
  record(`no-hover-motion-${width}`,JSON.stringify(before)===JSON.stringify(after),{before,after});
  await clickUI(page,'#return-control',width);await settle(page,null);
  record(`back-guard-smoke-${width}`,equalCamera(camera,await page.evaluate(()=>portfolioRuntime.camera)));
  await clickUI(page,'#home-control',width);
  await page.waitForFunction(()=>portfolioEntry.mode==='home');
  await page.locator('#studio-home').waitFor({state:'visible'});
  record(`header-home-${width}`,await page.locator('#studio-home').isVisible());
 }
 record('page-errors',errors.length===0,errors);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({date:new Date().toISOString(),passed:results.filter(r=>r.pass).length,total:results.length,results},null,2));
 await browser.close();console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass).map(r=>r.name)},null,2));
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),e.stack);console.error(e);process.exit(1)});
