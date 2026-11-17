/* C5–C7: execute production geometry; DOM stub only stores SVG attributes. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
class Element {
 constructor(){this.style={};this.children=[];this.attributes={};}
 setAttribute(k,v){this.attributes[k]=String(v);} getAttribute(k){return this.attributes[k];} removeAttribute(k){delete this.attributes[k];}
 append(e){this.children.push(e);e.parent=this;} replaceChildren(...xs){this.children=[];xs.forEach(e=>this.append(e));}
 get firstChild(){return this.children[0];} get lastChild(){return this.children.at(-1);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(e=>e!==this);}
}
function factory(source){const ctx={window:{},document:{createElementNS:()=>new Element()},console};vm.runInNewContext(source,ctx);return()=>ctx.window.StudioCharacterRig.create(new Element(),{fixtureHost:new Element()});}
const current=factory(fs.readFileSync(path.join(root,'site/studio-character-rig.js'),'utf8'));
const baselineRef=process.env.CHARACTER_BASELINE||'cc6e2db';
const baseline=factory(execFileSync('git',['show',`${baselineRef}:site/studio-character-rig.js`],{cwd:root,encoding:'utf8'}));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),delta=(a,b)=>Math.max(...Object.keys(a.joints).map(k=>dist(a.joints[k],b.joints[k])));
const input=(action,phase,progress,extra={})=>({action,phase,progress,elapsed:progress*(phase==='perform'?7000:1000),variant:0,repeats:4,token:1,...extra});
const expected={torso:50,leftUpperArm:28,leftForearm:27,rightUpperArm:28,rightForearm:27,leftThigh:36,leftShin:38,rightThigh:36,rightShin:38};
const checks=[],check=(name,pass,data)=>checks.push({name,pass:!!pass,data});
function reproduce(create){
 let rig=create(),last=rig.metrics(),stretch=0;
 for(let n=0;n<=1000;n++){const s=rig.render(input('stretch','prepare',n/1000));stretch=Math.max(stretch,delta(last,s));last=s;}rig.destroy();
 const edges={};for(const [action,variant]of [['sit',1],['carryFlower',0],['balance',0],['juggle',0]]){
  rig=create();last=rig.metrics();edges[action]=[];
  for(const phase of ['prepare','perform','finish']){const first=rig.render(input(action,phase,0,{variant}));edges[action].push({phase,delta:delta(last,first)});for(let n=1;n<=1000;n++)last=rig.render(input(action,phase,n/1000,{variant}));}
  edges[action].push({phase:'idle',delta:delta(last,rig.render(input('idle','perform',0)))});rig.destroy();
 }return {stretch,edges};
}
const before=reproduce(baseline),after=reproduce(current);
check('C5 baseline reproduces >49-unit snap; fixed dense trajectory stays below 1 unit',before.stretch>49&&after.stretch<1,{before:before.stretch,after:after.stretch});
for(const action of ['sit','carryFlower','balance','juggle'])check(`${action} all phase edges meet within 0.01 units`,after.edges[action].every(e=>e.delta<.01),{before:before.edges[action],after:after.edges[action]});
for(const action of ['stretch','sit','carryFlower'])for(const variant of [0,1,2]){
 const rig=current();let last=rig.metrics(),maxStep=0,maxBone=0,joins=[];
 for(const phase of ['prepare','perform','finish'])for(let n=0;n<=1000;n++){
  const s=rig.render(input(action,phase,n/1000,{variant}));if(n===0)joins.push(delta(last,s));else maxStep=Math.max(maxStep,delta(last,s));
  for(const k in expected)maxBone=Math.max(maxBone,Math.abs(s.bones[k]-expected[k]));last=s;
 }
 check(`${action} variant ${variant}: dense trajectory and joins`,maxStep<1&&Math.max(...joins)<.01&&maxBone<.005,{maxStep,joins,maxBone});rig.destroy();
}
for(const action of ['stretch','sit','carryFlower'])for(const facing of [1,-1])for(const fps of [30,60]){
 const rig=current();let last=rig.render(input('idle','perform',0,{facing})),maxFrame=0,maxBone=0,joins=[];
 for(const phase of ['prepare','perform','finish']){
  const duration=phase==='perform'?7000:1000,nmax=Math.round(duration/1000*fps);
  for(let n=0;n<=nmax;n++){
   const s=rig.render(input(action,phase,n/nmax,{variant:action==='sit'?1:0,facing}));
   if(!n)joins.push(delta(last,s));else maxFrame=Math.max(maxFrame,delta(last,s));
   for(const k in expected)maxBone=Math.max(maxBone,Math.abs(s.bones[k]-expected[k]));last=s;
  }
 }
 joins.push(delta(last,rig.render(input('idle','perform',0,{facing}))));
 check(`${action}, facing ${facing}, ${fps}fps: bounded speed, stable bones, continuous joins`,maxFrame*fps<900&&maxBone<.005&&Math.max(...joins)<.01,{maxFrame,maxSpeed:maxFrame*fps,maxBone,joins});rig.destroy();
}
// Epsilon convergence around the former branch boundary, lifted-foot entry and prop release/return.
for(const [action,phase,boundary]of [['stretch','prepare',.5805],['sit','perform',0],['carryFlower','finish',0],['carryFlower','finish',.6],['carryFlower','finish',.65],['carryFlower','finish',.68],['carryFlower','finish',1]]){
 const samples=[.001,.00001,.0000001].map(epsilon=>{
  const rig=current(),variant=action==='sit'?1:0;let last=rig.metrics();
  for(const prior of ['prepare','perform','finish']){if(prior===phase)break;for(let n=0;n<=100;n++)last=rig.render(input(action,prior,n/100,{variant}));}
  let a=last;if(boundary>0)a=rig.render(input(action,phase,Math.max(0,boundary-epsilon),{variant}));
  const b=boundary===1?rig.render(input('idle','perform',0)):rig.render(input(action,phase,boundary+epsilon,{variant}));
  const d=delta(a,b);rig.destroy();return {epsilon,delta:d};
 });check(`${action}/${phase}/${boundary}: epsilon continuity`,samples[2].delta<.001&&samples[2].delta<samples[0].delta*.02+.00001,samples);
}
for(const action of ['stretch','sit','carryFlower'])for(const facing of [1,-1]){
 let startJump=0,endJump=0,maxStep=0;
 for(const fromPhase of ['prepare','perform','finish'])for(const at of [.12,.3,.5,.7,.9]){
  const rig=current(),variant=action==='sit'?1:0;let last=rig.render(input('idle','perform',0,{facing}));
  for(const phase of ['prepare','perform','finish']){
   const end=phase===fromPhase?at:1;for(let n=0;n<=Math.round(end*200);n++)last=rig.render(input(action,phase,n/200,{variant,facing}));if(phase===fromPhase)break;
  }
  for(let n=0;n<=200;n++){const s=rig.render(input(action,'finish',n/200,{variant,facing,interrupted:true}));if(!n)startJump=Math.max(startJump,delta(last,s));else maxStep=Math.max(maxStep,delta(last,s));last=s;}
  endJump=Math.max(endJump,delta(last,rig.render(input('idle','perform',0,{facing}))));rig.destroy();
 }
 check(`${action}, facing ${facing}: all-stage interruption captured, neutral return`,startJump<.01&&endJump<.01&&maxStep<6,{startJump,endJump,maxStep});
}
for(const facing of [1,-1]){
 const rig=current();let previous=null,releaseGap=0,fixtureDrift=0,grounded=false,fixtureAt=null;
 for(const phase of ['prepare','perform','finish'])for(let n=0;n<=1000;n++){
  const s=rig.render(input('carryFlower',phase,n/1000,{facing}));const flower=s.fixtures.find(f=>f.kind==='flower');
  if(flower){grounded=true;fixtureAt??=flower.anchor;fixtureDrift=Math.max(fixtureDrift,dist(fixtureAt,flower.anchor));if(previous?.handProp?.kind==='flower')releaseGap=Math.max(releaseGap,dist(previous.handProp.anchor,{x:flower.anchor.x,y:flower.anchor.y-12}));}
  previous=s;
 }
 const idle=rig.render(input('idle','perform',0,{facing}));
 check(`flower facing ${facing}: release touches floor and planted fixture survives idle`,grounded&&releaseGap<.01&&fixtureDrift===0&&idle.fixtures.some(f=>f.kind==='flower'),{releaseGap,fixtureDrift,fixtureAt});rig.destroy();
}
const report={baselineCommit:execFileSync('git',['rev-parse',baselineRef],{cwd:root,encoding:'utf8'}).trim(),before,after,checks};
fs.writeFileSync(path.join(__dirname,'continuity-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass),before,after}));if(checks.some(c=>!c.pass))process.exitCode=1;
