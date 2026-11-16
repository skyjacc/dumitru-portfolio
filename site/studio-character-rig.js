/* Articulated pencil resident. Geometry is pure; the caller owns time, location and lifecycle. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg',W=120,H=200,FLOOR=188;
 const LENGTHS=Object.freeze({torso:50,upperArm:28,forearm:27,thigh:36,shin:38,neck:10});
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
 const ease=t=>(t=clamp(t))*t*(3-2*t),point=(x,y)=>({x,y});
 const lerp=(a,b,t)=>point(mix(a.x,b.x,t),mix(a.y,b.y,t));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),round=n=>Math.round(n*1000)/1000;
 const pstr=p=>`${round(p.x)} ${round(p.y)}`;
 const clone=o=>JSON.parse(JSON.stringify(o));
 const actions=['idle','walk','turn','lift','land','look','wave','nod','surprise','work','game','coffee','pushups','sword','sketch','note','read','stretch','sit','squat','balance','controller','celebrate','pen','plane','crumple','juggle','inspect','measure','peek','fetch','carryFlower'];
 const footprints=Object.fromEntries(actions.map(a=>[a,{left:20,top:12,right:103,bottom:195}]));
 ['work','game','sketch'].forEach(a=>footprints[a]={left:20,top:28,right:150,bottom:195});
 footprints.coffee={left:22,top:12,right:121,bottom:195};
 footprints.measure={left:20,top:12,right:117,bottom:195};
 footprints.sword={left:-15,top:-10,right:193,bottom:195};
 footprints.pushups={left:-40,top:12,right:150,bottom:195};
 footprints.juggle={left:8,top:-24,right:128,bottom:195};
 footprints.stretch={left:5,top:-3,right:120,bottom:195};
 footprints.plane={left:8,top:12,right:185,bottom:195};

 function element(tag,attributes={},parent){
  const e=document.createElementNS(NS,tag);Object.entries(attributes).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e;
 }
 function svg(parent,kind){
  const e=element('svg',{xmlns:NS,viewBox:`0 0 ${W} ${H}`,'aria-hidden':'true',class:`resident-svg resident-${kind}`},parent);
  Object.assign(e.style,{width:'100%',height:'100%',overflow:'visible',display:'block',pointerEvents:'none'});
  return e;
 }
 function stroke(parent,d='',extra={}){
  const e=element('path',{d,fill:'none',stroke:'currentColor','stroke-width':1.35,'stroke-linecap':'round','stroke-linejoin':'round',...extra},parent);
  e.style.pointerEvents='none';return e;
 }
 function ik(root,target,a,b,bend=1){
  const dx=target.x-root.x,dy=target.y-root.y,raw=Math.hypot(dx,dy)||.0001,d=clamp(raw,Math.abs(a-b)+.001,a+b-.001);
  const end=point(root.x+dx*d/raw,root.y+dy*d/raw),ux=dx/raw,uy=dy/raw;
  const along=(a*a-b*b+d*d)/(2*d),off=Math.sqrt(Math.max(0,a*a-along*along))*bend;
  return {middle:point(root.x+ux*along-uy*off,root.y+uy*along+ux*off),end,error:distance(end,target)};
 }
 function neutral(){return {hip:point(59,117),angle:.045,headTilt:.19,headShift:0,
  leftHand:point(31,112),rightHand:point(89,107),leftFoot:point(44,FLOOR),rightFoot:point(76,FLOOR),
  armBends:[1,-1],legBends:[1,-1],prop:null,propHand:'right',propAngle:0,secondary:null,secondaryHand:'left',secondaryAngle:0,particles:[],
  fixture:null,fixtureAmount:1,grip:false,contacts:['leftFoot','rightFoot'],opacity:1};}
 function blend(a,b,t,metadata=b){
  const out={...metadata,armBends:b.armBends,legBends:b.legBends};['hip','leftHand','rightHand','leftFoot','rightFoot'].forEach(k=>out[k]=lerp(a[k],b[k],t));
  ['angle','headTilt','headShift'].forEach(k=>out[k]=mix(a[k],b[k],t));return out;
 }
 function raisedMug(t,variant){
  const p=neutral(),u=ease(t);p.hip.x=56;p.angle=-.025;p.headTilt=mix(.1,.28,u);
  // The handle stays at the wrist. A compact cup reaches the lower-right rim
  // of the head rather than covering its outline or intersecting the neck.
  p.rightHand=lerp(point(95,103),point(90,55),u);p.rightHand.x+=Math.sin(u*Math.PI)*3;
  p.leftHand=point(32,116);p.propAngle=12*u;p.armBends=[1,1];
  p.prop='mug';p.fixture='coffee';return p;
 }
 function seated(kind,time,variant){
  const p=neutral();p.hip=point(47,139);p.angle=.075;p.headTilt=.17;
  p.leftFoot=point(68,FLOOR);p.rightFoot=point(91,FLOOR);p.legBends=[-1,-1];
  p.leftHand=point(83,119);p.rightHand=point(95,120);p.armBends=[1,1];p.fixture='desk';p.contacts=['seat','leftFoot','rightFoot'];
  const rhythm=time/1000,burst=(rhythm%4.5)<2.4;
  if(kind==='work'&&burst){p.leftHand.y+=Math.sin(rhythm*13)*1.2;p.rightHand.y+=Math.sin(rhythm*13+1.4)*1.5;}
  if(kind==='work'&&!burst&&variant%3===1){p.leftHand=point(62,75);p.headTilt=.25;}
  if(kind==='work'&&!burst&&variant%3===2){p.rightHand=point(100,111);p.headTilt=.11;}
  if(kind==='game'){
   const tense=ease(clamp((rhythm%4-1.3)/.8));p.angle=.13+tense*.11;p.headTilt=.2+tense*.09;
   p.leftHand.y+=Math.sin(rhythm*17)*.9;p.rightHand.y+=Math.cos(rhythm*18)*1.3;
   if(rhythm%5>3.9){p.leftHand=point(43,64);p.rightHand=point(87,120);p.headTilt=-.12;p.angle=-.08;}
  }
  return p;
 }
 function swordPose(progress){
  const p=neutral(),cycle=(progress*2)%1;
  const lunge=cycle<.22?0:cycle<.34?ease((cycle-.22)/.12):cycle<.47?1:cycle<.76?1-ease((cycle-.47)/.29):0;
  p.hip=point(mix(55,66,lunge),mix(124,130,lunge));p.angle=mix(.02,.23,lunge);
  p.leftFoot=point(25,FLOOR);p.rightFoot=point(mix(88,110,lunge),FLOOR);p.legBends=[1,-1];
  p.leftHand=point(mix(17,24,lunge),mix(82,91,lunge));p.rightHand=point(mix(96,124,lunge),mix(84,81,lunge));
  p.headTilt=.04;p.prop='sword';p.propAngle=mix(-24,-4,lunge);p.armBends=[-1,1];return p;
 }
 function crouched(amount=1){
  const p=neutral();p.hip=point(58,119+amount*30);p.angle=.12*amount;p.headTilt=.12*amount;
  p.leftFoot=point(35,FLOOR);p.rightFoot=point(84,FLOOR);p.legBends=[1,-1];
  p.leftHand=point(38,107+amount*22);p.rightHand=point(91,105+amount*22);return p;
 }
 function plank(amount){
  const p=neutral();p.angle=mix(1.15,1.35,amount);
  // Prone plank: toes behind the hip, palms below the shoulders, chest facing
  // the floor. The torso and extended back leg share one body axis.
  p.hip=point(-12+Math.sin(p.angle)*73.999,FLOOR-Math.cos(p.angle)*73.999);
  p.headTilt=p.angle+.34;
  p.leftHand=point(106,FLOOR);p.rightHand=point(116,FLOOR);
  p.leftFoot=point(-8,FLOOR);p.rightFoot=point(-12,FLOOR);
  p.armBends=[1,1];p.contacts=['leftHand','rightHand','leftFoot','rightFoot'];return p;
 }
 function pushupEntry(progress){
  const base=neutral(),crouch=crouched(1),plant=neutral(),end=plank(0),t=clamp(progress);
  plant.angle=.82;plant.hip.x=62;
  // The right arm is straight exactly at the bend-side change. This avoids an
  // elbow flipping through the body while both palms stay planted.
  const shoulderX=plant.hip.x+Math.sin(plant.angle)*50;
  plant.hip.y=FLOOR-Math.sqrt(54.999**2-(116-shoulderX)**2)+Math.cos(plant.angle)*50;
  plant.headTilt=.7;plant.leftFoot=point(35,FLOOR);plant.rightFoot=point(84,FLOOR);
  plant.leftHand=point(106,FLOOR);plant.rightHand=point(116,FLOOR);
  plant.contacts=['leftHand','rightHand','leftFoot','rightFoot'];
  if(t<.3)return blend(base,crouch,ease(t/.3));
  if(t<.65)return blend(crouch,plant,ease((t-.3)/.35));
  const step=ease((t-.65)/.35),p=blend(plant,end,step,end);
  // Move the feet back one after another; hands are already supporting weight.
  p.leftFoot=lerp(plant.leftFoot,end.leftFoot,ease(clamp((t-.65)/.2)));
  p.rightFoot=lerp(plant.rightFoot,end.rightFoot,ease(clamp((t-.8)/.2)));
  p.contacts=['leftHand','rightHand'];
  if(t>=.85)p.contacts.push('leftFoot');if(t===1)p.contacts.push('rightFoot');
  return p;
 }
 function writing(action,time,variant){
  const p=action==='sketch'?seated('work',0,0):neutral(),q=time/1000,writing=(q%3.4)<2.2;
  p.headTilt=.24;p.angle=.075;
  if(action==='sketch'){
   p.fixture='sketch';p.leftHand=point(89,120);p.rightHand=point(95+Math.sin(q*5)*(writing?2:0),114+Math.cos(q*8)*(writing?1.5:0));
   p.prop='pencil';p.propAngle=-18;
  } else {
   p.leftHand=point(66,104);p.rightHand=point(77+Math.sin(q*6)*(writing?2:0),98+Math.cos(q*9)*(writing?1.5:0));
   p.prop='pencil';p.propAngle=8;p.secondary=variant===11?'menu':variant===12?'schematic':'notebook';p.armBends=[1,1];
  }
  return p;
 }
 function poseFor(input){
  const action=actions.includes(input.action)?input.action:'idle',phase=input.phase||'perform',p=clamp(Number(input.progress)||0),time=Math.max(0,Number(input.elapsed)||0),v=input.variant|0;
  const active=phase==='prepare'?ease(p):phase==='finish'?1-ease(p):1,base=neutral();let pose=neutral();
  const cycle=Math.sin(time/1000*2.3);
  if(action==='walk'){
   // distance is optional; the controller can supply travelled local units to lock cadence to motion.
   const u=Number.isFinite(input.distance)?input.distance/144:time/1800,leg=t=>{t=((t%1)+1)%1;return t<.5?point(mix(95,23,t*2),FLOOR):point(mix(23,95,(t-.5)*2),FLOOR-Math.sin((t-.5)*2*Math.PI)*12);};
   pose.leftFoot=leg(u);pose.rightFoot=leg(u+.5);pose.hip.y=125+Math.sin(u*Math.PI*2)**2*.8;pose.angle=.07;pose.headTilt=.22;
   pose.leftHand=point(35+Math.sin(u*Math.PI*2)*8,116);pose.rightHand=point(87-Math.sin(u*Math.PI*2)*8,108);pose.legBends=[-1,-1];
   pose.contacts=pose.leftFoot.y===FLOOR?['leftFoot']:['rightFoot'];
  } else if(action==='work'||action==='game')pose=seated(action,phase==='perform'?time:0,v);
  else if(action==='coffee'){
   const t=phase==='perform'?(p<.24?p/.24:p<.44?1:p<.67?mix(1,.2,ease((p-.44)/.23)):.2):phase==='finish'?.2*(1-ease(clamp(p/.68))):0;pose=raisedMug(t,v);
   pose.prop=(phase==='prepare'||phase==='finish'&&p>=.76)?null:'mug';pose.cupOnTable=!pose.prop;
   if(phase==='prepare'){pose=blend(base,pose,active);pose.armFold={from:base,to:raisedMug(0,v),t:active};}
   if(phase==='finish'&&p>.76){const t=ease((p-.76)/.24);pose=blend(pose,base,t,pose);pose.armFold={from:raisedMug(0,v),to:base,t};}
  } else if(action==='sword'){
   pose=swordPose(phase==='perform'?p:0);
   if(phase==='finish'){pose.rightHand=lerp(point(96,84),point(72,60),Math.sin(p*Math.PI));pose.propAngle=mix(-24,-90,Math.sin(p*Math.PI));}
   if(phase==='prepare'&&p<.45||phase==='finish'&&p>.85)pose.prop=null;
  } else if(action==='peek'){
   const reveal=phase==='prepare'?ease(clamp((p-.28)/.72)):phase==='finish'?1-ease(clamp(p/.72)):1;
   pose.hip=point(mix(35,42,reveal),120);pose.angle=mix(-.12,.45,reveal);pose.headTilt=mix(-.12,.25,reveal);
   pose.leftFoot=point(25,FLOOR);pose.rightFoot=point(61,FLOOR);pose.rightHand=point(62,85);pose.leftHand=point(30,117);
   pose.grip=!(phase==='prepare'&&p<.1||phase==='finish'&&p>.92);pose.contacts=['leftFoot','rightFoot','rightHand'];
   if(phase==='perform'&&p>.5&&p<.8)pose.leftHand=point(68+Math.sin(p*40)*4,52);pose.armBends=[1,-1];
  } else if(action==='lift'){
   pose.hip=point(59,111);pose.angle=clamp((input.look?.x||0)*.13,-.13,.13);pose.headTilt=-.12;
   pose.leftHand=point(28,102);pose.rightHand=point(90,102);pose.leftFoot=point(39,176);pose.rightFoot=point(78,173);pose.contacts=[];
  } else if(action==='land'){
   const squash=Math.sin(clamp(p)*Math.PI);pose.hip.y+=squash*16;pose.angle=-squash*.08;pose.leftHand=point(28,108+squash*9);pose.rightHand=point(89,111+squash*8);
  } else if(action==='turn'){pose.hip.x+=Math.sin(p*Math.PI)*3;pose.leftHand=point(36,113);pose.headTilt=-.14+Math.sin(p*Math.PI)*.3;}
  else if(action==='look'||action==='inspect'){pose.angle=.09;pose.headTilt=.17;pose.leftHand=point(33,112);pose.rightHand=action==='inspect'?point(78,78):point(85,116);}
  else if(action==='wave'){pose.rightHand=point(94+Math.sin(p*Math.PI*6)*7,44);pose.armBends=[1,-1];pose.headTilt=.1;}
  else if(action==='nod'){pose.headTilt=-.08+Math.sin(p*Math.PI*2)*.18;}
  else if(action==='surprise'){pose.angle=-.09;pose.leftHand=point(18,87);pose.rightHand=point(99,84);pose.headTilt=-.2;}
  else if(action==='pushups'){
   const repetitions=clamp(Number(input.repeats)||4,3,5),rep=(p*repetitions)%1;
   const down=rep<.62?ease(rep/.62):1-ease((rep-.62)/.38);
   pose=plank(phase==='perform'?down:0);
   if(phase==='prepare')pose=pushupEntry(p);
   if(phase==='finish')pose=pushupEntry(1-p);
  } else if(action==='squat'){
   const n=clamp(Number(input.repeats)||3,2,5),rep=(p*n)%1,amount=rep<.58?ease(rep/.58):1-ease((rep-.58)/.42);
   pose=crouched(phase==='perform'?amount:0);pose.leftHand=point(78,96+amount*21);pose.rightHand=point(98,96+amount*21);
  } else if(action==='stretch'){
   const side=v%3;
   if(side===0){pose.leftHand=point(39,20);pose.rightHand=point(80,19);pose.armBends=[-1,1];pose.headTilt=-.19;}
   else if(side===1){pose.angle=.2;pose.leftHand=point(72,20);pose.rightHand=point(101,32);pose.headTilt=.18;pose.hip.x=56;pose.rightFoot.x=74;}
   else{pose.angle=.55;pose.hip.y=122;pose.leftHand=point(99,114);pose.rightHand=point(102,118);pose.headTilt=.45;pose.leftFoot.x=31;pose.rightFoot.x=83;}
  } else if(action==='balance'){
   pose.hip=point(53,118);pose.angle=-.07;pose.leftFoot=point(47,FLOOR);pose.rightFoot=point(84,148);
   pose.leftHand=point(7,73+cycle*1.5);pose.rightHand=point(103,68-cycle*1.5);pose.headTilt=-.05;pose.contacts=['leftFoot'];
  } else if(action==='sit'){
   pose.hip=point(47,139);pose.angle=-.08;pose.leftFoot=point(70,FLOOR);pose.rightFoot=point(91,FLOOR);pose.legBends=[-1,-1];
   pose.leftHand=point(33,139);pose.rightHand=point(79,128);pose.fixture='seat';pose.contacts=['seat','leftFoot','rightFoot'];
   if(phase==='perform'&&v%2){pose.rightFoot=point(91+Math.sin(time/1100)*6,179-Math.sin(time/1100)*4);pose.contacts=['seat','leftFoot'];}
  } else if(action==='sketch'||action==='note')pose=writing(action,phase==='perform'?time:0,v);
  else if(action==='read'){
   pose.leftHand=point(58,101);pose.rightHand=point(86,97);pose.headTilt=.25;pose.angle=.045;
   pose.prop=v===11?'menu':v===12?'schematic':'book';pose.propAngle=-8;pose.armBends=[1,1];
   if(phase==='perform'&&p>.48&&p<.6)pose.leftHand.x+=Math.sin((p-.48)/.12*Math.PI)*10;
  } else if(action==='controller'){
   pose.hip=point(55,121);pose.angle=.1;pose.leftHand=point(72,104);pose.rightHand=point(88,104);pose.headTilt=.06;
   pose.prop='gamepad';pose.propAngle=phase==='perform'?Math.sin(time/850)*4:0;pose.armBends=[1,1];
   if(phase==='perform'&&p>.72&&p<.83){pose.rightHand=point(88,80);pose.leftHand=point(71,80);pose.headTilt=-.14;}
  } else if(action==='celebrate'){
   const raise=Math.sin(p*Math.PI);pose.hip.y-=raise*1.5;pose.leftHand=point(26,25);pose.rightHand=point(93,24);pose.armBends=[-1,1];pose.headTilt=-.13;pose.leftFoot.x=52;pose.rightFoot.x=68;
  } else if(action==='pen'){
   pose.rightHand=point(88,86);pose.leftHand=point(43,117);pose.headTilt=.13;pose.prop='pencil';pose.propAngle=phase==='perform'?p*720:0;
  } else if(action==='plane'){
   pose.leftHand=point(70,98);pose.rightHand=point(87,94);pose.headTilt=.16;pose.armBends=[1,1];
   pose.prop='paper';pose.propAngle=6;
   if(phase==='perform'){
    if(p<.38){pose.rightHand.x+=Math.sin(p*40)*3;pose.leftHand.y+=Math.sin(p*31)*2;}
    else if(p<.55){pose.prop='plane';pose.rightHand=lerp(point(87,94),point(99,60),ease((p-.38)/.17));}
    else{pose.prop=null;pose.rightHand=point(107,73);const t=clamp((p-.55)/.45);pose.particles=[{kind:'plane',x:mix(106,177,t),y:mix(62,124,t)-Math.sin(t*Math.PI)*25,angle:mix(-14,29,t)}];}
   } else if(phase==='finish')pose.prop=null;
  } else if(action==='crumple'){
   pose.leftHand=point(73,98);pose.rightHand=point(84,97);pose.headTilt=.3;pose.angle=.055;pose.armBends=[1,1];pose.prop='paper';
   if(phase==='perform'){if(p<.5){pose.rightHand.x-=Math.sin(p*37)*2;pose.prop=p<.24?'paper':'crumpled';}else{pose.prop='crumpled';pose.rightHand=lerp(point(84,97),point(85,115),ease((p-.5)*2));}}
   if(phase==='finish'){pose.prop='paper';pose.headTilt=.12;}
  } else if(action==='juggle'){
   pose.leftHand=point(29,98);pose.rightHand=point(91,98);pose.headTilt=-.14;
   const flying=phase==='perform',phaseOffset=p*(Number(input.repeats)||4)*Math.PI*2;
   if(flying){pose.particles=[0,1,2].map(i=>{const t=(phaseOffset+i*Math.PI*2/3)%(Math.PI*2);return{kind:'ball',x:60+Math.cos(t)*31,y:95-Math.max(0,Math.sin(t))*76,angle:0};});pose.leftHand.y+=Math.cos(phaseOffset)*3;pose.rightHand.y-=Math.cos(phaseOffset)*3;}
   else{pose.prop='balls';pose.secondary='balls';}
  } else if(action==='measure'){
   const sweep=phase==='perform'?Math.sin(p*Math.PI*2):0;
   pose.angle=.075;pose.headTilt=.3;pose.rightHand=point(102+sweep*2,100-Math.sin(p*Math.PI)**2*5);
   pose.prop='ruler';pose.propAngle=-5+sweep*4;pose.armBends=[1,1];
   const angle=pose.propAngle*Math.PI/180;
   pose.leftHand=point(pose.rightHand.x-Math.cos(angle)*41,pose.rightHand.y-Math.sin(angle)*41);
   if(phase==='prepare'&&p<.72||phase==='finish'&&p>.68)pose.prop=null;
  } else if(action==='fetch'||action==='carryFlower'){
   pose.angle=.09;pose.headTilt=.13;pose.rightHand=point(86,98);pose.leftHand=point(38,115);pose.prop='flower';
   if(action==='fetch'){if(phase==='prepare')pose.prop=null;else if(phase==='perform'&&p<.4){pose.angle=.32;pose.hip.y=125;pose.rightHand=point(106,121);}}
   if(action==='carryFlower'&&phase==='finish'){
    const bend=p<.68?ease(clamp(p/.6)):1-ease((p-.68)/.32);pose.hip.y=117+bend*43;pose.angle=bend*.78;
    pose.rightHand=lerp(point(86,98),point(105,176),bend);pose.headTilt=bend*.5;pose.flowerOnGround=p>=.65;
    if(p>=.65)pose.prop=null;pose.fixture='flower';
   }
   if(input.traveling){
    const walk=poseFor({...input,action:'walk',phase:'perform',progress:0,traveling:false,held:null});
    pose.hip=walk.hip;pose.angle=walk.angle;pose.leftFoot=walk.leftFoot;pose.rightFoot=walk.rightFoot;pose.legBends=walk.legBends;pose.contacts=walk.contacts;
    pose.leftHand=walk.leftHand;pose.rightHand=pose.prop?point(90,105):walk.rightHand;
   }
  }
  pose.action=action;pose.phase=phase;pose.progress=p;
  if(!['idle','lift','land','coffee','peek','pushups','carryFlower'].includes(action))pose=phase==='finish'?blend(pose,base,1-active,pose):blend(base,pose,active);
  if(action==='carryFlower'&&phase==='prepare')pose=blend(base,pose,active);
  if(action==='inspect'&&input.held==='wrench'){pose.rightHand=point(91,88);pose.propAngle=-18;}
  const lookX=clamp(Number(input.look?.x)||0,-1,1),lookY=clamp(Number(input.look?.y)||0,-1,1);
  if(['idle','look','inspect','sit'].includes(action))pose.headTilt+=lookX*.12+lookY*.08;
  if(input.held){pose.prop=input.held;pose.rightHand=action==='lift'?point(84,91):pose.rightHand;}
  if(phase==='finish'&&p>.94&&!input.held&&!['coffee','peek','fetch'].includes(action)){pose.prop=null;pose.secondary=null;pose.particles=[];}
  return pose;
 }
 function solve(pose){
  const hip=pose.hip,shoulder=point(hip.x+Math.sin(pose.angle)*LENGTHS.torso,hip.y-Math.cos(pose.angle)*LENGTHS.torso);
  const la=ik(shoulder,pose.leftHand,28,27,pose.armBends[0]),ra=ik(shoulder,pose.rightHand,28,27,pose.armBends[1]);
  const ll=ik(hip,pose.leftFoot,36,38,pose.legBends[0]),rl=ik(hip,pose.rightFoot,36,38,pose.legBends[1]);
  if(pose.armFold){
   const {from,to,t,fromJoints}=pose.armFold,a=fromJoints||solve(from),b=solve(to),angle=(r,s)=>Math.atan2(s.y-r.y,s.x-r.x),turn=(u,v)=>u+Math.atan2(Math.sin(v-u),Math.cos(v-u))*t;
   const upper=turn(angle(a.shoulder,a.rightElbow),angle(b.shoulder,b.rightElbow)),lower=turn(angle(a.rightElbow,a.rightHand),angle(b.rightElbow,b.rightHand));
   ra.middle=point(shoulder.x+Math.cos(upper)*28,shoulder.y+Math.sin(upper)*28);
   ra.end=point(ra.middle.x+Math.cos(lower)*27,ra.middle.y+Math.sin(lower)*27);
  }
  const neck=point(shoulder.x+Math.sin(pose.headTilt)*10,shoulder.y-Math.cos(pose.headTilt)*10);
  const head=point(neck.x+pose.headShift+Math.sin(pose.headTilt)*15,neck.y-Math.cos(pose.headTilt)*15);
  return {hip,shoulder,neck,head,leftElbow:la.middle,leftHand:la.end,rightElbow:ra.middle,rightHand:ra.end,
   leftKnee:ll.middle,leftFoot:ll.end,rightKnee:rl.middle,rightFoot:rl.end,
   reachErrors:{leftHand:la.error,rightHand:ra.error,leftFoot:ll.error,rightFoot:rl.error}};
 }
 function limb(a,b,c){
  // A single continuous bowed pencil stroke passes through the unchanged joints.
  const ab=distance(a,b)||1,bc=distance(b,c)||1,ac=distance(a,c)||1;
  const tangent=point((c.x-a.x)/ac,(c.y-a.y)/ac),soft=Math.min(ab,bc)*.17;
  const first=point(mix(a.x,b.x,.45)-(b.y-a.y)/ab*.8,mix(a.y,b.y,.45)+(b.x-a.x)/ab*.8);
  const before=point(b.x-tangent.x*soft,b.y-tangent.y*soft),after=point(b.x+tangent.x*soft,b.y+tangent.y*soft);
  const last=point(mix(b.x,c.x,.56)+(c.y-b.y)/bc*1.1,mix(b.y,c.y,.56)-(c.x-b.x)/bc*1.1);
  return `M${pstr(a)} C${pstr(first)} ${pstr(before)} ${pstr(b)} C${pstr(after)} ${pstr(last)} ${pstr(c)}`;
 }
 const propPaths={
  mug:'M-18-6 Q-12-7-6-6 L-6 7 Q-12 9-18 7 Z M-6-3 C3-5 4 5-6 4',
  sword:'M-7 0H5 M3-7v14 M5-2 61-2 67 0 61 2H5',
  pencil:'M-8 9 12-15 M10-16l3 2 M-8 9l-2 4 4-2',
  notebook:'M-24-26 3-29 6 8-22 11Z M-20-20l17-2m-17 8 19-2m-18 8 13-1',
  gamepad:'M-22-4q2-11 10-8l12 1q8-2 10 7l4 13q0 6-6 3L1 6h-12l-7 6q-7 2-7-4Z M-16-3h8m-4-4v8 M1-4h1m4 4h1',
  paper:'M-17-21 11-18 8 16-20 12Z M-12-13l17 2m-17 7 15 1m-16 6 11 1',
  flower:'M0 12Q-3-2 0-27 M-1 2q-12-10-12-3 7 7 12 6 M0-24q-10-2-7-9-7-8 2-10 1-10 8-3 9-5 10 3 9 7 0 10 0 9-8 5Z',
  ruler:'M-42-3H1V4H-42Z M-36-3v4m6-4v2m6-2v4m6-4v2m6-2v4m6-4v2',
  wrench:'M-2 21 1-9q-10-6-4-16l3 9 7-2 1-9q9 8 2 16L7 22Z',
  menu:'M-20-24 8-22 8 17-20 15Z M-15-17h17m-17 7h10m-10 7h17m-17 7h12',
  schematic:'M-25-22 13-22 13 16-25 16Z M-20-16h14v12h-14Z M0-16h8v26h-8Z M-20 3h14v7h-14Z',
  balls:'M-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0'
  ,ball:'M-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0'
  ,book:'M-30-21Q-20-24-12-19Q-3-24 6-21L5 12Q-4 8-12 13Q-21 8-30 12Z M-12-19v32 M-25-14l8 1m-8 6h8m10-6 7-1m-7 7 7-1'
  ,plane:'M-18 3 20-8 5 10 0 3Z M0 3 20-8 M0 3l1 8 4-1'
  ,crumpled:'M-10-6-3-11 5-8 11-2 7 7-2 11-11 4Z M-10-6-1 1 5-8 M-1 1l8 6M-1 1-2 11'
 };
 function create(host,{fixtureHost}={}){
  if(!host)throw new TypeError('A character host is required.');
  const drawing=svg(host,'figure');drawing.style.color='var(--resident-pencil, #858b91)';
  const facingGroup=element('g',{class:'resident-facing'},drawing),body=element('g',{class:'resident-body'},facingGroup),grip=element('g',{class:'resident-grip'},facingGroup);
  const paths={};['backLeg','backArm','torso','frontLeg','frontArm','neck','head','hands','feet'].forEach(k=>paths[k]=stroke(body));
  const prop=stroke(body),secondary=stroke(body),gripPath=stroke(grip),particles=element('g',{class:'resident-particles'},body);
  const particlePaths=Array.from({length:3},()=>stroke(particles));
  const hits=element('g',{class:'resident-hits'},body),hit=stroke(hits,'',{stroke:'transparent','stroke-width':16,class:'resident-hit','data-resident-hit':'body'});
  hit.style.pointerEvents='stroke';hit.style.touchAction='none';
  const headHit=stroke(hits,'',{stroke:'transparent','stroke-width':14,class:'resident-hit','data-resident-hit':'head'});headHit.style.pointerEvents='stroke';headHit.style.touchAction='none';
  const debug=element('g',{class:'resident-debug'},facingGroup);
  const fixtureSvg=fixtureHost?svg(fixtureHost,'fixtures'):null,fixtures=fixtureSvg?element('g',{class:'resident-fixtures'},fixtureSvg):null;
  if(fixtureSvg){fixtureSvg.style.color='var(--resident-pencil, #858b91)';fixtureSvg.style.opacity='.72';}
  let current=null,fixtureKind=null,fixtureFacing=1,fixtureOwner=null,fixtureState=[],lastInput=null,lastPose=null,lastJoints=null,phaseFrom=null,phaseJoints=null,phaseKey='';
  function clearFixtures(){if(fixtures)fixtures.replaceChildren();fixtureKind=null;fixtureOwner=null;fixtureState=[];}
  function fixture(p,input){
   if(!fixtures||input.action==='lift'||input.action==='land')return;
   if(!p.fixture){
    if(['idle','look','nod','wave'].includes(input.action)&&['coffee','flower'].includes(fixtureKind))return;
    clearFixtures();return;
   }
   if(fixtureKind!==p.fixture){fixtures.replaceChildren();fixtureKind=p.fixture;}
   fixtureOwner=input.token??input.sceneId??fixtureOwner;
   fixtureFacing=input.facing===-1?-1:1;fixtures.setAttribute('transform',fixtureFacing===-1?'translate(120 0) scale(-1 1)':'');
   // Draw a single small furniture outline; no broad invisible pointer target.
   if(!fixtures.firstChild)stroke(fixtures,'',{'data-resident-fixture':p.fixture});
   fixtures.firstChild.removeAttribute('transform');
   let d='';fixtureState=[];
   if(p.fixture==='desk'||p.fixture==='sketch'){
    const lid=input.phase==='prepare'?ease(clamp((input.progress-.35)/.65)):input.phase==='finish'?1-ease(clamp(input.progress/.5)):1;
    d='M28 140Q48 138 70 140 M31 141 26 188 M66 141 72 188 M30 140 29 105 M80 126Q111 124 145 126 M85 126 84 188 M139 126 143 188';
    d+=p.fixture==='sketch'?' M89 122 100 113 134 115 123 124Z M104 116l12 1m-15 3 20 1':` M86 120H123 L${round(123+17*lid)} ${round(120-35*lid)} ${round(102+16*lid)} ${round(120-37*lid)} 97 118 M101 112l20 1`;
    fixtureState=[{kind:'chair',anchor:point(47,139)},{kind:'desk',anchor:point(111,126)},{kind:'laptop',anchor:point(112,120)}];
   } else if(p.fixture==='seat'){
    d='M28 140Q48 138 70 140 M31 141 26 188 M66 141 72 188';fixtureState=[{kind:'seat',anchor:point(47,139)}];
   } else if(p.fixture==='flower'){
    if(p.flowerOnGround){d=propPaths.flower;fixtures.firstChild.setAttribute('transform','translate(105 176)');fixtureState=[{kind:'flower',anchor:point(105,188)}];}
   } else if(p.fixture==='coffee'){
    d='M73 112Q91 109 110 112Q92 115 73 112 M78 114 75 188 M105 114 108 188';fixtureState=[{kind:'table',anchor:point(95,113)}];
    if(p.cupOnTable){d+=' M77 97Q83 96 89 97L89 110Q83 112 77 110Z M89 100C98 98 99 108 89 107';fixtureState.push({kind:'mug',anchor:point(95,103)});}
   }
   fixtures.firstChild.setAttribute('d',d);
  }
  function render(input={}){
   const key=`${input.token??input.sceneId??''}:${input.action}:${input.phase}`;
   if(key!==phaseKey){phaseFrom=lastPose?clone(lastPose):null;phaseJoints=lastJoints?clone(lastJoints):null;phaseKey=key;}
   let p=poseFor(input);
   // Interrupted activities leave their actual current pose rather than teleporting to a canned exit.
   if(input.interrupted&&input.phase==='finish'&&phaseFrom&&input.action==='pushups'){
    const progress=clamp(input.progress);
    if(phaseFrom.phase==='prepare')p=pushupEntry((phaseFrom.progress||0)*(1-ease(progress)));
    else if(phaseFrom.phase==='finish')p=pushupEntry((1-(phaseFrom.progress||0))*(1-ease(progress)));
    else if(progress<.2)p=blend(phaseFrom,plank(0),ease(progress/.2));
    else p=pushupEntry(1-ease((progress-.2)/.8));
    p.action='pushups';p.phase='finish';p.progress=progress;
   } else if(input.interrupted&&input.phase==='finish'&&phaseFrom&&input.action==='coffee'){
    const progress=clamp(input.progress),table=raisedMug(0,input.variant|0),base=neutral();
    if(phaseFrom.prop==='mug'){
     if(progress<.76){p=blend(phaseFrom,table,ease(progress/.76),table);p.propAngle=mix(phaseFrom.propAngle||0,0,ease(progress/.76));p.cupOnTable=false;}
     else {const t=ease((progress-.76)/.24);p=blend(table,base,t,table);p.prop=null;p.cupOnTable=true;p.armFold={from:table,to:base,t};}
    }else{const t=ease(progress);p=blend(phaseFrom,base,t,table);p.prop=null;p.cupOnTable=true;p.armFold={from:{...phaseFrom,armFold:null},fromJoints:phaseJoints,to:base,t};}
    p.action='coffee';p.phase='finish';p.progress=progress;
   } else if(input.interrupted&&input.phase==='finish'&&phaseFrom){
    const t=ease(clamp(input.progress));p=blend(phaseFrom,p,t);
    if(t<.72&&phaseFrom.prop&&!p.prop){p.prop=phaseFrom.prop;p.propHand=phaseFrom.propHand;p.propAngle=phaseFrom.propAngle;}
   }
   lastInput={...input};const j=solve(p),facing=input.facing===-1?-1:1;
   // When a joint changes bend side, step/fold through fixed-length FK arcs instead of flipping its elbow/knee.
   if(phaseFrom&&phaseJoints&&['prepare','finish'].includes(input.phase)&&!['coffee','peek','pushups','carryFlower'].includes(input.action)){
    const t=ease(clamp(input.progress));
    const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),turn=(a,b)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
    for(const [side,index]of [['left',0],['right',1]])for(const [kind,rootName,middleName,endName,lenA,lenB]of [['arm','shoulder',`${side}Elbow`,`${side}Hand`,28,27],['leg','hip',`${side}Knee`,`${side}Foot`,36,38]]){
     if(phaseFrom[`${kind}Bends`][index]===p[`${kind}Bends`][index])continue;
     const a=turn(angle(phaseJoints[rootName],phaseJoints[middleName]),angle(j[rootName],j[middleName]));
     const b=turn(angle(phaseJoints[middleName],phaseJoints[endName]),angle(j[middleName],j[endName]));
     j[middleName]=point(j[rootName].x+Math.cos(a)*lenA,j[rootName].y+Math.sin(a)*lenA);
     j[endName]=point(j[middleName].x+Math.cos(b)*lenB,j[middleName].y+Math.sin(b)*lenB);
    }
   }
   lastPose=clone(p);lastJoints=clone(j);
   facingGroup.setAttribute('transform',facing===-1?'translate(120 0) scale(-1 1)':'');
   paths.backLeg.setAttribute('d',limb(j.hip,j.leftKnee,j.leftFoot));paths.frontLeg.setAttribute('d',limb(j.hip,j.rightKnee,j.rightFoot));
   paths.backArm.setAttribute('d',limb(j.shoulder,j.leftElbow,j.leftHand));paths.frontArm.setAttribute('d',limb(j.shoulder,j.rightElbow,j.rightHand));
   paths.torso.setAttribute('d',`M${pstr(j.shoulder)} C${round(j.shoulder.x+1.7)} ${round(mix(j.shoulder.y,j.hip.y,.28))} ${round(j.hip.x-3.6)} ${round(mix(j.shoulder.y,j.hip.y,.74))} ${pstr(j.hip)}`);
   paths.neck.setAttribute('d',`M${pstr(j.shoulder)} Q${round(j.neck.x-1.2)} ${round((j.shoulder.y+j.neck.y)/2)} ${pstr(j.neck)}`);
   paths.head.setAttribute('d','M-1.7-15.4C-6.8-16.5-10.7-10.2-10.8-3.1C-11.1 3.8-9.8 9.8-5.7 13.5C-3.7 15.2-.7 15.7 2 14.9C7.6 13.2 10.7 5.9 10.2-.9C10.9-6.3 8.4-12.9 4-14.7C1.7-15.7-.4-15-1.7-15.4Z');
   paths.head.setAttribute('transform',`translate(${pstr(j.head)}) rotate(${round(p.headTilt*180/Math.PI)})`);
   paths.hands.setAttribute('d',`M${pstr(j.leftHand)}q-1.4 1.7-2.1 3 M${pstr(j.rightHand)}q1.2 1.6 2.5 2.2`);
   paths.feet.setAttribute('d',`M${pstr(j.leftFoot)}q-2.8 1.5-5 1.9 M${pstr(j.rightFoot)}q2.9 1.9 5.7 2.2`);
   hit.setAttribute('d',`${paths.torso.getAttribute('d')} ${paths.backLeg.getAttribute('d')} ${paths.frontLeg.getAttribute('d')} ${paths.backArm.getAttribute('d')} ${paths.frontArm.getAttribute('d')}`);
   headHit.setAttribute('d',paths.head.getAttribute('d'));headHit.setAttribute('transform',paths.head.getAttribute('transform'));
   const hand=j[p.propHand==='left'?'leftHand':'rightHand'];prop.setAttribute('d',propPaths[p.prop]||'');prop.setAttribute('transform',`translate(${pstr(hand)}) rotate(${round(p.propAngle||0)})`);
   secondary.setAttribute('d',propPaths[p.secondary]||'');secondary.setAttribute('transform',`translate(${pstr(j[p.secondaryHand==='right'?'rightHand':'leftHand'])}) rotate(${round(p.secondaryAngle||0)})`);
   particlePaths.forEach((path,i)=>{const q=p.particles[i];path.setAttribute('d',q?propPaths[q.kind]||'':'');path.setAttribute('transform',q?`translate(${q.x} ${q.y}) rotate(${q.angle||0})`:'');});
   gripPath.setAttribute('d',p.grip?`M${pstr(j.rightHand)}l-3-2v9q5 3 8-2`: '');
   fixture(p,input);
   const reflected=pt=>point(facing===-1?W-pt.x:pt.x,pt.y),joints=Object.fromEntries(Object.entries(j).filter(([k])=>k!=='reachErrors').map(([k,v])=>[k,reflected(v)]));
   const pairs={torso:['hip','shoulder'],leftUpperArm:['shoulder','leftElbow'],leftForearm:['leftElbow','leftHand'],rightUpperArm:['shoulder','rightElbow'],rightForearm:['rightElbow','rightHand'],leftThigh:['hip','leftKnee'],leftShin:['leftKnee','leftFoot'],rightThigh:['hip','rightKnee'],rightShin:['rightKnee','rightFoot']};
   const bones=Object.fromEntries(Object.entries(pairs).map(([k,[a,b]])=>[k,round(distance(j[a],j[b]))]));
   const contacts=(p.contacts||[]).filter(k=>input.phase==='perform'||input.action==='idle'||k!=='seat'&&(!k.endsWith('Foot')||Math.abs(j[k].y-FLOOR)<.1)).map(k=>({kind:k,point:k==='seat'?joints.hip:joints[k],error:k==='seat'?distance(j.hip,point(47,139)):k.endsWith('Foot')?Math.abs(j[k].y-FLOOR):input.action==='pushups'?Math.abs(j[k].y-FLOOR):distance(j.rightHand,point(62,85))}));
   const xs=Object.values(joints).map(q=>q.x),ys=Object.values(joints).map(q=>q.y);
   current={action:p.action,phase:p.phase,owner:input.token??input.sceneId??null,facing,joints,bones,contacts,reachErrors:j.reachErrors,head:joints.head,
    bounds:{left:Math.min(...xs)-12,right:Math.max(...xs)+12,top:Math.min(...ys)-16,bottom:Math.max(...ys)+3},
    handProp:p.prop?{kind:p.prop,hand:p.propHand||'right',anchor:reflected(hand)}:null,
    secondaryProp:p.secondary?{kind:p.secondary,hand:p.secondaryHand,anchor:reflected(j[p.secondaryHand==='right'?'rightHand':'leftHand'])}:null,
    airborneProps:p.particles.map(q=>({...q,x:facing===-1?W-q.x:q.x})),
    fixtures:fixtureState.map(s=>({...s,owner:fixtureOwner,anchor:point(fixtureFacing===-1?W-s.anchor.x:s.anchor.x,s.anchor.y)}))};
   debug.replaceChildren();if(input.debug){Object.entries(j).filter(([k])=>k!=='reachErrors').forEach(([k,v])=>element('circle',{cx:v.x,cy:v.y,r:k==='hip'?2:1.7,fill:'#b1d5bd',stroke:'none'},debug));current.contacts.forEach(c=>stroke(debug,`M${pstr(facing===-1?point(W-c.point.x,c.point.y):c.point)}h6`,{stroke:'#e7b772','stroke-width':2}));}
   return current;
  }
  render({action:'idle',phase:'perform',progress:0});
  return {render,getState:()=>clone(current),metrics:()=>clone(current),clearFixtures,svg:drawing,bodyElement:body,gripElement:grip,
   destroy(){drawing.remove();fixtureSvg?.remove();current=null;},get input(){return lastInput;}};
 }
 window.StudioCharacterRig={width:W,height:H,actions,footprints,lengths:LENGTHS,create};
})();
