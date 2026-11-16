const {chromium,webkit}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const out=__dirname,report={started:new Date().toISOString(),runs:[]};
const save=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
const home=p=>p.waitForFunction(()=>window.portfolioEntry?.ready&&portfolioEntry.mode==='home'&&!portfolioEntry.pending&&portfolioComposition.getState().enabled&&!portfolioComposition.getState().active&&document.querySelector('#studio-home').dataset.paperReveal==='done',null,{timeout:30000});
const work=p=>p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending,null,{timeout:20000});
async function point(p,x,y){return p.evaluate(({x,y})=>{const e=document.querySelector('#enter-work'),r=e.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(e).transform),dx=(x-.5)*e.offsetWidth,dy=(y-.5)*e.offsetHeight;return{x:r.x+r.width/2+m.a*dx+m.c*dy,y:r.y+r.height/2+m.b*dx+m.d*dy}},{x,y});}
async function clickPoint(p,pt,touch){if(touch)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);}
async function next(p){await p.locator('#enter-work').focus();await p.keyboard.press('PageDown');await p.waitForTimeout(80);await p.waitForFunction(()=>!portfolioComposition.getState().active);}
async function back(p){await p.locator('#studio-back').click();await home(p);}
async function run(browser,s){
 const ctx=await browser.newContext({viewport:{width:s.width,height:s.height},hasTouch:!!s.touch,isMobile:!!s.touch,reducedMotion:s.normal?'no-preference':'reduce'}),p=await ctx.newPage();p.setDefaultTimeout(12000);
 const r={scenario:s,checks:[],visuals:[],errors:[]};report.runs.push(r);p.on('pageerror',e=>r.errors.push(e.message));
 const check=(name,pass,data)=>{r.checks.push({name,pass:!!pass,data});save();if(!pass)console.log('FAIL '+s.name+' '+name,JSON.stringify(data));};
 try{
  await p.goto('http://127.0.0.1:8943/?qa=laptop-hint',{waitUntil:'domcontentloaded'});await home(p);
  if(s.normal){await clickPoint(p,await point(p,.5,.25),false);await work(p);check('normal motion screen click opens Work',true);await back(p);check('normal motion Back restores Home',await p.evaluate(()=>portfolioComposition.getState().progress===0));await p.screenshot({path:path.join(out,s.name+'-returned.png')});}
  else for(let composition=0;composition<3;composition++){
   check('composition '+composition,await p.evaluate(i=>Math.abs(portfolioComposition.getState().progress-i)<.001,composition));
   for(const locale of ['en','ro','ru']){
    await p.evaluate(l=>{document.activeElement?.blur();portfolioI18n.setLocale(l)},locale);await p.waitForTimeout(110);
    const metrics=await p.evaluate(()=>{const e=document.querySelector('.desk-work-prompt'),a=document.querySelector('.desk-work-arrow'),r=e.getBoundingClientRect(),ar=a.getBoundingClientRect(),intro=document.querySelector('.studio-intro').getBoundingClientRect(),style=getComputedStyle(e);return{text:e.textContent,rect:r.toJSON(),arrow:ar.toJSON(),font:style.fontFamily,fontSize:style.fontSize,color:style.color,inBounds:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,overlapsIntro:!(r.right<intro.left||r.left>intro.right||r.bottom<intro.top||r.top>intro.bottom),hitPrompt:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#enter-work')!==null,clip:getComputedStyle(document.querySelector('#enter-work .desk-cutout'),'::after').clipPath}});
    check('composition '+composition+' '+locale+' label localized and in bounds',metrics.text===({en:'Click here',ro:'Apasă aici',ru:'Нажми здесь'})[locale]&&metrics.inBounds,metrics);
    check('composition '+composition+' '+locale+' label does not overlap intro',!metrics.overlapsIntro);
    const screenshot=s.name+'-home'+composition+'-'+locale+'.png';await p.screenshot({path:path.join(out,screenshot)});r.visuals.push({composition,locale,screenshot,metrics});save();
   }
   await p.evaluate(()=>portfolioI18n.setLocale('en'));await p.waitForTimeout(110);
   for(const [name,x,y] of [['left transparency',.02,.5],['right transparency',.98,.5],['top corner transparency',.01,.01]]){
    const pt=await point(p,x,y),hit=await p.evaluate(pt=>document.elementFromPoint(pt.x,pt.y)?.closest('#enter-work')?.id||null,pt);await clickPoint(p,pt,s.touch);await p.waitForTimeout(90);const stayed=await p.evaluate(()=>portfolioEntry.mode==='home');check('composition '+composition+' '+name+' stays Home',!hit&&stayed,{pt,hit});if(!stayed){await work(p);await back(p);}
   }
   for(const sel of ['.desk-work-prompt','.desk-work-arrow']){
    const box=await p.locator(sel).boundingBox(),pt={x:box.x+box.width/2,y:box.y+box.height/2};await clickPoint(p,pt,s.touch);await p.waitForTimeout(90);const stayed=await p.evaluate(()=>portfolioEntry.mode==='home');check('composition '+composition+' '+sel+' stays Home',stayed,pt);if(!stayed){await work(p);await back(p);}
   }
   for(const [name,x,y] of [['screen',.5,.25],['keyboard',.5,.65]]){
    const pt=await point(p,x,y),hit=await p.evaluate(pt=>document.elementFromPoint(pt.x,pt.y)?.closest('#enter-work')?.id||null,pt);check('composition '+composition+' '+name+' hits silhouette',hit==='enter-work',pt);await clickPoint(p,pt,s.touch);await work(p);check('composition '+composition+' '+name+' opens Work',true);await back(p);check('composition '+composition+' '+name+' Back restores composition',await p.evaluate(i=>Math.abs(portfolioComposition.getState().progress-i)<.001,composition));
   }
   await p.locator('#enter-work').focus();await p.keyboard.press(composition===1?'Space':'Enter');await work(p);check('composition '+composition+' native keyboard activation',true);await back(p);
   if(composition<2)await next(p);
  }
  check('no page errors',r.errors.length===0,r.errors);
 }catch(e){check('scenario completion',false,e.stack);await p.screenshot({path:path.join(out,s.name+'-failure.png')}).catch(()=>{});}
 finally{await ctx.close();save();console.log('DONE '+s.name);}
}
(async()=>{
 const c=await chromium.launch({channel:'chrome',headless:true}),w=await webkit.launch({headless:true});
 try{await Promise.all([run(c,{name:'desktop',width:1440,height:900}),run(c,{name:'mobile',width:390,height:844,touch:true}),run(c,{name:'narrow',width:320,height:568,touch:true}),run(w,{name:'short-webkit',width:854,height:480,touch:true})]);await run(c,{name:'normal-motion',width:1440,height:900,normal:true});}
 finally{await c.close();await w.close();report.finished=new Date().toISOString();report.summary={checks:report.runs.reduce((n,r)=>n+r.checks.length,0),failures:report.runs.flatMap(r=>r.checks.filter(c=>!c.pass).map(c=>({scenario:r.scenario.name,...c})))};save();console.log(JSON.stringify(report.summary));if(report.summary.failures.length)process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1});
