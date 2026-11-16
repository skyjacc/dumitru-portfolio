const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const tag=process.argv[2]||'before';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}});
  if(tag==='before')await p.route('**/studio-nav.js',r=>r.fulfill({path:path.join(__dirname,'studio-nav-before.js'),contentType:'application/javascript'}));
  await p.goto('http://127.0.0.1:8943/?review=eyes-'+tag);
  await p.waitForFunction(()=>window.portfolioNav&&window.portfolioLoader?.getState().phase==='complete'&&!document.querySelector('#portfolio-ui').inert);
  await p.mouse.move(1000,45);await p.waitForTimeout(300);
  const frames=await p.evaluate(()=>new Promise(resolve=>{
   const frames=[];let n=0;
   function frame(t){
    const r=document.querySelector('.studio-eye-art').getBoundingClientRect();
    const a=n/72*Math.PI*2,x=r.x+r.width/2+Math.cos(a)*250,y=r.y+r.height/2+Math.sin(a)*30;
    dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,pointerType:'mouse'}));
    frames.push({t,pointer:[x,y],state:portfolioNav.getState().eyeOffset});
    if(++n<144)requestAnimationFrame(frame);else resolve(frames);
   }requestAnimationFrame(frame);
  }));
  const ranges=[0,1].map(eye=>[0,1].map(axis=>Math.max(...frames.map(f=>f.state[eye][axis]))-Math.min(...frames.map(f=>f.state[eye][axis]))));
  const report={tag,frames,ranges,kind:'Frame-cadenced synthetic pointer stream; continuous motion regression, not touch/device proof'};
  fs.writeFileSync(path.join(__dirname,'eyes-'+tag+'.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({tag,ranges}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
