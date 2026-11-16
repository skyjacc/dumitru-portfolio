const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  window.frameFallbackQA={blockedWebGL:0,canvas2D:0};
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   if(String(type).includes('webgl')){frameFallbackQA.blockedWebGL++;return null}
   const context=original.call(this,type,...args);if(type==='2d'&&context)frameFallbackQA.canvas2D++;return context;
  };
 });
 await page.goto('http://127.0.0.1:8943/?frame-review=2d');
 await page.waitForFunction(()=>window.portfolioEntry?.ready&&!document.querySelector('#studio-loader')&&document.querySelector('#studio-home').dataset.paperReveal==='done');
 await page.waitForTimeout(600);await page.locator('#work-toggle').click();
 await page.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
 await page.waitForTimeout(300);await page.screenshot({path:path.join(__dirname,'after-mobile-fallback-2d.png')});
 const state=await page.evaluate(()=>({mode:portfolioEntry.mode,focused:portfolioRuntime.focusedKey,...frameFallbackQA}));
 await page.locator('#work-toggle').click();await page.locator('#work-list [data-key=andra]').click();
 await page.waitForFunction(()=>portfolioEntry.mode==='detail'&&portfolioRuntime.focusedKey==='andra'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
 await page.screenshot({path:path.join(__dirname,'after-mobile-fallback-project.png')});
 const project=await page.locator('#return-control').isVisible();
 const result={pass:state.mode==='work'&&!state.focused&&state.blockedWebGL>0&&state.canvas2D>0&&project&&!errors.length,state,project,errors};
 fs.writeFileSync(path.join(__dirname,'fallback-report.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
