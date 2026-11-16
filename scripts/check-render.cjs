const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const label=process.argv[2]||'after';
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:8943/');
 await page.waitForFunction(()=>window.portfolioRuntime?.ready);
 await page.waitForTimeout(1400);
 await page.screenshot({path:path.resolve(__dirname,`../qa/render-${label}-home.png`)});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key:'btb'}})));
 await page.waitForFunction(()=>window.portfolioRuntime?.focusedKey==='btb'&&!window.portfolioRuntime?.moving);
 await page.waitForTimeout(700);
 await page.screenshot({path:path.resolve(__dirname,`../qa/render-${label}-btb.png`)});
 console.log(JSON.stringify({label,errors,state:await page.evaluate(()=>window.portfolioRuntime)},null,2));
 await browser.close();
})();
