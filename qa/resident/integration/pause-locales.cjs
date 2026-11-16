const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright');}catch(_){pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');}
(async()=>{
 const b=await pw.chromium.launch({headless:true,channel:'chrome'}),checks=[];
 const expected={en:['Pause character animation','Resume character animation'],ro:['Oprește animația personajului','Reia animația personajului'],ru:['Приостановить анимацию персонажа','Возобновить анимацию персонажа']};
 for(const width of [320,390]){
  const p=await b.newPage({viewport:{width,height:844},hasTouch:true});await p.goto('http://127.0.0.1:8943/');
  await p.waitForFunction(()=>portfolioCharacter.getState().retired,null,{timeout:45000});
  for(const fontSize of ['125%','150%','200%']){
  await p.evaluate(fontSize=>document.documentElement.style.fontSize=fontSize,fontSize);
  for(const locale of ['en','ro','ru']){
   await p.evaluate(locale=>portfolioI18n.setLocale(locale),locale);await p.waitForTimeout(550);
   for(const paused of [false,true]){
    await p.evaluate(paused=>portfolioCompanion.pause(paused),paused);
    const data=await p.evaluate(()=>{
     const q=s=>document.querySelector(s).getBoundingClientRect().toJSON(),n=document.getElementById('companion-pause');
     return{label:n.getAttribute('aria-label'),pressed:n.hasAttribute('aria-pressed'),pause:q('#companion-pause'),brand:q('#home-control'),language:q('#language-toggle'),nav:q('.portfolio-nav')};
    });
    const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    checks.push({name:`${width}px ${locale} ${paused?'resume':'pause'} at ${fontSize}`,pass:data.label===expected[locale][Number(paused)]&&!data.pressed&&[data.brand,data.language,data.nav].every(r=>!overlap(data.pause,r)),data});
   }
  }}await p.close();
 }
 await b.close();fs.writeFileSync(path.join(__dirname,'pause-locales-report.json'),JSON.stringify({checks},null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
