const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.goto('https://webdesign.kernjosh.com/',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(6000);
await page.screenshot({path:__dirname+'/01-closed.png'});
const initial=await page.locator('body').innerText();
fs.writeFileSync(__dirname+'/initial.txt',initial);
console.log(JSON.stringify({url:page.url(),title:await page.title(),text:initial.slice(0,22000),nav:await page.locator('a,button,[role="button"]').evaluateAll(els=>els.map(el=>({tag:el.tagName,text:el.innerText,href:el.getAttribute('href'),class:el.className})))},null,2));
await browser.close();
})();
