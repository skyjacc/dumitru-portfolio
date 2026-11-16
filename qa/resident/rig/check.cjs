const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:2});
 await page.setContent('<style>body{background:#080808;color:#c3c2b7;font:12px system-ui}main{display:grid;grid-template-columns:repeat(8,1fr);gap:15px}section{height:240px;position:relative;border-bottom:1px solid #222}.frame{position:relative;width:90px;height:150px;margin:20px 0 0 40px}.frame>div{position:absolute;inset:0}p{margin:8px 32px}</style><main></main>');
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 const results=await page.evaluate(()=>{
  const main=document.querySelector('main'),records={},failures=[];
  const expected={torso:50,leftUpperArm:28,leftForearm:27,rightUpperArm:28,rightForearm:27,leftThigh:36,leftShin:38,rightThigh:36,rightShin:38};
  for(const action of StudioCharacterRig.actions){
   const section=document.createElement('section');section.innerHTML=`<div class="frame"><div class="fixtures"></div><div class="figure"></div></div><p>${action}</p>`;main.append(section);
   const rig=StudioCharacterRig.create(section.querySelector('.figure'),{fixtureHost:section.querySelector('.fixtures')});
   let maxContact=0,maxReach=0;
   for(const phase of ['prepare','perform','finish'])for(let n=0;n<=40;n++){
    const f={action,phase,progress:n/40,elapsed:n/40*6000,variant:0,facing:1};rig.render(f);const s=rig.metrics();
    for(const [name,len]of Object.entries(s.bones))if(Math.abs(len-expected[name])>.002)failures.push({action,phase,n,bone:name,len});
    if(Object.values(s.joints).some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))failures.push({action,phase,n,finite:false});
    if(phase==='perform'){maxContact=Math.max(maxContact,...s.contacts.map(c=>c.error));maxReach=Math.max(maxReach,...Object.values(s.reachErrors));}
   }
   rig.render({action,phase:'perform',progress:action==='pushups'?.12:action==='plane'?.7:.42,elapsed:1500,variant:0,facing:1});
   records[action]={maxContact,maxReach,snapshot:rig.metrics()};
  }
  return {records,failures};
 });
 fs.writeFileSync(path.join(__dirname,'kinematics.json'),JSON.stringify(results,null,2));await page.screenshot({path:path.join(__dirname,'all-actions.png'),fullPage:true});
 await browser.close();assert.equal(results.failures.length,0,JSON.stringify(results.failures.slice(0,5)));console.log(JSON.stringify(Object.fromEntries(Object.entries(results.records).map(([a,r])=>[a,{contact:r.maxContact,reach:r.maxReach}]))));
})();
