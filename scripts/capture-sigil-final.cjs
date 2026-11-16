const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),out=path.resolve(__dirname,'../qa/sigil-motion/final-site'),report={errors:[],views:[]};fs.mkdirSync(out,{recursive:true});
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===1440?900:844},hasTouch:width===390});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)});
  await page.addInitScript(()=>{window.__qaVideos=[];const create=document.createElement;document.createElement=function(...args){const el=create.apply(this,args);if(String(args[0]).toLowerCase()==='video')window.__qaVideos.push(el);return el;};});
  await page.goto('http://127.0.0.1:8943/');
  await page.waitForFunction(()=>window.__qaVideos?.some(v=>v.src.includes('sigil-loop')&&v.currentTime>2&&v.readyState>=2),{},{timeout:30000});
  await page.screenshot({path:path.join(out,`${width}-motion.png`)});
  report.views.push(await page.evaluate(width=>{const v=window.__qaVideos.find(v=>v.src.includes('sigil-loop'));return{width,video:{currentTime:v.currentTime,width:v.videoWidth,height:v.videoHeight,paused:v.paused,muted:v.muted,loop:v.loop},helpVisible:!!document.querySelector('[data-help-sticker]')?.getClientRects().length,contactVisible:!!document.querySelector('[data-sticker-link]')?.getClientRects().length,oldHintRemoved:!document.querySelector('#home-hint')};},width));
  await page.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
