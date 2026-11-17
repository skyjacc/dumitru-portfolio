/* Articulated resident in Work/Detail only. Home keeps its original walker. */
(() => {
 'use strict';
 if(!window.StudioCharacterRig||!window.StudioCharacterLife)return;
 const W=120,reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
 const on=(n,e,f,o={})=>n.addEventListener(e,f,{...o,signal:events.signal});
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),clone=o=>o?JSON.parse(JSON.stringify(o)):null;
 const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 const COPY={en:{name:'Studio character. Select and choose a place, drag, or use arrow keys. Escape cancels.',moved:'Character moved.',cancel:'Move cancelled.'},ro:{name:'Omulețul atelierului. Selectează și alege un loc, trage sau folosește săgețile. Escape anulează.',moved:'Omulețul a fost mutat.',cancel:'Mutarea a fost anulată.'},ru:{name:'Человечек мастерской. Выберите и укажите место, перетащите или двигайте стрелками. Escape — отмена.',moved:'Человечек перемещён.',cancel:'Перемещение отменено.'}};
 const copy=()=>COPY[window.portfolioI18n?.locale]||COPY.en;
 const button=document.createElement('button');button.id='work-companion';button.type='button';button.tabIndex=-1;button.setAttribute('aria-describedby','companion-instructions');button.setAttribute('aria-pressed','false');
 const fixtures=document.createElement('div');fixtures.id='companion-fixtures';fixtures.setAttribute('aria-hidden','true');
 const help=document.createElement('div');help.id='companion-instructions';help.className='companion-sr';
 const live=document.createElement('div');live.id='companion-status';live.className='companion-sr';live.setAttribute('aria-live','polite');
 document.body.append(fixtures,button,help,live);
 const rig=StudioCharacterRig.create(button,{fixtureHost:fixtures});
 let mode='hidden',anchor=null,current=null,baseCurrent=null,world={x:0,y:0},worldSize=0,boardVisited=false,ready=false;
 let travel=null,localMotion=null,frame=0,drag=null,selected=false,selectionOrigin=null,fixtureAnchor=null,fixtureOwner=null,held=null;
 let lastPose={action:'idle',phase:'perform',progress:0,elapsed:0,variant:0},facing=1,look={x:0,y:0},hiddenReason='loading',paused=false,externalPause=false;
 let latestKey=null,latestMaterial=-1,lastBusy=false,ignoreClickUntil=0,placementPointer=null,placedClick=null,liveTimer=0,resizeTimer=0,cameraTimer=0;
 let navigationIntent=null,compositionMoving=false,sceneTarget=null,debug=false,debugReduced=false,randomSeed=null;
 let detailTimer=0,detailSignature='';
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 let gazePointer=null,gazeTarget={x:0,y:0},gazeTime=0,gazeRelease=null,gazeSettleTimer=0;
 // The removed public pause control no longer persists a preference. Debug pause is session-only.
 const geometry=()=>window.portfolioWorkGeometry?.(),runtime=()=>window.portfolioRuntime,effectiveReduced=()=>reduced.matches||debugReduced;
 const nativeMoving=()=>['work','detail'].includes(mode)&&!!runtime()?.moving;
 const ownsScene=()=>['work','detail'].includes(mode);
 const interactive=()=>ready&&ownsScene()&&!hiddenReason&&!cardBlocked()&&mode!=='detail';
 const busy=()=>!ready||!!window.portfolioEntry?.pending||nativeMoving()||compositionMoving||!!navigationIntent||!!travel&&!travel.signal;
 const canLook=()=>ready&&ownsScene()&&current&&!hiddenReason&&!cardBlocked()&&!document.hidden&&finePointer.matches&&!effectiveReduced()&&!paused&&!externalPause&&!drag&&!selected&&!travel&&!localMotion&&!busy()&&['idle','look','inspect'].includes(lastPose.action);
 // Authored gestures can start immediately while the previous gaze eases out.
 // Pause freezes the last drawn gaze rather than snapping the head to neutral.
 const canAdvanceLook=()=>ready&&ownsScene()&&current&&!hiddenReason&&!cardBlocked()&&!document.hidden&&finePointer.matches&&!effectiveReduced()&&!paused&&!externalPause&&!drag;
 const lookMoving=()=>Math.hypot(gazeTarget.x-look.x,gazeTarget.y-look.y)>.001;
 function resetLook(){gazePointer=null;gazeTarget={x:0,y:0};look={x:0,y:0};gazeTime=0;gazeRelease=null;clearTimeout(gazeSettleTimer);gazeSettleTimer=0;}
 function updateLookTarget(){
  if(paused||externalPause)return;
  if(!canLook()){gazeTarget={x:0,y:0};return;}
  if(!gazePointer){gazeTarget={x:0,y:0};return;}
  const h=rig.metrics()?.head||{x:60,y:42},s=current.scale;
  const x=current.x+(h.x-60)*s,y=current.y+(h.y-100)*s;
  // Screen direction is converted once into the figure's facing coordinates.
  gazeTarget={x:clamp((gazePointer.x-x)/420,-.8,.8)*facing,y:clamp((gazePointer.y-y)/340,-.55,.55)};
 }
 function advanceLook(now){
  updateLookTarget();
  if(!canAdvanceLook()){gazeTime=0;return false;}
  if(!lookMoving()){gazeTime=0;return false;}
  const dt=gazeTime?Math.min(40,now-gazeTime):16;gazeTime=now;
  if(!canLook()){
   gazeRelease??={from:{...look},elapsed:0};gazeRelease.elapsed+=dt;
   const p=clamp(gazeRelease.elapsed/200,0,1),e=p*p*p*(p*(p*6-15)+10);
   look={x:gazeRelease.from.x*(1-e),y:gazeRelease.from.y*(1-e)};
  }else{
   gazeRelease=null;const alpha=1-Math.exp(-dt/105);
   look={x:look.x+(gazeTarget.x-look.x)*alpha,y:look.y+(gazeTarget.y-look.y)*alpha};
  }
  if(!lookMoving()){look={...gazeTarget};gazeTime=0;gazeRelease=null;}return true;
 }
 function refreshLook(){gazeTime=0;updateLookTarget();if(canAdvanceLook()&&lookMoving())wake();else if(!travel&&!localMotion){cancelAnimationFrame(frame);frame=0;}}
 function context(){return{mode,project:latestKey,materialIndex:latestMaterial,reduced:effectiveReduced(),visible:ready&&!document.hidden&&ownsScene(),paused:paused||externalPause||selected,dragging:!!drag||!!localMotion,inputBusy:busy()};}
 function random(){if(randomSeed===null)return Math.random();randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;}
 function localize(){button.setAttribute('aria-label',copy().name);help.textContent=copy().name;}
 function announce(text){clearTimeout(liveTimer);live.textContent=text;liveTimer=setTimeout(()=>{live.textContent=''},1400)}
 function worldScale(){const g=geometry(),unit=g?.unitScale||.3;if(!worldSize){const base=(runtime()?.workOverviewCamera?.zoom||.3)*(runtime()?.fitScale||1);worldSize=clamp(base*1.9,.58,.85)/base}return unit*worldSize;}
 function screenRect(selector){const n=typeof selector==='string'?document.querySelector(selector):selector;if(!n||!n.getClientRects().length||n.hidden)return null;const c=getComputedStyle(n);if(c.visibility==='hidden'||c.display==='none')return null;const r=n.getBoundingClientRect();return r.width&&r.height?r:null;}
 function viewport(){const s=window.portfolioSafeArea;return{left:10,right:innerWidth-10,top:Math.max(75,s?.top||0)+8,bottom:['work','detail'].includes(mode)?Math.min(innerHeight-16,s?.bottom||innerHeight-16):innerHeight-16};}
 function boxAt(p,id='idle',pad=5){let b=StudioCharacterRig.footprints[id]||StudioCharacterRig.footprints.idle;if(facing===-1)b={...b,left:W-b.right,right:W-b.left};return{left:p.x+(b.left-60)*p.scale-pad,right:p.x+(b.right-60)*p.scale+pad,top:p.y+(b.top-100)*p.scale-pad,bottom:p.y+(b.bottom-100)*p.scale+pad};}
 function protectedRects(cards=true){
  const selectors=['#portfolio-ui .studio-nav','#material-dots','#previous-material','#next-material','#visit-control'];
  if(mode==='about')selectors.push('.desk-phone');if(mode==='process')selectors.push('.process-paper-content');
  const boxes=selectors.map(screenRect).filter(Boolean),g=geometry();
  if(cards&&mode==='work')boxes.push(...(g?.projects||[]).map(p=>p.bounds).filter(Boolean));
  if(cards&&mode==='detail'&&g?.front)boxes.push(g.front,{left:g.front.left,right:g.front.right,top:g.front.bottom+8,bottom:viewport().bottom});
  return boxes;
 }
 function free(p,id='idle',ignoreCard=false,obstacles=protectedRects(!ignoreCard),v=viewport()){const b=boxAt(p,id);return b.left>=v.left&&b.right<=v.right&&b.top>=v.top&&b.bottom<=v.bottom&&!obstacles.some(q=>overlap(b,q));}
 function toWorld(p){const g=geometry();return g?.unitScale?{x:(p.x-g.x)/g.unitScale,y:(p.y-g.y)/g.unitScale}:null;}
 function worldAnchor(p){const w=toWorld(p);return w?{kind:'world',...w}:null;}
 function pointOf(a){
  if(!a)return null;if(a.kind==='world'){const g=geometry();return g?{x:g.x+a.x*g.unitScale,y:g.y+a.y*g.unitScale,scale:worldScale()}:null;}
  if(a.kind==='project'){const r=mode==='detail'?geometry()?.front:geometry()?.projects?.find(p=>p.key===a.key)?.bounds;if(!r||a.key!==latestKey&&mode==='detail')return null;return{x:(a.side==='left'?r.left:r.right)+a.dx*a.scale,y:r.top+(r.bottom-r.top)*a.v+a.dy*a.scale,scale:a.scale};}
  if(a.kind==='object'){const r=screenRect(`[data-desk-object="${a.id}"]`);return r?{x:r.left+r.width*a.u+a.dx,y:r.top+r.height*a.v+a.dy,scale:a.scale}:null;}
  if(a.kind==='viewport-edge')return{x:a.side==='left'?a.dx:innerWidth-a.dx,y:a.y,scale:a.scale};
  return{x:a.x,y:a.y,scale:a.scale};
 }
 function setAnchor(a){anchor=clone(a);if(mode==='work'&&a?.kind==='world')world={x:a.x,y:a.y};}
 const anchorFor=p=>mode==='work'?worldAnchor(p):{kind:'screen',...p};
 function chooseSpot(activity={id:'idle'}){
  if(!ownsScene())return null;
  const id=activity.id||activity.action||'idle',g=geometry(),v=viewport(),preferred=mode==='work'?worldScale():innerWidth<600?.48:.66;
  if(activity.space==='current')return current?{anchor:clone(anchor),point:{...current},action:id}:null;
  const obstacles=protectedRects(),controls=protectedRects(false),allowed=(p,action='idle',ignoreCard=false)=>free(p,action,ignoreCard,ignoreCard?controls:obstacles,v);
  const edge=['peek','fetch'].includes(id);
  if(mode==='detail'&&g?.front||mode==='work'&&['inspect','measure','peek'].includes(id)){
   const near=mode==='work'?[...(g?.projects||[])].filter(p=>p.bounds).sort((a,b)=>Math.hypot(a.x-innerWidth/2,a.y-innerHeight/2)-Math.hypot(b.x-innerWidth/2,b.y-innerHeight/2))[0]:null;
   const r=mode==='detail'?g.front:near?.bounds,key=mode==='detail'?latestKey:near?.key;
   if(r)for(const scale of [preferred,.48,.38,.28])for(const side of ['right','left'])for(const height of (edge?[.85,.35,.7]:[.7,.35,.85])){
    const dx=edge?0:(side==='right'?45:-45),p={x:(side==='right'?r.right:r.left)+dx*scale,y:r.top+(r.bottom-r.top)*height+12*scale,scale};
    const a={kind:'project',key,side,dx,v:height,dy:12,scale};
    if(edge){const outside={...p,x:p.x+(side==='right'?32:-32)*scale};if(!allowed(outside,'idle',true))continue;}else if(!allowed(p,id))continue;
    return{anchor:mode==='work'?worldAnchor(p):a,point:p,action:id,facing:side==='right'?1:-1,occluder:edge?{kind:'project',key,side}:null};
   }
  }
  if(id==='peek'){
   for(const side of ['right','left']){const p={x:side==='right'?innerWidth:0,y:clamp(current?.y||v.bottom-90,v.top+65,v.bottom-85),scale:preferred},visible={...p,x:p.x+(side==='right'?-40:40)*p.scale};if(allowed(visible,'idle',true))return{anchor:{kind:'viewport-edge',side,dx:0,y:p.y,scale:p.scale},point:p,action:id,facing:side==='right'?-1:1,occluder:{kind:'viewport',side}};}return null;
  }
  const candidates=[];if(current)candidates.push({...current,scale:preferred});if(mode==='work'&&g)candidates.push({x:g.x,y:g.y,scale:preferred});
  for(const scale of [preferred,Math.min(preferred,.48),Math.min(preferred,.36)]){if(['sword','pushups','plane','juggle'].includes(id)&&scale<.42)continue;for(const yy of [.65,.85,.4,.2])for(const xx of [.5,.25,.75,.1,.9])candidates.push({x:v.left+(v.right-v.left)*xx,y:v.top+(v.bottom-v.top)*yy,scale});}
  for(const p of candidates)if(allowed(p,id))return{anchor:anchorFor(p),point:p,action:id,facing:1};return null;
 }
 function transform(node,p){node.style.transform=`translate3d(${(p.x-60*p.scale).toFixed(3)}px,${(p.y-100*p.scale).toFixed(3)}px,0) scale(${p.scale.toFixed(5)})`;node.style.setProperty('--resident-line',String(1.05/Math.max(.15,p.scale)));}
 function clearMask(){rig.bodyElement.style.clipPath='';button.dataset.occluded='false';}
 function cardBlocked(){
  // Phone and Process animate independently of the board. Wait for their final
  // geometry before revealing the resident; a paused pose cannot track that flight.
  if(['about','process'].includes(navigationIntent)||['about','process'].includes(mode)&&(window.portfolioEntry?.pending||compositionMoving))return true;
  const card=mode==='detail'?geometry()?.front:mode==='about'?screenRect('.desk-phone'):mode==='process'?screenRect('.process-paper-content'):null;
  return!!(card&&current&&!sceneTarget?.occluder&&overlap(boxAt(current,lastPose.action),card));
 }
 function paintMask(){
  const o=sceneTarget?.occluder;if(!current||!o||!['peek','fetch','carryFlower'].includes(lastPose.action)){clearMask();return;}if(o.kind==='viewport'){clearMask();return;}
  const r=mode==='detail'?geometry()?.front:geometry()?.projects?.find(p=>p.key===o.key)?.bounds;if(!r)return clearMask();button.dataset.occluded='true';
  const s=current.scale,rawL=(r.left-current.x)/s+60,rawR=(r.right-current.x)/s+60,l=facing===-1?120-rawR:rawL,rr=facing===-1?120-rawL:rawR,t=(r.top-current.y)/s+100,b=(r.bottom-current.y)/s+100,q=Math.max(0,(r.radius||0)/s);
  const hole=`M${l+q} ${t}H${rr-q}Q${rr} ${t} ${rr} ${t+q}V${b-q}Q${rr} ${b} ${rr-q} ${b}H${l+q}Q${l} ${b} ${l} ${b-q}V${t+q}Q${l} ${t} ${l+q} ${t}Z`;
  rig.bodyElement.style.clipPath=`path(evenodd, "M-10000 -10000H10000V10000H-10000Z ${hole}")`;
 }
 function fetchMotion(input){
  if(input.action!=='fetch'||sceneTarget?.occluder?.kind!=='project')return{shift:0,distance:0,traveling:false};
  const p=clamp(input.progress||0,0,1),ease=t=>t*t*(3-2*t);let depth=0,distance=116,traveling=false;
  if(input.phase==='prepare'){depth=58*ease(p);distance=depth;traveling=p<.99;}
  else if(input.phase==='perform'){const back=ease(clamp((p-.38)/.4,0,1));depth=58*(1-back);distance=58+58*back;traveling=p>.38&&p<.78;}
  return{shift:depth*(sceneTarget.occluder.side==='right'?-1:1),distance,traveling};
 }
 function render(p){
  if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
  baseCurrent={x:p.x,y:p.y,scale:p.scale};current={...baseCurrent,x:p.x+fetchMotion(lastPose).shift*p.scale};transform(button,current);
  const blocked=cardBlocked(),visible=ready&&ownsScene()&&!document.hidden&&!hiddenReason&&!blocked;
  button.dataset.blocked=fixtures.dataset.blocked=String(blocked);
  button.dataset.visible=String(visible);button.dataset.mode=mode;button.dataset.interactive=String(interactive());button.tabIndex=interactive()?0:-1;button.setAttribute('aria-hidden',String(!interactive()));
  if(fixtureAnchor){const q=pointOf(fixtureAnchor);if(q){transform(fixtures,q);fixtures.dataset.visible=String(visible)}}else fixtures.dataset.visible='false';paintMask();
 }
 function pose(input){
  lastPose={...input};button.dataset.action=input.action;button.dataset.pose=input.action;
  updateLookTarget();if(canAdvanceLook()&&lookMoving())wake();
  const ownsFixture=!['walk','lift','land','idle','turn','look','nod','wave','surprise'].includes(input.action),owner=input.token??'direct';
  if(ownsFixture&&fixtureOwner!==owner){clearFixtures();fixtureAnchor=clone(anchor);fixtureOwner=owner;}
  if(input.action==='carryFlower')held=null;
  if(input.action==='inspect'&&mode==='detail')input={...input,held:({fkd:'wrench',ora:'schematic',bonanza:'menu'})[latestKey]||input.held};
  const excursion=fetchMotion(input);rig.render({...input,...(input.action==='fetch'?excursion:{}),look,facing,held:held||input.held,debug});render(baseCurrent||pointOf(anchor));
 }
 function clearFixtures(){rig.clearFixtures();fixtureAnchor=null;fixtureOwner=null;fixtures.dataset.visible='false';}
 function release(info){
  if(info.reason==='drag'){held=rig.metrics()?.handProp?.kind||info.held||null;return;}
  if(info.token!=null&&fixtureOwner!=null&&info.token!==fixtureOwner)return;
  if(drag)return;
  if(info.reason==='handoff'){held=rig.metrics()?.handProp?.kind||info.held||null;clearFixtures();sceneTarget=null;clearMask();return;}
  const keep=info.reason==='complete'&&['coffee','carryFlower'].includes(info.scene)&&rig.metrics()?.fixtures?.length;
  if(mode==='work'&&anchor?.kind==='viewport-edge'&&baseCurrent)setAnchor(worldAnchor(baseCurrent));
  if(!keep)clearFixtures();held=null;sceneTarget=null;clearMask();
 }
 function stopTravel(){if(travel){const t=travel;travel=null;t.signal?.removeEventListener('abort',t.cancel);t.resolve(false)}}
 function approach(target,signal){
  stopTravel();if(!ownsScene()||signal?.aborted||!target?.anchor)return Promise.resolve(false);const to=pointOf(target.anchor);if(!to)return Promise.resolve(false);sceneTarget=target;hiddenReason=null;const from=current||to,delta=Math.hypot(to.x-from.x,to.y-from.y),fromAnchor=clone(anchor);if(!held)facing=target.facing??(to.x<from.x?-1:1);
  if(effectiveReduced()||paused||externalPause||delta<3){setAnchor(target.anchor);render(to);pose({action:'idle',phase:'perform',progress:0,elapsed:0});return Promise.resolve(true);}
  return new Promise(resolve=>{const t={from:{...from},fromAnchor,to:target.anchor,start:performance.now(),duration:clamp(delta/140*1000,420,1800),resolve,signal,cancel:null};t.cancel=()=>{if(travel!==t)return;setAnchor(anchorFor(current));travel=null;resolve(false)};signal?.addEventListener('abort',t.cancel,{once:true});travel=t;wake();});
 }
 function tick(now){
  frame=0;if(document.hidden||!ready||!ownsScene())return;
  const gazeChanged=advanceLook(now);
  if(travel){const t=travel,to=pointOf(t.to),from=t.fromAnchor?.kind==='world'?pointOf(t.fromAnchor):t.from;if(!to){stopTravel();return;}const u=clamp((now-t.start)/t.duration,0,1),e=u*u*(3-2*u),p={x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,scale:from.scale+(to.scale-from.scale)*e};render(p);const distance=Math.hypot(to.x-from.x,to.y-from.y)*e/Math.max(.2,p.scale);pose({action:u<.1?'turn':'walk',phase:'perform',progress:u,elapsed:distance/80*1000,distance,variant:0});if(u>=1){travel=null;t.signal?.removeEventListener('abort',t.cancel);setAnchor(t.to);render(to);pose({action:'idle',phase:'perform',progress:0,elapsed:0});t.resolve(true);}}
  if(localMotion){const m=localMotion,p=clamp((now-m.start)/m.duration,0,1);pose({action:m.action,phase:'perform',progress:p,elapsed:now-m.start,variant:0});if(p>=1){localMotion=null;held=null;clearFixtures();pose({action:'idle',phase:'perform',progress:0});if(m.action==='land')life.interact('landed');life.contextChanged();}}
  if(gazeChanged&&!travel&&!localMotion)pose(lastPose);
  if(travel||localMotion||lookMoving()&&canAdvanceLook())wake();
 }
 function wake(){if(!frame&&!document.hidden&&ready&&ownsScene())frame=requestAnimationFrame(tick)}
 const life=StudioCharacterLife.create({getContext:context,chooseSpot,approach,frame:pose,release,getHeld:()=>rig.metrics()?.handProp?.kind||held,random,onError:error=>console.error('Resident scene:',error),relocate:()=>!!current&&(current.x<0||current.x>innerWidth||current.y<0||current.y>innerHeight)});
 function resetInput(){resetLook();const captured=drag?.id;drag=null;if(captured!=null)try{if(button.hasPointerCapture(captured))button.releasePointerCapture(captured)}catch{}localMotion=null;selected=false;placementPointer=null;placedClick=null;button.dataset.selected='false';button.setAttribute('aria-pressed','false');life.interact('drop');}
 // Loading still hands its frames to character-runtime.js. It activates on Home
 // and suspends itself on section changes; it must remain resumable on Back.
 function handoff(){if(ready)return;ready=true;document.body.dataset.resident='ready';life.pause(paused);sync(true);}
 function sync(force=false){
  if(!ready){if(window.portfolioLoader?.getState().phase==='complete')handoff();return;}
  const raw=document.body.dataset.entry,next=['home','work','detail','about','process'].includes(raw)?raw:mode,changed=next!==mode,previous=mode;mode=next;latestKey=runtime()?.focusedKey||null;latestMaterial=runtime()?.materialIndex??0;
  if(!window.portfolioEntry?.pending&&!nativeMoving()&&!compositionMoving)navigationIntent=null;
  if(!ownsScene()){
   stopTravel();resetInput();clearTimeout(detailTimer);clearTimeout(resizeTimer);clearTimeout(cameraTimer);cancelAnimationFrame(frame);frame=0;
   sceneTarget=null;clearMask();clearFixtures();held=null;hiddenReason=mode==='home'?'home-original':'inactive-section';
   button.dataset.visible='false';button.dataset.interactive='false';button.dataset.mode=mode;button.tabIndex=-1;button.setAttribute('aria-hidden','true');
   life.stop(mode==='home'?'home-original':'inactive-section');return;
  }
  if(changed||force){clearTimeout(detailTimer);detailSignature='';stopTravel();resetInput();sceneTarget=null;clearMask();life.contextChanged();clearFixtures();held=null;hiddenReason=mode==='hidden'?'inactive-section':null;
   if(mode==='work'&&!drag){const target=boardVisited?{anchor:{kind:'world',...world}}:chooseSpot({id:'idle'});if(target){boardVisited=true;if(previous==='hidden'||!current){setAnchor(target.anchor);render(pointOf(anchor))}else void approach(target).then(()=>life.contextChanged())}else hiddenReason='no-safe-space';}
   else if(!drag){setAnchor(current?{kind:'screen',...current}:null);if(['about','process','detail'].includes(mode)){const target=chooseSpot({id:'idle'});if(target)void approach(target).then(()=>life.contextChanged());else hiddenReason='no-safe-space';}}
  }
  if(changed||force)life.start();const nowBusy=busy(),becameIdle=lastBusy&&!nowBusy;if(changed||force||nowBusy!==lastBusy){lastBusy=nowBusy;life.contextChanged();}
  if(!nowBusy&&!travel&&!drag&&!localMotion&&['detail','about','process'].includes(mode)&&!sceneTarget?.occluder&&(hiddenReason||current&&!free(current,lastPose.action))){life.interact('geometry');const target=chooseSpot({id:'idle'});if(target){hiddenReason=null;void approach(target).then(()=>life.contextChanged());}else hiddenReason='no-safe-space';}
  if(!travel&&!drag&&!localMotion)render(pointOf(anchor));if(becameIdle)refreshLook();if(document.hidden){button.dataset.visible='false';fixtures.dataset.visible='false';cancelAnimationFrame(frame);frame=0;}
 }
 function cancelDrag(restore=true){if(!drag)return;const d=drag;drag=null;try{if(button.hasPointerCapture(d.id))button.releasePointerCapture(d.id)}catch{}ignoreClickUntil=performance.now()+600;if(restore&&d.mode===mode){setAnchor(d.anchor);render(pointOf(anchor))}else setAnchor(anchorFor(current));held=null;clearFixtures();land();}
 function land(){localMotion={action:'land',start:performance.now(),duration:effectiveReduced()?1:420};wake();announce(copy().moved);}
 function placement(point,animated=true){
  selected=false;button.dataset.selected='false';button.setAttribute('aria-pressed','false');life.interact('grab');stopTravel();localMotion=null;const s=mode==='work'?worldScale():current?.scale||.55,v=viewport();let p={x:clamp(point.x,v.left+30*s,v.right-30*s),y:clamp(point.y,v.top+90*s,v.bottom-95*s),scale:s};
  if(!free(p,'idle')){let found=null;for(const radius of [30,60,100,160,240]){for(let i=0;i<12;i++){const q={...p,x:p.x+Math.cos(i*Math.PI/6)*radius,y:p.y+Math.sin(i*Math.PI/6)*radius};if(free(q,'idle')){found=q;break}}if(found)break}if(found)p=found;else{const fallback=chooseSpot({id:'idle'});if(!fallback){hiddenReason='no-safe-space';life.contextChanged();return;}p=fallback.point;}}
  const target={anchor:anchorFor(p),point:p,action:'idle'};hiddenReason=null;if(animated)void approach(target).then(ok=>{if(ok)land()});else{setAnchor(target.anchor);render(p);land()}
 }
 on(button,'pointerdown',e=>{if(!interactive()||e.button!==0||!e.isPrimary)return;e.stopPropagation();const p=current;if(!p)return;resetLook();held=rig.metrics()?.handProp?.kind||null;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,offsetX:e.clientX-p.x,offsetY:e.clientY-p.y,anchor:clone(anchor),mode,moved:false,scale:p.scale};stopTravel();localMotion=null;life.interact('grab');button.setPointerCapture(e.pointerId);});
 on(button,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<4)return;drag.moved=true;selected=false;button.setAttribute('aria-pressed','false');button.dataset.selected='false';hiddenReason=null;const p={x:e.clientX-drag.offsetX,y:e.clientY-drag.offsetY,scale:drag.scale};setAnchor(anchorFor(p));render(p);pose({action:'lift',phase:'perform',progress:.5,elapsed:0,variant:0,sway:clamp((e.clientX-drag.lastX)*.02,-.15,.15)});drag.lastX=e.clientX;});
 on(button,'pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;e.stopPropagation();const d=drag;drag=null;try{button.releasePointerCapture(e.pointerId)}catch{}if(d.moved){ignoreClickUntil=performance.now()+600;placement(current,false)}else{life.interact('drop');life.contextChanged();}});
 on(button,'pointercancel',e=>{e.stopPropagation();cancelDrag(true)});on(button,'lostpointercapture',()=>{if(drag)cancelDrag(true)});
 on(button,'pointerenter',()=>{if(!drag&&!selected)life.interact('hover')});
 on(document,'pointermove',e=>{if(e.pointerType!=='mouse'||!e.isPrimary||!finePointer.matches)return;gazePointer={x:e.clientX,y:e.clientY};updateLookTarget();if(canLook()&&lookMoving())wake();},{passive:true});
 on(document,'pointerout',e=>{if(!e.relatedTarget){gazePointer=null;if(!paused&&!externalPause)gazeTarget={x:0,y:0};if(canAdvanceLook()&&lookMoving())wake();}},{passive:true});
 on(document,'pointerdown',e=>{if(e.pointerType!=='mouse'&&(gazePointer||look.x||look.y)){resetLook();if(ownsScene()&&current)pose(lastPose);}},{passive:true});
 on(finePointer,'change',()=>{resetLook();if(ownsScene()&&current)pose(lastPose)});
 on(button,'click',e=>{e.stopPropagation();if(!interactive()||performance.now()<ignoreClickUntil)return;selected=!selected;selectionOrigin=clone(anchor);button.dataset.selected=String(selected);button.setAttribute('aria-pressed',String(selected));life.contextChanged();if(selected){stopTravel();localMotion={action:'nod',start:performance.now(),duration:effectiveReduced()?1:650};wake();}else life.interact('tap');});
 on(document,'pointerdown',e=>{if(!selected||!interactive()||button.contains(e.target)||e.button!==0)return;if(e.target.closest('button,a,input,select,textarea')){selected=false;button.dataset.selected='false';button.setAttribute('aria-pressed','false');life.contextChanged();return;}e.preventDefault();e.stopImmediatePropagation();placementPointer=e.pointerId;placedClick={x:e.clientX,y:e.clientY,time:performance.now()};placement({x:e.clientX,y:e.clientY});},{capture:true});
 on(document,'pointerup',e=>{if(e.pointerId===placementPointer){e.preventDefault();e.stopImmediatePropagation();placementPointer=null}},{capture:true});
 on(document,'click',e=>{if(placedClick&&e.detail>0&&performance.now()-placedClick.time<700&&Math.hypot(e.clientX-placedClick.x,e.clientY-placedClick.y)<18){e.preventDefault();e.stopImmediatePropagation();placedClick=null}},{capture:true});
 on(document,'keydown',e=>{
  if(!ready||!ownsScene())return;if(e.key==='Escape'&&(selected||drag)){e.preventDefault();e.stopImmediatePropagation();if(drag)cancelDrag(true);else{selected=false;button.dataset.selected='false';button.setAttribute('aria-pressed','false');if(selectionOrigin)setAnchor(selectionOrigin);life.contextChanged();}announce(copy().cancel);return;}
  if(document.activeElement===button&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&interactive()){e.preventDefault();e.stopImmediatePropagation();const step=e.shiftKey?40:16;placement({x:current.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),y:current.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)},false);return;}
 },{capture:true});
 function resize(){clearTimeout(resizeTimer);if(!ownsScene())return;stopTravel();if(drag)cancelDrag(false);life.interact('geometry');resizeTimer=setTimeout(()=>{if(!ownsScene())return;if(mode==='work'){render(pointOf(anchor));life.contextChanged();return;}const target=chooseSpot({id:'idle'});if(target){hiddenReason=null;void approach(target).then(()=>life.contextChanged())}else{hiddenReason='no-safe-space';button.dataset.visible='false';}},100);}
 on(window,'portfolio:loaderhandoff',handoff);on(window,'portfolio:entryintent',e=>{navigationIntent=e.detail?.target||null;stopTravel();resetInput();life.contextChanged();if(current)render(current);});
 on(window,'portfolio:entrystate',()=>sync());on(window,'portfolio:entrysettled',()=>sync());on(window,'portfolio:projectstate',()=>{sync();life.contextChanged()});
 on(window,'portfolio:compositionmotion',e=>{compositionMoving=!!e.detail?.active;if(compositionMoving){stopTravel();clearFixtures()}sync();if(!compositionMoving&&!drag)resize();});
 on(window,'portfolio:deskready',()=>sync());on(window,'portfolio:boardframe',()=>{
  const before=current&&{...current};
  if(ready&&ownsScene()&&!drag&&!travel&&!localMotion)render(pointOf(anchor));
  // Camera movement changes the projected head even with a stationary pointer.
  // Debounce the finite gaze refresh; do not introduce an idle camera RAF.
  if(gazePointer&&current&&before&&(Math.hypot(current.x-before.x,current.y-before.y)>.1||Math.abs(current.scale-before.scale)>.0001)){
   clearTimeout(gazeSettleTimer);gazeSettleTimer=setTimeout(()=>{gazeSettleTimer=0;refreshLook();},160);
  }
  if(mode!=='detail')return;const r=geometry()?.front;if(!r)return;
  const signature=[latestKey,r.index,r.left,r.top,r.right,r.bottom].map(x=>typeof x==='number'?Math.round(x*10):x).join('|');
  if(signature!==detailSignature){detailSignature=signature;clearTimeout(detailTimer);detailTimer=setTimeout(()=>{if(mode==='detail'&&!document.hidden&&signature===detailSignature)sync();},160);}
 });
 on(window,'portfolio:safearea',()=>{if(ready&&hiddenReason==='no-safe-space')resize()});on(window,'resize',resize);
 on(window,'blur',()=>{if(drag){const original=clone(drag.anchor);resetInput();setAnchor(original);render(pointOf(anchor));}else resetInput();if(ownsScene()&&current)pose(lastPose);life.contextChanged()});
 on(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;[liveTimer,resizeTimer,cameraTimer,detailTimer].forEach(clearTimeout);stopTravel();resetInput();button.dataset.visible='false';fixtures.dataset.visible='false';}else sync(true);life.contextChanged();});
 on(reduced,'change',()=>{stopTravel();resetInput();clearFixtures();pose({action:'idle',phase:'perform',progress:0});life.contextChanged();if(anchor)render(pointOf(anchor));});
 on(document,'click',e=>{if(e.target.closest('#nav-contact'))life.interact('contact')});on(document,'pointerdown',e=>{if(mode==='work'&&!button.contains(e.target))life.interact('camera');else life.interact('activity-return')},{passive:true});
 on(window,'wheel',()=>{if(mode==='work'){clearTimeout(cameraTimer);cameraTimer=setTimeout(()=>life.interact('camera'),150)}else if(mode==='process')life.interact('process')},{passive:true});
 on(window,'pagehide',()=>{life.stop('pagehide');stopTravel();resetInput();[liveTimer,resizeTimer,cameraTimer,detailTimer].forEach(clearTimeout);cancelAnimationFrame(frame);frame=0;});on(window,'pageshow',()=>sync(true));
 window.portfolioI18n?.subscribe(localize);localize();
 window.portfolioCompanion=Object.freeze({getState:()=>({active:ready&&ownsScene()&&!hiddenReason&&!cardBlocked(),mode,action:lastPose.action,pose:lastPose.action,worldPos:{...world},worldSize,position:clone(current),anchor:clone(anchor),dragging:!!drag?.moved,selected,frameScheduled:!!frame,gaze:{look:{...look},target:{...gazeTarget},releasing:!!gazeRelease,following:canLook()},project:latestKey,materialIndex:latestMaterial,hiddenReason:hiddenReason||(cardBlocked()?'material-clearance':null),fixture:fixtureAnchor?{anchor:clone(fixtureAnchor),position:pointOf(fixtureAnchor),owner:fixtureOwner}:null,held,life:life.getState(),rig:rig.metrics(),legacyRetired:window.portfolioCharacter?.getState().retired}),refresh:()=>sync(true),play:(id,options={})=>{selected=false;return ownsScene()&&life.play(id,options)},pause:value=>{paused=!!value;refreshLook();life.pause(paused)},setExternalPause:value=>{externalPause=!!value;refreshLook();life.contextChanged()},setDebug:value=>{debug=!!value;pose(lastPose)},setReduced:value=>{debugReduced=!!value;resetLook();life.contextChanged();if(ownsScene()&&current)pose(lastPose)},seed:value=>{randomSeed=value==null?null:Number(value)>>>0},stop:()=>life.stop('debug'),destroy:()=>{events.abort();resetLook();life.destroy();stopTravel();cancelAnimationFrame(frame);[liveTimer,resizeTimer,cameraTimer,detailTimer].forEach(clearTimeout);rig.destroy();button.remove();fixtures.remove();help.remove();live.remove();}});
 sync();
})();
