const fs=require('node:fs'),path=require('node:path');
const{chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{
const b=await chromium.launch({headless:true,channel:'chrome'}),c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await c.newPage(),states=[];
await p.addInitScript(()=>{window.__events=[];for(const name of ['visibilitychange','freeze','resume','blur','focus','pageshow','pagehide'])window.addEventListener(name,e=>__events.push({name,persisted:e.persisted,time:performance.now(),hidden:document.hidden,focus:document.hasFocus()}),true)});
const snap=async name=>{const s=await p.evaluate(()=>({events:__events,hidden:document.hidden,focus:document.hasFocus(),visibility:document.visibilityState,video:[...document.querySelectorAll('video')].map(v=>({src:v.src,time:v.currentTime,paused:v.paused})),companion:portfolioCompanion.getState().life}));states.push({name,...s});};
await p.goto('https://dumitru-spatial-portfolio.vercel.app/');await p.waitForFunction(()=>portfolioLoader.getState().phase==='complete');await p.click('#work-toggle');await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending);await p.evaluate(()=>portfolioEntry.open('andra'));await p.waitForFunction(()=>portfolioRuntime.focusedKey==='andra'&&!portfolioRuntime.moving);await p.click('#next-material');await p.waitForFunction(()=>document.querySelector('video')?.currentTime>0);await snap('playing');
const other=await c.newPage();await other.goto('about:blank');await other.bringToFront();await new Promise(r=>setTimeout(r,700));await snap('other-front');await p.bringToFront();await new Promise(r=>setTimeout(r,1000));await snap('tab-return');
const cdp=await c.newCDPSession(p);await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await new Promise(r=>setTimeout(r,700));await cdp.send('Page.setWebLifecycleState',{state:'active'});await p.bringToFront();await new Promise(r=>setTimeout(r,1000));await snap('freeze-active');
await p.mouse.move(180,410);await new Promise(r=>setTimeout(r,300));await snap('pointer');
fs.writeFileSync(path.join(__dirname,'visibility-real.json'),JSON.stringify(states,null,2));console.log(JSON.stringify(states.map(({name,hidden,focus,video,events})=>({name,hidden,focus,video,events}))));await b.close();
})();
