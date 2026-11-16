const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1320,height:540},deviceScaleFactor:2});
 await page.setContent(`<style>body{background:#080808;color:#c3c2b7;font:13px system-ui;margin:32px}h1{font-size:18px;font-weight:400;color:#eee}main{display:flex;gap:32px;align-items:end;margin-top:72px}.tile{width:140px;height:220px;position:relative}.pose{position:absolute;left:24px;top:20px;width:75px;height:125px}.figure,.fixtures{position:absolute;inset:0}.label{position:absolute;top:180px;left:24px;color:#93938d}.edge{position:absolute;top:15px;left:0;width:62px;height:185px;background:#181817;border-radius:6px;border-right:1px solid #6a6a65}.reference{height:125px;width:auto;opacity:.9}</style><h1>One pencil figure · six poses · 125px high</h1><main><div class="tile"><img class="reference" id="ref"><div class="label">Original reference</div></div>${['idle','walk','work','coffee','sword','peek'].map(a=>`<div class="tile"><div class="pose" data-action="${a}"><div class="fixtures"></div><div class="figure"></div></div><div class="label">${a}</div></div>`).join('')}</main>`);
 await page.$eval('#ref',(el,src)=>el.src=src,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'site/hero/walker/frame-1.webp')).toString('base64'));
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 const result=await page.evaluate(()=>{
  const results={};document.querySelectorAll('.pose').forEach(el=>{
   const action=el.dataset.action,rig=StudioCharacterRig.create(el.querySelector('.figure'),{fixtureHost:el.querySelector('.fixtures')});
   rig.render({action,phase:'perform',progress:action==='sword'?.17:.55,elapsed:action==='walk'?0:1200,variant:0,facing:1});
   if(action==='peek'){
    const edge=document.createElement('div');edge.className='edge';el.prepend(edge);edge.style.transform='scale(.625)';edge.style.transformOrigin='0 0';
    rig.bodyElement.style.clipPath='polygon(62px -40px,200px -40px,200px 220px,62px 220px)';
   }
   results[action]={metrics:rig.metrics(),svg:rig.svg.outerHTML};
  });return results;
 });
 fs.writeFileSync(path.join(__dirname,'six-pose-metrics.json'),JSON.stringify(result,null,2));
 for(const [name,data]of Object.entries(result))fs.writeFileSync(path.join(__dirname,`${name}.svg`),data.svg);
 await page.screenshot({path:path.join(__dirname,'six-poses.png')});
 await browser.close();console.log(JSON.stringify(Object.fromEntries(Object.entries(result).map(([a,v])=>[a,{bones:v.metrics.bones,reach:v.metrics.reachErrors,contacts:v.metrics.contacts}]))));
})();
