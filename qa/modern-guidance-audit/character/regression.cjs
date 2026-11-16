const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const cases=[{name:'desktop'},{name:'fallback',fallback:true},{name:'reduced',reduced:true},{name:'phone',touch:true}];
const reports=[];
function check(r,name,pass,detail){r.checks.push({name,pass:!!pass,detail})}
const state=()=>portfolioCharacter.getState();
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
for(const c of cases){const p=await b.newPage({viewport:{width:c.touch?390:1440,height:c.touch?844:900},deviceScaleFactor:c.touch?2:1,isMobile:!!c.touch,hasTouch:!!c.touch,reducedMotion:c.reduced?'reduce':'no-preference'});const r={scenario:c,checks:[],errors:[]};p.on('pageerror',e=>r.errors.push(e.message));
try{
 if(c.fallback)await p.addInitScript(()=>Object.defineProperty(window,'scheduler',{value:undefined,configurable:true}));
 await p.goto('http://127.0.0.1:8943/?character-regression='+c.name,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>portfolioLoader?.getState().phase==='complete');
 if(!c.touch)await p.waitForFunction(()=>portfolioCharacter.getState().maskCount===9);
 await p.waitForFunction(()=>!portfolioCharacter.getState().returning);
 const ready=await p.evaluate(state);check(r,'correct mask count after handoff',ready.maskCount===(c.touch?0:9),ready);
 if(c.reduced)check(r,'reduced motion is static',ready.frame===4&&!ready.returning&&ready.reducedMotion);
 if(c.fallback)check(r,'scheduler absent fallback completes',await p.evaluate(()=>!window.scheduler));
 await p.evaluate(()=>document.activeElement?.blur());
 await p.keyboard.down('d');await p.waitForTimeout(240);await p.keyboard.up('d');const moved=await p.evaluate(state);
 check(r,'keyboard movement matches input mode',c.touch?Math.abs(moved.x-ready.x)<1:moved.x-ready.x>30,{before:ready.x,after:moved.x});
 await p.keyboard.press('Space');
 if(c.touch){await p.waitForTimeout(150);check(r,'touch has no keyboard game',(await p.evaluate(state)).y===0)}
 else {await p.waitForFunction(()=>portfolioCharacter.getState().y>25,null,{timeout:2000});check(r,'intentional jump works',!(await p.evaluate(state)).grounded);await p.waitForFunction(()=>portfolioCharacter.getState().grounded,null,{timeout:2500});check(r,'jump lands on ground or a valid surface',(await p.evaluate(state)).grounded)}
 if(!c.touch){
  await p.locator('#enter-work').focus();const x=(await p.evaluate(state)).x;await p.keyboard.press('ArrowRight');await p.waitForTimeout(90);check(r,'focused controls retain keyboard',Math.abs((await p.evaluate(state)).x-x)<1);
 }
 await p.locator('#enter-work').click();await p.waitForFunction(()=>portfolioEntry.mode==='work');check(r,'leaving Home suspends controller',!(await p.evaluate(state)).active);
 await p.locator('#home-control').click();await p.waitForFunction(()=>portfolioEntry.mode==='home');await p.waitForTimeout(150);const back=await p.evaluate(state);check(r,'Home return restores idle without stale held key',back.active&&!back.heldKeys.length&&!back.returning);
 if(c.name==='desktop'){
  const target=p.locator('.desk-phone img');const original=await target.getAttribute('src');
  await p.route('**/qa-slow-mask.svg',async route=>{await new Promise(r=>setTimeout(r,200));await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="12" fill="white"/></svg>'})});
  await target.evaluate(el=>{el.src='/qa-slow-mask.svg'});await p.waitForTimeout(40);
  await target.evaluate((el,src)=>{el.src=src},original);await p.waitForFunction(()=>portfolioCharacter.getState().maskCount===9);await p.waitForTimeout(300);
  check(r,'replaced pending image discards stale mask',await target.evaluate((el,src)=>el.currentSrc.endsWith(src),original));
  check(r,'all masks recover after source replacement',(await p.evaluate(state)).maskCount===9);
 }
 check(r,'no browser exception',r.errors.length===0,r.errors);
}catch(e){r.error=e.stack;check(r,'scenario completed',false,e.message)}
reports.push(r);await p.close();console.log(c.name,r.checks.filter(x=>x.pass).length+'/'+r.checks.length);
}
await b.close();const summary={checks:reports.reduce((n,r)=>n+r.checks.length,0),failures:reports.flatMap(r=>r.checks.filter(x=>!x.pass).map(x=>({scenario:r.scenario.name,...x}))),reports};fs.writeFileSync(path.join(__dirname,'regression.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({checks:summary.checks,failures:summary.failures}));if(summary.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
