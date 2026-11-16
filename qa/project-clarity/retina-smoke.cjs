const {webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943';
const suffix=process.env.REVIEW_SUFFIX||'local';
(async()=>{
 const browser=await webkit.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const settle=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&!portfolioRuntime.moving,mode,{timeout:20000});
 try {
  await page.goto(origin+'/?review=project-retina');
  await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done',null,{timeout:45000});
  for(const key of ['andra','btb','fkd','ora','bonanza']){
   const image=await page.evaluate(async key=>{const image=new Image();image.src='/assets/projects/'+key+'/mobile-preview.svg';await image.decode();return {width:image.naturalWidth,height:image.naturalHeight,complete:image.complete}},key);
   checks.push({name:key+' WebKit native Retina decode',pass:image.complete&&image.width===1170&&image.height===2532,data:image});
  }
  await page.locator('#work-toggle').tap();await settle('work');
  for(const [key,index] of [['andra',2],['fkd',3]]){
   const camera=await page.evaluate(()=>({...portfolioRuntime.camera}));
   await page.locator('#work-toggle').tap();await page.locator('#work-list [data-key='+key+']').tap();await settle('detail');
   await page.locator('#material-dots [data-material="'+index+'"]').tap();
   await page.waitForFunction(index=>portfolioRuntime.materialIndex===index,index);await page.waitForTimeout(1200);
   const state=await page.evaluate(()=>({key:portfolioRuntime.focusedKey,index:portfolioRuntime.materialIndex,overflow:document.documentElement.scrollWidth>innerWidth,scrollbars:[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().width>0&&!n.closest('[hidden],[inert]')&&['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1).map(n=>n.id||n.className)}));
   checks.push({name:key+' mobile material',pass:state.key===key&&state.index===index&&!state.overflow&&state.scrollbars.length===0,data:state});
   await page.screenshot({path:path.join(__dirname,'retina-'+suffix+'-'+key+'.png'),scale:'device'});
   await page.locator('#return-control').tap();await settle('work');
   const back=await page.evaluate(()=>({...portfolioRuntime.camera}));
   checks.push({name:key+' saved camera return',pass:['x','y','zoom'].every(k=>Math.abs(camera[k]-back[k])<.01),data:{camera,back}});
  }
 } catch(e){errors.push(String(e))}
 checks.push({name:'no JavaScript / HTTP errors',pass:errors.length===0,data:errors});
 await browser.close();fs.writeFileSync(path.join(__dirname,'retina-'+suffix+'.json'),JSON.stringify({origin,checks,note:'Intrinsic SVG decode is verified. This does not measure final GPU texture resolution; visual captures and separate native interaction checks cover rendering.'},null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
