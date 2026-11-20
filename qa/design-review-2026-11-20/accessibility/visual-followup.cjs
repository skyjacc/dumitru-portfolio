const fs=require('node:fs'),path=require('node:path');
const pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{
 const b=await pw.chromium.launch({headless:true}),p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),r={};
 const settled=m=>p.waitForFunction(m=>portfolioEntry.mode===m&&!portfolioEntry.pending,m);
 await p.goto('https://dumitru-spatial-portfolio.vercel.app/');await p.waitForFunction(()=>portfolioLoader.getState().phase==='complete');
 await p.locator('#process-control').click();await settled('process');await p.mouse.move(20,500);await p.waitForTimeout(800);
 r.process=await p.evaluate(()=>[...document.querySelectorAll('.process-step h3 button,.process-step-description p')].map(e=>{let a=e,o=1,chain=[];while(a){const s=getComputedStyle(a);o*=Number(s.opacity);chain.push({tag:a.tagName,id:a.id,cls:a.className,bg:s.backgroundColor,opacity:s.opacity});a=a.parentElement}const s=getComputedStyle(e);return{text:e.textContent.trim(),color:s.color,fontSize:s.fontSize,fontWeight:s.fontWeight,opacity:o,chain}}));
 await p.locator('#work-toggle').click();await settled('work');await p.locator('#work-toggle').click();await settled('home');
 const nav=()=>p.locator('#work-toggle').evaluate(e=>({current:e.getAttribute('aria-current'),expanded:e.getAttribute('aria-expanded'),hover:e.matches(':hover'),focus:e.matches(':focus'),bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}));
 r.workHomePointerOver=await nav();await p.mouse.move(20,500);await p.waitForTimeout(500);r.workHomePointerAway=await nav();
 await b.close();const w=await pw.webkit.launch({headless:true}),m=await w.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
 await m.goto('https://dumitru-spatial-portfolio.vercel.app/');await m.waitForFunction(()=>portfolioLoader.getState().phase==='complete');
 for(const [mode,sel]of [['home',null],['about','#about-control'],['process','#process-control'],['work','#work-toggle']]){if(sel)await m.locator(sel).click();await m.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending,mode);await m.waitForTimeout(700);await m.screenshot({path:path.join(__dirname,'webkit-normal-'+mode+'.png')})}
 fs.writeFileSync(path.join(__dirname,'visual-followup.json'),JSON.stringify(r,null,2));console.log(JSON.stringify(r));await w.close();
})().catch(e=>{console.error(e);process.exitCode=1});
