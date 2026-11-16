const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright');}catch(_){pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');}
(async()=>{
 const b=await pw.chromium.launch({headless:true,channel:'chrome'}),checks=[];
 // Pause remains a developer API; it must not add a public button in any locale.
 for(const width of [320,390]){
  const p=await b.newPage({viewport:{width,height:844},hasTouch:true});await p.goto('http://127.0.0.1:8943/');
  await p.waitForFunction(()=>portfolioLoader.getState().phase==='complete'&&document.body.dataset.resident==='ready'&&window.portfolioCompanion,null,{timeout:45000});
  await p.locator('#work-toggle').click();
  await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);
  for(const fontSize of ['125%','150%','200%']){
  await p.evaluate(fontSize=>document.documentElement.style.fontSize=fontSize,fontSize);
  for(const locale of ['en','ro','ru']){
   await p.evaluate(locale=>portfolioI18n.setLocale(locale),locale);await p.waitForTimeout(550);
   for(const paused of [false,true]){
    await p.evaluate(paused=>portfolioCompanion.pause(paused),paused);
    const data=await p.evaluate(()=>{
     const s=portfolioCompanion.getState();
     return{locale:portfolioI18n.locale,pausePresent:!!document.getElementById('companion-pause'),userPaused:s.life.userPaused,original:portfolioCharacter.getState()};
    });
    checks.push({name:`${width}px ${locale} debug pause=${paused} at ${fontSize} leaves public controls unchanged`,pass:data.locale===locale&&!data.pausePresent&&data.userPaused===paused&&!data.original.active&&!data.original.retired,data});
   }
  }}await p.close();
 }
 await b.close();fs.writeFileSync(path.join(__dirname,'pause-locales-report.json'),JSON.stringify({checks},null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
