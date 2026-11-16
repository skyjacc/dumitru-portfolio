const {webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943',suffix=process.env.REVIEW_SUFFIX||'local';
const out=path.join(__dirname,'webkit-'+suffix),runs=[];fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await webkit.launch({headless:true});
 for(const [w,h]of[[390,844],[393,620]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:3,isMobile:true,hasTouch:true});const checks=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:20000});
  const equal=(a,b)=>['x','y','zoom'].every(k=>Math.abs(a[k]-b[k])<.01);
  try{
   await page.goto(origin+'/?v=project-clarity');await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
   await page.locator('#work-toggle').tap();await settle('work');
   for(const key of ['andra','btb','fkd','ora','bonanza']){
    const camera=await page.evaluate(()=>({...portfolioRuntime.camera}));await page.locator('#work-toggle').tap();await page.locator('#work-list [data-key='+key+']').tap();await settle('detail');
    for(let i=0;i<4;i++){
     await page.waitForTimeout(1000);
     const m=await page.evaluate(()=>({key:portfolioRuntime.focusedKey,index:portfolioRuntime.materialIndex,geometry:portfolioRuntime.materialGeometry,overflow:document.documentElement.scrollWidth>innerWidth,scrollbars:[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().width>0&&!n.closest('[hidden],[inert]')&&['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1).map(n=>({id:n.id,class:n.className,rect:n.getBoundingClientRect().toJSON()})),canvas:[...document.querySelectorAll('canvas')].map(n=>({width:n.width,height:n.height,rect:n.getBoundingClientRect().toJSON()}))}));
     checks.push({name:key+' material '+i,pass:m.key===key&&m.index===i&&!m.overflow&&m.scrollbars.length===0,data:m});
     if(w===390||i===(key==='andra'?2:3))await page.screenshot({path:path.join(out,w+'x'+h+'-'+key+'-'+i+'.png'),scale:'css'});
     // The native orbit alternates slots (0,1,-1,2); dots select catalogue order.
     if(i<3){await page.locator('#material-dots [data-material="'+(i+1)+'"]').tap();await page.waitForFunction(i=>portfolioRuntime.materialIndex===i,i+1,{timeout:12000})}
    }
    await page.locator('#return-control').tap();await settle('work');const back=await page.evaluate(()=>({...portfolioRuntime.camera}));checks.push({name:key+' exact return',pass:equal(camera,back),data:{camera,back}});
   }
   // WebKit need not route native uploads through createImageBitmap(HTMLImageElement).
   // Verify source decoding directly; this is not a GPU texture-resolution assertion.
   for(const key of ['andra','btb','fkd','ora','bonanza']){const source=await page.evaluate(async key=>{const image=new Image();image.src='/assets/projects/'+key+'/mobile-preview.svg';await image.decode();return [image.naturalWidth,image.naturalHeight]},key);checks.push({name:key+' retina source decode',pass:source[0]===1170&&source[1]===2532,data:source})}
  }catch(e){errors.push(String(e))}
  checks.push({name:'no errors',pass:errors.length===0,data:errors});runs.push({viewport:[w,h],checks});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({origin,runs},null,2));const all=runs.flatMap(r=>r.checks);console.log(JSON.stringify({checks:all.length,failures:all.filter(c=>!c.pass)}));if(all.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
