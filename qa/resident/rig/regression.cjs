const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage();
 await page.setContent('<div id="furniture"></div><div id="figure"></div>');await page.addScriptTag({path:path.join(root,'site/studio-character-rig.js')});
 const result=await page.evaluate(()=>{
  const rig=StudioCharacterRig.create(document.querySelector('#figure'),{fixtureHost:document.querySelector('#furniture')}),tests=[];
  const check=(name,condition,detail=null)=>tests.push({name,passed:!!condition,detail});
  const render=(action,phase,progress,extra={})=>rig.render({action,phase,progress,elapsed:progress*6000,facing:1,variant:0,...extra});
  let failures=[],unreachable=[];
  for(const action of StudioCharacterRig.actions)for(let variant=0;variant<3;variant++)for(let n=0;n<=20;n++){
   const s=render(action,'perform',n/20,{variant});
   if(s.contacts.some(c=>c.error>.1))failures.push({action,variant,n,contacts:s.contacts});
   if(Object.values(s.reachErrors).some(e=>e>.01))unreachable.push({action,variant,n,reach:s.reachErrors});
  }
  check('Ground and seat contacts across every action/three variants',!failures.length,failures);
  check('Every authored perform target lies within fixed limb reach',!unreachable.length,unreachable);
  render('coffee','prepare',1);let s=rig.metrics();check('Coffee starts on its table',!s.handProp&&s.fixtures.some(f=>f.kind==='mug'));
  render('coffee','perform',0);s=rig.metrics();check('Coffee pickup wrist reaches exact previous handle',s.handProp?.kind==='mug'&&Math.hypot(s.handProp.anchor.x-95,s.handProp.anchor.y-103)<.001);
  render('coffee','perform',.6);const cup=rig.metrics().handProp,fixtureBefore=document.querySelector('#furniture').innerHTML;
  render('lift','perform',0,{held:cup.kind});s=rig.metrics();check('Lift keeps mug on wrist',s.handProp.kind==='mug'&&s.handProp.anchor.x===s.joints.rightHand.x&&s.handProp.anchor.y===s.joints.rightHand.y);
  check('Lift leaves independent furniture unchanged',fixtureBefore===document.querySelector('#furniture').innerHTML);
  render('land','perform',.5,{held:'mug'});check('Landing keeps held prop and furniture',rig.metrics().handProp.kind==='mug'&&fixtureBefore===document.querySelector('#furniture').innerHTML);
  render('coffee','finish',.759);const beforePut=rig.metrics().handProp;render('coffee','finish',.76);const afterPut=rig.metrics();
  check('Cup released at table contact, not in air',beforePut&&Math.hypot(beforePut.anchor.x-95,beforePut.anchor.y-103)<.001&&!afterPut.handProp&&afterPut.fixtures.some(f=>f.kind==='mug'));
  render('coffee','finish',1);render('idle','perform',0);check('Placed cup persists during quiet idle',rig.metrics().fixtures.some(f=>f.kind==='mug'));
  rig.clearFixtures();check('Explicit cleanup is idempotent',!document.querySelector('#furniture').querySelector('path'));rig.clearFixtures();
  render('fetch','finish',1);check('Fetch hands flower to following scene',rig.metrics().handProp?.kind==='flower');
  render('carryFlower','prepare',0);check('Carry starts with acquired flower',rig.metrics().handProp?.kind==='flower');
  render('carryFlower','finish',.64);const flowerBefore=rig.metrics().handProp;render('carryFlower','finish',.65);s=rig.metrics();
  check('Flower placement releases only at grounded stem',flowerBefore&&Math.abs(flowerBefore.anchor.y+12-188)<.1&&!s.handProp&&s.fixtures.some(f=>f.kind==='flower'));
  render('idle','perform',0);check('Placed flower remains in idle',rig.metrics().fixtures.some(f=>f.kind==='flower'));
  render('peek','perform',.2);const right=rig.metrics();render('peek','perform',.2,{facing:-1});const left=rig.metrics();
  check('Facing mirrors exact hand edge and head',Math.abs(right.joints.rightHand.x+left.joints.rightHand.x-120)<.001&&Math.abs(right.head.x+left.head.x-120)<.001);
  render('pushups','perform',.1);const push=rig.metrics();render('pushups','perform',.2);s=rig.metrics();
  check('Pushup hands/toes fixed while body lowers', ['leftHand','rightHand','leftFoot','rightFoot'].every(k=>Math.hypot(push.joints[k].x-s.joints[k].x,push.joints[k].y-s.joints[k].y)<.001)&&Math.abs(push.joints.hip.y-s.joints.hip.y)>1);
  render('work','perform',.7);const source=rig.metrics();render('work','finish',0,{interrupted:true});s=rig.metrics();
  check('Interrupted exit begins from current body pose',Math.hypot(source.joints.hip.x-s.joints.hip.x,source.joints.hip.y-s.joints.hip.y)<.001);
  const deterministic=JSON.stringify(render('sword','perform',.3));check('Repeated render at same time does not advance',deterministic===JSON.stringify(render('sword','perform',.3)));
  check('Only stroke-based hit regions, no rect',document.querySelectorAll('.resident-hit').length===2&&!document.querySelector('.resident-hits rect'));
  const hitStroke=getComputedStyle(document.querySelector('.resident-hit')).pointerEvents;check('Hit regions explicitly opt into stroke events',hitStroke==='stroke');
  rig.destroy();check('Destroy removes both owned SVGs',!document.querySelector('svg'));
  return tests;
 });
 fs.writeFileSync(path.join(__dirname,'regression.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify(result,null,2));assert.equal(result.filter(x=>!x.passed).length,0,'Rig regressions failed');
})();
