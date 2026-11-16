const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const checks=[];
 for(const size of [{width:1440,height:900},{width:390,height:844},{width:320,height:568},{width:844,height:390}]){
  const p=await browser.newPage({viewport:size,hasTouch:size.width<1000,isMobile:size.width<1000});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('http://127.0.0.1:8943/__qa-process',route=>route.fulfill({contentType:'text/html',body:`<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/studio-fonts.css"><style>html,body{margin:0;background:#080808;overflow:hidden}#studio-home{position:fixed;inset:0}</style></head><body><section id="studio-home"></section></body></html>`}));
  await p.goto('http://127.0.0.1:8943/__qa-process');
  await p.addStyleTag({content:fs.readFileSync(path.join(root,'site/studio-process.css'),'utf8')});
  await p.evaluate(()=>{let locale='en',listeners=[];window.portfolioI18n={get locale(){return locale},subscribe:fn=>listeners.push(fn),setLocale:next=>{locale=next;listeners.forEach(fn=>fn())}}});
  await p.addScriptTag({content:fs.readFileSync(path.join(root,'site/studio-process.js'),'utf8')});
  await p.evaluate(()=>{portfolioProcess.mount(document.querySelector('#studio-home'));window.backCount=0;portfolioProcess.show({onBack:()=>backCount++})});
  await p.evaluate(async()=>{await document.fonts.load('500 28px StudioHand','Getting to know you Привет');await document.fonts.load('400 14px StudioSans','We start with your business');await document.fonts.ready});await p.waitForTimeout(450);
  checks.push({size,label:'studio fonts loaded',pass:await p.evaluate(()=>[...document.fonts].some(f=>f.family==='StudioHand'&&f.status==='loaded')&&[...document.fonts].some(f=>f.family==='StudioSans'&&f.status==='loaded')),fonts:await p.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status})))});
  checks.push({size,label:'focus enters Back',pass:await p.locator('.process-back').evaluate(e=>e===document.activeElement)});
  for(const lang of ['en','ro','ru']){
   await p.evaluate(lang=>portfolioI18n.setLocale(lang),lang);
   for(let index=0;index<5;index++){
    await p.locator('.process-step h3 button').nth(index).click();
    const s=await p.evaluate(()=>{const r=portfolioProcess.getState(),rows=[...document.querySelectorAll('.process-step')];return{state:r,visible:rows.filter(e=>!e.querySelector('.process-step-description').hidden).length,expanded:[...document.querySelectorAll('.process-step button[aria-expanded=true]')].length,bodyOverflow:document.documentElement.scrollWidth>innerWidth,panel:document.querySelector('#studio-process').getBoundingClientRect().toJSON(),title:document.querySelector('#studio-process-title').textContent}});
    checks.push({size,lang,index,label:'select step',pass:s.state.active===index&&!s.bodyOverflow&&s.panel.left>=0&&s.panel.right<=size.width+.5&&(size.width>680?s.visible===5:s.expanded<=1),state:s});
   }
   await p.evaluate(()=>{const p=document.querySelector('#studio-process');p.scrollTop=0;portfolioProcess.hide();portfolioProcess.show({onBack:()=>backCount++})});await p.waitForTimeout(400);
   await p.screenshot({path:path.join(__dirname,`${size.width}-${lang}.png`)});
  }
  await p.locator('.process-back').click();checks.push({size,label:'back callback once',pass:await p.evaluate(()=>backCount===1)});
  await p.evaluate(()=>portfolioProcess.hide());checks.push({size,label:'hidden and inert',pass:await p.locator('#studio-process').evaluate(e=>e.hidden&&e.inert)});
  checks.push({size,label:'no errors',pass:errors.length===0,errors});await p.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
