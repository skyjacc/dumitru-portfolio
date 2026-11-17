/* Geometry and temporal checks. No site runtime is rewritten or mocked. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage();
 await page.setContent('<div id="figure"></div><div id="fixtures"></div>');
 await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 const report=await page.evaluate(()=>{
  const checks=[],dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
  let rig;const reset=()=>{rig?.destroy();rig=StudioCharacterRig.create(document.querySelector('#figure'),{fixtureHost:document.querySelector('#fixtures')});};reset();
  const input=(action,phase,progress,extra={})=>({action,phase,progress,elapsed:progress*(phase==='perform'?6000:3000),variant:0,repeats:3,facing:1,...extra});
  const delta=(a,b)=>Math.max(...Object.keys(a.joints).map(k=>dist(a.joints[k],b.joints[k])));
  const thresholds=[['work',1,'elapsed',2400],['work',2,'elapsed',2400],['game',0,'elapsed',3900],['game',0,'elapsed',4000],['game',0,'elapsed',5000],['peek',0,'progress',.5],['peek',0,'progress',.8],['controller',0,'progress',.72],['controller',0,'progress',.83]];
  for(const [action,variant,key,boundary]of thresholds){
   const samples=[1,.01,.0001].map(scale=>{reset();const epsilon=(key==='elapsed'?1:.001)*scale;const i=input(action,'perform',.5,{elapsed:3000,variant});return{epsilon,delta:delta(rig.render({...i,[key]:boundary-epsilon}),rig.render({...i,[key]:boundary+epsilon}))};});
   check(`${action}/${variant} continuous around ${key}=${boundary}`,samples[2].delta<.01&&samples[2].delta<=samples[0].delta*.02+.00001,samples);
  }
  const expected={torso:50,leftUpperArm:28,leftForearm:27,rightUpperArm:28,rightForearm:27,leftThigh:36,leftShin:38,rightThigh:36,rightShin:38};
  const temporal=[];
  for(const action of ['work','game','peek','controller','coffee','pushups'])for(const variant of action==='work'?[0,1,2]:[0]){
   reset();let previous=rig.render(input('idle','perform',0)),worstBone=0,worstReach=0;const joins=[];
   for(const phase of ['prepare','perform','finish']){
    const first=rig.render(input(action,phase,0,{variant}));joins.push({phase,delta:delta(previous,first)});
    const duration=phase==='perform'?6000:3000,dt=1000/60;let velocity=null,maxSpeed=0,maxAcceleration=0;
    for(let time=0;time<=duration+.01;time+=dt){
     const s=rig.render(input(action,phase,Math.min(1,time/duration),{elapsed:time,variant}));
     for(const key in expected)worstBone=Math.max(worstBone,Math.abs(s.bones[key]-expected[key]));
     if(s.reachErrors)worstReach=Math.max(worstReach,...Object.values(s.reachErrors));
     if(time>0){const nextVelocity=Object.fromEntries(Object.keys(s.joints).map(k=>[k,{x:(s.joints[k].x-previous.joints[k].x)*1000/dt,y:(s.joints[k].y-previous.joints[k].y)*1000/dt}]));maxSpeed=Math.max(maxSpeed,...Object.values(nextVelocity).map(v=>Math.hypot(v.x,v.y)));if(velocity)maxAcceleration=Math.max(maxAcceleration,...Object.keys(velocity).map(k=>dist(velocity[k],nextVelocity[k])*1000/dt));velocity=nextVelocity;}
     previous=s;
    }
    previous=rig.render(input(action,phase,1,{elapsed:duration,variant}));temporal.push({action,variant,phase,dt,maxSpeed,maxAcceleration});
   }
   joins.push({phase:'idle',delta:delta(previous,rig.render(input('idle','perform',0)))});
   check(`${action}/${variant} prepare/perform/finish/idle joins`,joins.every(j=>j.delta<.05),joins);
   check(`${action}/${variant} stable segment lengths`,worstBone<.005,{worstBone,worstReach});
   check(`${action}/${variant} finite 60Hz speed and acceleration`,temporal.filter(t=>t.action===action&&t.variant===variant).every(t=>Number.isFinite(t.maxAcceleration)&&t.maxSpeed<900&&t.maxAcceleration<60000),temporal.filter(t=>t.action===action&&t.variant===variant));
  }
  for(const facing of [1,-1]){
   reset();let worstDrift=0,worstFloor=0,worstBone=0,floorAt=null,contactsLast=new Map(),lift={left:0,right:0},badAirContact=0;const stageSet=new Set();
   for(const phase of ['prepare','perform','finish'])for(let n=0;n<=500;n++){
    const s=rig.render(input('pushups',phase,n/500,{facing}));stageSet.add(s.supportStage);
    const now=new Map(s.contacts.filter(c=>/Hand|Foot/.test(c.kind)).map(c=>[c.kind,c.point]));
    for(const [name,p]of now)if(contactsLast.has(name))worstDrift=Math.max(worstDrift,dist(contactsLast.get(name),p));
    contactsLast=now;
    for(const side of ['left','right']){const foot=s.joints[side+'Foot'];if(!now.has(side+'Foot')&&phase==='prepare')lift[side]=Math.max(lift[side],188-foot.y);if(now.has(side+'Foot')&&Math.abs(188-foot.y)>.01)badAirContact++;}
    for(const [joint,p]of Object.entries(s.joints))if(p.y-188>worstFloor){worstFloor=p.y-188;floorAt={phase,progress:n/500,joint,point:p};}
    for(const k in expected)worstBone=Math.max(worstBone,Math.abs(s.bones[k]-expected[k]));
   }
   check(`pushups facing ${facing}: moving feet really clear floor`,lift.left>=5&&lift.right>=5,{lift,stages:[...stageSet]});
   check(`pushups facing ${facing}: planted full XY is stable`,worstDrift<.02&&badAirContact===0,{worstDrift,badAirContact});
   check(`pushups facing ${facing}: limbs stay above floor and lengths stable`,worstFloor<.01&&worstBone<.005,{worstFloor,worstBone,floorAt});
   reset();let sipSamples=0,maxSip=0,maxGrip=0,tableSlip=0,releaseBeforeContact=false,previous=null,metricMissing=false,firstSip=null;
   for(const phase of ['prepare','perform','finish'])for(let n=0;n<=400;n++){
    const s=rig.render(input('coffee',phase,n/400,{facing})),c=s.coffee;
    if(!c){metricMissing=true;continue;}
    if(c.sipping){sipSamples++;maxSip=Math.max(maxSip,dist(c.sipRim,c.sipContact));firstSip??={phase,p:n/400};}
    if(c.owner==='hand')maxGrip=Math.max(maxGrip,dist(c.grip,s.joints.rightHand));
    if(c.owner==='table')tableSlip=Math.max(tableSlip,dist(c.cupBottom,c.tableTop));
    if(previous?.owner==='hand'&&c.owner==='table')releaseBeforeContact ||= dist(previous.cupBottom,previous.tableTop)>.5||dist(c.cupBottom,c.tableTop)>.01;
    previous=c;
   }
   check(`coffee facing ${facing}: measured rim reaches face`,!metricMissing&&sipSamples>10&&maxSip*.7<=1,{sipSamples,maxSip,firstSip});
   check(`coffee facing ${facing}: wrist keeps handle and table owns bottom`,!metricMissing&&maxGrip<.01&&tableSlip<.01&&!releaseBeforeContact,{maxGrip,tableSlip,releaseBeforeContact});
  }
  for(const action of ['coffee','pushups','peek'])for(const facing of [1,-1]){
   let startJump=0,motionJump=0,maxEndGap=0,startAt=null,motionAt=null;
   for(const phase of ['prepare','perform','finish'])for(const point of [.12,.3,.5,.7,.9]){
    reset();rig.render(input('idle','perform',0,{facing}));
    for(const prior of ['prepare','perform','finish']){if(prior===phase)break;for(let n=0;n<=80;n++)rig.render(input(action,prior,n/80,{facing}));}
    let previous;for(let n=0;n<=Math.round(point*200);n++)previous=rig.render(input(action,phase,n/200,{facing}));
    for(let n=0;n<=200;n++){const current=rig.render(input(action,'finish',n/200,{facing,interrupted:true})),d=delta(previous,current);if(n===0&&d>startJump){startJump=d;startAt={phase,point};}else if(n>0&&d>motionJump){motionJump=d;motionAt={phase,point,finishProgress:n/200};}previous=current;}
    maxEndGap=Math.max(maxEndGap,delta(previous,rig.render(input('idle','perform',0,{facing}))));
   }
   check(`${action} facing ${facing}: every-stage interruption captures current pose`,startJump<.05&&maxEndGap<.05,{startJump,motionJump,maxEndGap,startAt});
   check(`${action} facing ${facing}: interrupted return has no limb flip`,motionJump<6,{motionJump,motionAt});
  }
  reset();const same=input('coffee','perform',.5);const a=rig.render(same),b=rig.render(same);check('Repeated render at the same time is deterministic',JSON.stringify(a)===JSON.stringify(b));
  rig.destroy();return{checks,temporal};
 });
 await browser.close();fs.writeFileSync(path.join(__dirname,'regression-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:report.checks.filter(c=>c.pass).length,total:report.checks.length,failures:report.checks.filter(c=>!c.pass)}));if(report.checks.some(c=>!c.pass))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
