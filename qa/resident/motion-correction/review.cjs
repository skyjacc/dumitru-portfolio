const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1840,height:850},deviceScaleFactor:1});
 await page.setContent('<style>body{margin:20px;background:#080808;color:#aaa;font:12px system-ui}h2{font-size:16px;font-weight:500;margin:10px 0}.row{display:flex;gap:10px}.cell{width:170px;height:232px;position:relative}.figure,.fixtures{position:absolute;left:28px;top:5px;width:120px;height:200px}.label{position:absolute;bottom:6px;left:10px}.floor{position:absolute;left:6px;right:0;top:193px;border-top:1px solid #181818}</style><main></main><div id="test"></div><div id="props"></div>');
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 const report=await page.evaluate(()=>{
  const checks=[],dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),check=(name,pass,detail)=>checks.push({name,pass,detail});
  const rig=StudioCharacterRig.create(document.querySelector('#test'),{fixtureHost:document.querySelector('#props')});
  const input=(action,phase,progress)=>({action,phase,progress,elapsed:progress*7000,repeats:4,variant:0,facing:1});
  const boundaries={},continuous={};
  for(const action of ['pushups','coffee','measure']){
   rig.render(input('idle','perform',0));let prev=rig.metrics(),max=0,where=null,edge=[];
   for(const phase of ['prepare','perform','finish']){
    for(let i=0;i<=200;i++){
     const s=rig.render(input(action,phase,i/200));
     const delta=Math.max(...Object.keys(s.joints).map(k=>dist(prev.joints[k],s.joints[k])));
     if(delta>max){max=delta;where={phase,progress:i/200};}
     if(i===0)edge.push({phase,delta});
     const expected={torso:50,leftUpperArm:28,leftForearm:27,rightUpperArm:28,rightForearm:27,leftThigh:36,leftShin:38,rightThigh:36,rightShin:38};
     if(Object.keys(expected).some(k=>Math.abs(s.bones[k]-expected[k])>.002))throw Error(action+' stretched a bone');
     prev=s;
    }
   }
   const end=rig.metrics(),idle=rig.render(input('idle','perform',0));edge.push({phase:'idle',delta:Math.max(...Object.keys(end.joints).map(k=>dist(end.joints[k],idle.joints[k])))});
   boundaries[action]=edge;continuous[action]={max,where};
   check(action+' phase boundaries have no position jump',edge.every(e=>e.delta<.05),edge);
   check(action+' dense motion has no joint flip',max<6,{max,where});
  }
  let aboveFloor=true,contacts=true,axis=true;
  for(let i=0;i<=100;i++){
   const s=rig.render(input('pushups','perform',i/100)),j=s.joints;
   contacts&&=['leftHand','rightHand','leftFoot','rightFoot'].every(k=>Math.abs(j[k].y-188)<.001);
   aboveFloor&&=Object.values(j).every(p=>p.y<=188.001);
   const a={x:j.shoulder.x-j.hip.x,y:j.shoulder.y-j.hip.y},b={x:j.hip.x-j.rightFoot.x,y:j.hip.y-j.rightFoot.y};
   axis&&=Math.abs(a.x*b.y-a.y*b.x)<.01&&j.head.x>j.shoulder.x&&j.shoulder.x>j.hip.x&&j.hip.x>j.rightFoot.x;
  }
  check('Pushups keep four ground contacts',contacts);check('Pushups never pass joints through floor',aboveFloor);check('Prone body has one aligned hip/shoulder/back-leg axis',axis);
  rig.render(input('measure','prepare',1));let ruler=true;
  for(let i=0;i<=100;i++){const s=rig.render(input('measure','perform',i/100));ruler&&=Math.abs(dist(s.joints.leftHand,s.joints.rightHand)-41)<.01;}
  check('Ruler spans both hands throughout inspection',ruler);
  const ignored=JSON.stringify(rig.render({...input('coffee','perform',.35),look:{x:1,y:1}}).joints)===JSON.stringify(rig.render({...input('coffee','perform',.35),look:{x:0,y:0}}).joints);
  check('Pointer look cannot break cup/head contact',ignored);
  for(const action of ['pushups','coffee','measure']){
   let jump=0,maxDelta=0;
   for(const fromPhase of ['prepare','perform'])for(const from of [.13,.4,.8]){
    rig.render(input('idle','perform',0));let previous;
    if(fromPhase==='perform')rig.render(input(action,'prepare',1));
    for(let frame=0;frame<=Math.round(from*200);frame++)previous=rig.render(input(action,fromPhase,frame/200));
    for(let i=0;i<=200;i++){
     const current=rig.render({...input(action,'finish',i/200),interrupted:true});
     const delta=Math.max(...Object.keys(current.joints).map(k=>dist(current.joints[k],previous.joints[k])));
     if(i===0)jump=Math.max(jump,delta);else maxDelta=Math.max(maxDelta,delta);previous=current;
    }
   }
   check(action+' interrupted exit starts at actual pose',jump<.05,{jump,maxDelta});
   check(action+' interrupted exit has no joint flip',maxDelta<6,{maxDelta});
  }
  rig.destroy();
  const cells=[['prepare',0],['prepare',.3],['prepare',.65],['prepare',.82],['prepare',1],['perform',.125],['perform',.25],['finish',.35],['finish',.7],['finish',1]];
  for(const action of ['pushups','coffee','measure']){
   const h=document.createElement('h2');h.textContent=action;document.querySelector('main').append(h);const row=document.createElement('div');row.className='row';h.after(row);
   for(const [phase,p]of cells){const cell=document.createElement('div');cell.className='cell';cell.innerHTML='<div class="floor"></div><div class="fixtures"></div><div class="figure"></div><span class="label">'+phase+' '+Math.round(p*100)+'%</span>';row.append(cell);
    const r=StudioCharacterRig.create(cell.querySelector('.figure'),{fixtureHost:cell.querySelector('.fixtures')});
    for(const step of ['prepare','perform','finish']){if(['prepare','perform','finish'].indexOf(step)>['prepare','perform','finish'].indexOf(phase))break;const until=step===phase?p:1;for(let n=0;n<=Math.round(until*200);n++)r.render(input(action,step,n/200));}
   }
  }
  return {checks,boundaries,continuous};
 });
 await page.screenshot({path:path.join(__dirname,'phases.png'),fullPage:true});
 fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));if(report.checks.some(c=>!c.pass))process.exitCode=1;
})();
