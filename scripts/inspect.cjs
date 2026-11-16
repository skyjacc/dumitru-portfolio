const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('path');
(async()=>{const b=await chromium.launch({headless:true,channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>console.log('ERROR',e.message));await p.goto('http://127.0.0.1:8943');await p.waitForFunction(()=>window.portfolioRuntime?.ready);
for(const key of ['andra','btb','despre']){await p.evaluate(key=>window.dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{key}})),key);await p.waitForTimeout(1500);await p.screenshot({path:path.resolve(__dirname,`../qa/current-${key}.png`)});console.log(key,await p.evaluate(()=>window.portfolioRuntime));}
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(900);await p.screenshot({path:path.resolve(__dirname,'../qa/current-mobile.png')});await b.close()})();
