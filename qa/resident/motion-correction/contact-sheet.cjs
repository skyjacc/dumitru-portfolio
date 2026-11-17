const path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1510,height:950},deviceScaleFactor:1});
 await page.setContent('<style>body{margin:24px;background:#080808;color:#9b9b98;font:12px/1.4 system-ui}header{display:flex;align-items:center;gap:22px;height:150px}header img{height:140px;width:auto}h1{font-size:18px;font-weight:400}h2{font-size:13px;font-weight:400;margin:12px 0}.row{display:flex;gap:12px}.cell{width:165px;height:165px;position:relative}.figure,.fixture{position:absolute;top:0;left:35px;width:84px;height:140px}.figure svg,.fixture svg{width:100%;height:100%;overflow:visible}.label{position:absolute;bottom:1px;left:5px;color:#888}</style><header><img alt="Original figure reference"><h1>Complete motion key poses<br>140 px · normal UI size · both facing directions</h1></header><main></main>');
 await page.locator('header img').evaluate((el,data)=>el.src=data,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'site/hero/walker/frame-1.webp')).toString('base64'));
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 await page.evaluate(()=>{
  const stages={coffee:[['prepare',0],['prepare',.55],['prepare',1],['perform',.2],['perform',.5],['perform',1],['finish',.34],['finish',1]],pushups:[['prepare',0],['prepare',.25],['prepare',.45],['prepare',.66],['prepare',.83],['perform',.18],['finish',.48],['finish',1]]};
  for(const action of ['coffee','pushups'])for(const facing of [1,-1]){const title=document.createElement('h2');title.textContent=action+' · facing '+facing;const row=document.createElement('div');row.className='row';document.querySelector('main').append(title,row);
   for(const [phase,progress]of stages[action]){const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<div class="fixture"></div><div class="figure"></div><div class="label">'+phase+' '+Math.round(progress*100)+'%</div>';row.append(cell);const rig=StudioCharacterRig.create(cell.querySelector('.figure'),{fixtureHost:cell.querySelector('.fixture')});for(const p of ['prepare','perform','finish']){for(let i=0;i<=Math.round((p===phase?progress:1)*200);i++)rig.render({action,phase:p,progress:i/200,elapsed:i/200*(p==='perform'?6500:3400),facing,repeats:3});if(p===phase)break;}}
  }
 });
 await page.screenshot({path:path.join(__dirname,'full-contact-sheet.png'),fullPage:true});await browser.close();console.log('full-contact-sheet.png');
})().catch(error=>{console.error(error);process.exitCode=1});
