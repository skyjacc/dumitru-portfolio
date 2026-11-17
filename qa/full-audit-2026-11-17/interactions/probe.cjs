const fs=require('node:fs'),path=require('node:path');
const pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const base=process.env.ORIGIN||'http://127.0.0.1:8943'; const out=path.join(__dirname,base.startsWith('https')?'public-history':'local-history');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await pw.chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(10000);
let log=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
async function shot(label){const s=await page.evaluate(()=>({url:location.pathname,mode:window.portfolioEntry?.mode,pending:window.portfolioEntry?.pending,intent:document.body.dataset.entryTarget,key:window.portfolioRuntime?.focusedKey,index:window.portfolioRuntime?.materialIndex,moving:window.portfolioRuntime?.moving,phone:window.portfolioAbout?.getState(),processHidden:document.querySelector('#studio-process')?.hidden,history:history.length,active:document.activeElement?.id}));log.push({label,...s});console.log(JSON.stringify({label,...s}));await page.screenshot({path:path.join(out,label+'.png')});return s;}
async function boot(url='/'){await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});await page.waitForTimeout(1800);}
async function wait(mode){await page.waitForFunction(m=>portfolioEntry.mode===m&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:10000});}
async function click(s,mode){await page.locator(s).click();if(mode)await wait(mode);}
try{
await boot();await click('#work-toggle','work');await page.evaluate(()=>portfolioEntry.open('andra'));await wait('detail');await shot('01-andra');
await page.goBack();await page.waitForTimeout(2200);await shot('02-browser-back');
await page.goForward();await page.waitForTimeout(2200);await shot('03-browser-forward');
await click('#about-control','about');await shot('04-about-after-project');
await page.goBack();await page.waitForTimeout(2400);await shot('05-browser-back-from-about');
await page.goForward();await page.waitForTimeout(2400);await shot('06-browser-forward-about');
await boot('/work/andra');await shot('07-direct-andra');await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete',null,{timeout:45000});await page.waitForTimeout(2000);await shot('08-reloaded-andra');
await click('#process-control','process');await shot('09-process-from-detail');await click('#studio-back');await page.waitForTimeout(1800);await shot('10-back-from-process');
await boot('/work/despre');await shot('11-direct-about');await page.goBack();await page.waitForTimeout(2000);await shot('12-direct-about-browser-back');
await boot('/work/process');await shot('13-direct-process');await click('#studio-back');await page.waitForTimeout(1800);await shot('14-direct-process-back');
await boot('/work/no-such-project');await shot('15-invalid-project');
}catch(e){log.push({failure:e.stack});console.error(e.stack)}
fs.writeFileSync(path.join(out,'probe.json'),JSON.stringify({base,log,errors},null,2));await browser.close();
})();
