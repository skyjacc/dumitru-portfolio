const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../qa/small-screens');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,channel:'chrome'});const results=[],errors=[];
for(const [width,height] of [[320,740],[480,854],[854,480]]){
 const p=await b.newPage({viewport:{width,height},hasTouch:true,isMobile:width<600});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8943');await p.waitForFunction(()=>window.portfolioRuntime?.ready);await p.waitForTimeout(1800);
 for(const key of ['andra','despre']){
  if(key==='despre')await p.locator('#about-control').tap();else{await p.locator('#work-toggle').tap();await p.locator('#work-list [data-key=andra]').tap()}
  await p.waitForFunction(key=>window.portfolioRuntime?.focusedKey===key&&!window.portfolioRuntime?.moving,key);await p.waitForTimeout(650);
  const labels=await p.locator('#material-dots button').allTextContents();await p.locator('#material-dots button').nth(2).tap();await p.waitForTimeout(700);
  const report=await p.evaluate(()=>({state:window.portfolioRuntime,ui:[...document.querySelectorAll('.portfolio-nav>button,.portfolio-nav>a,#work-toggle,#project-controls>button,#project-controls>a,.material-controls button')].filter(e=>e.getClientRects().length).map(e=>({label:e.getAttribute('aria-label')||e.textContent.trim(),box:e.getBoundingClientRect().toJSON()})),overflow:document.documentElement.scrollWidth>innerWidth}));
  report.uiInBounds=report.ui.every(({box:r})=>r.x>=-1&&r.y>=-1&&r.right<=width+1&&r.bottom<=height+1);
  report.width=width;report.height=height;report.key=key;results.push(report);
  await p.screenshot({path:path.join(out,`${width}-${height}-${key}.png`)});await p.locator('#return-control').tap();await p.waitForFunction(()=>!window.portfolioRuntime?.focusedKey&&!window.portfolioRuntime?.moving);await p.waitForTimeout(100);
 }
 await p.close();
}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({errors,checks:results.map(x=>({width:x.width,height:x.height,key:x.key,uiInBounds:x.uiInBounds,overflow:x.overflow,index:x.state.materialIndex}))},null,2));await b.close()})();
