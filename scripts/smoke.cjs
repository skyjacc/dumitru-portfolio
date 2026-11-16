const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.stack));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.goto('http://127.0.0.1:8943');await page.waitForTimeout(2500);
await page.screenshot({path:path.resolve(__dirname,'../qa/current-home.png')});
console.log(JSON.stringify({url:page.url(),errors,buttons:await page.locator('button').allTextContents(),text:(await page.locator('body').innerText()).slice(0,1800)},null,2));
await browser.close();
})();

