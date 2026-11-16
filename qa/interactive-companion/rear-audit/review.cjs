const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const results=[];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const [label,origin] of [['local','http://127.0.0.1:8943'],['public','https://dumitru-spatial-portfolio.vercel.app']]){
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await context.newPage(),entry={label,origin,errors:[],chunks:[],shots:[]},pending=[];
  page.on('pageerror',e=>entry.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)entry.errors.push(r.status()+' '+r.url());if(r.url().includes('/chunks/1l2px902fb04m.js'))pending.push(r.body().then(b=>entry.chunks.push({url:r.url(),sha256:crypto.createHash('sha256').update(b).digest('hex'),quietGated:b.includes(Buffer.from('portfolio-quiet-gated-paper-v1')),placeholder:b.includes(Buffer.from('staticField'))})).catch(e=>entry.errors.push(e.message)))});
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:30000});
  const shot=async name=>{await page.waitForTimeout(1200);const state=await page.evaluate(()=>({mode:portfolioEntry.mode,key:portfolioRuntime.focusedKey,index:portfolioRuntime.materialIndex,ready:portfolioRuntime.ready,camera:portfolioRuntime.camera,images:performance.getEntriesByType('resource').filter(e=>/assets\/projects\/(andra|fkd|bonanza)/.test(e.name)).map(e=>({name:e.name,duration:Math.round(e.duration),size:e.transferSize}))}));await page.screenshot({path:path.join(__dirname,label+'-'+name+'.png'),scale:'css'});entry.shots.push({name,state});};
  try{
   await page.goto(origin+'/?v=rear-audit',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:60000});
   await page.locator('#work-toggle').click();await settle('work');await shot('work-before');
   for(const key of ['bonanza','andra','fkd']){
    await page.locator('#work-toggle').click();await page.locator('#work-list [data-key='+key+']').click();await settle('detail');await shot(key+'-front');
    await page.locator('#material-dots [data-material="3"]').click();await page.waitForFunction(()=>portfolioRuntime.materialIndex===3);await shot(key+'-material3');
    await page.locator('#studio-back').click();await settle('work');await shot('work-after-'+key);
   }
  }catch(e){entry.errors.push(String(e));await page.screenshot({path:path.join(__dirname,label+'-error.png')}).catch(()=>{});}
  await Promise.allSettled(pending);results.push(entry);await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({label:r.label,errors:r.errors,chunks:r.chunks,shots:r.shots.map(s=>({name:s.name,key:s.state.key,index:s.state.index}))})),null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
