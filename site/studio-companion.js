/* A world-anchored pencil character; explicit dragging never pans the camera. */
(() => {
 'use strict';
 const W=120,H=200,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const COPY={
  en:{name:'Move the little character. Drag, or click and choose a spot. Arrow keys also move it.',hint:'Drag me',place:'Choose a spot · Esc to cancel',moved:'Character moved.',cancelled:'Move cancelled.'},
  ro:{name:'Mută omulețul. Trage sau apasă și alege un loc. Îl poți muta și cu săgețile.',hint:'Mută-mă',place:'Alege un loc · Esc pentru anulare',moved:'Omulețul a fost mutat.',cancelled:'Mutarea a fost anulată.'},
  ru:{name:'Передвинуть человечка. Перетащите или нажмите и выберите место. Также можно двигать стрелками.',hint:'Передвинь меня',place:'Выбери место · Esc — отмена',moved:'Человечек перемещён.',cancelled:'Перемещение отменено.'}
 };
 const copy=()=>COPY[window.portfolioI18n?.locale]||COPY.en;
 const button=document.createElement('button');button.id='work-companion';button.type='button';button.tabIndex=-1;
 button.setAttribute('aria-describedby','companion-instructions');button.setAttribute('aria-pressed','false');
 const head='<path d="M57 24c-10-1-16 7-15 17s8 16 16 14c10-2 15-12 11-21-2-6-7-10-12-10Z M44 29l6-8 10-4"/><path class="pencil-light" d="M49 29c-6 6-7 15-2 21"/>';
 const body='<path d="M53 56c-3 18-7 35-5 55l12 17 11-19-9-53 M50 111l19-1"/><path class="pencil-light" d="M55 60l-4 45 10 20"/>';
 button.innerHTML=`<svg class="companion-drawing" viewBox="0 0 120 200" aria-hidden="true"><g class="companion-facing">
 <g class="companion-pose pose-think">${head}${body}<path d="M50 67 35 89l-9 28 8 4 14-32 M65 65l20 20 15-20-6-8-14 18-14-14 M95 58l-16-11 M56 128l-8 26-12 29-7 4 14 1 M65 128l9 26 11 29 9 4-13 1"/><g class="thought-stroke"><path d="m84 31 5-6m5 11 9-2m-10-14 3-8"/></g></g>
 <g class="companion-pose pose-walk">${head}${body}<g class="walk-arm-a"><path d="M51 65 35 87 31 111"/></g><g class="walk-arm-b"><path d="M64 64 81 87 91 105"/></g><g class="walk-leg-a"><path d="M57 126 47 156 42 184l-10 4 15 1"/></g><g class="walk-leg-b"><path d="M64 126 73 155 81 184l12 4-16 1"/></g></g>
 <g class="companion-pose pose-lift"><g class="lift-body">${head}<path d="M52 55 47 95l8 28 13-25-7-42 M49 66 29 88l-4 21 M63 65l22 21 6 21 M55 124l-11 31 5 23-7 6 13-2 M62 124l10 27-4 24 9 8-14-6"/></g></g>
 <g class="companion-pose pose-note">${head}${body}<path d="M54 127 44 157 37 185l-9 3 15 1 M64 127l10 29 10 28 11 4-15 1 M51 68l-14 25 32 13 M65 67l14 18"/><path d="m70 86 28-5 9 34-30 6-7-35Z M75 92l17-3m-15 9 18-3m-16 10 14-2"/><g class="note-hand"><path d="m65 71 17 24 12 1m-6 6 12-19"/></g></g>
 <g class="companion-pose pose-peek"><g class="peek-upper">${head}${body}<path d="M51 67 35 84l-6 30 M65 63l19 13 9-17-7-5-8 13 M84 55l-10-7"/></g><path d="M56 128 46 155l-8 29-9 4 15 1 M65 128l10 25 10 32 10 3-15 1"/></g>
 </g><path class="pencil-ground" d="M22 193q40-4 78-1 M37 197l47-1"/></svg><span class="companion-hint" aria-hidden="true"></span>`;
 const help=document.createElement('div');help.id='companion-instructions';help.className='companion-sr';
 const live=document.createElement('div');live.id='companion-status';live.className='companion-sr';live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');
 document.body.append(button,help,live);
 let mode='hidden',action='idle',pose='think',world={x:0,y:0},worldSize=0,initialized=false,current=null,travel=null,drag=null,selected=false,selectionOrigin=null,frame=0,until=0,actionTimer=0,clearLive=0,latestKey=null,latestMaterial=-1,awaitingProject=false,wasDetail=false,ignoreClickUntil=0,placementPointer=null,placedClick=null;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const scene=()=>document.body.dataset.entry;
 const geometry=()=>window.portfolioWorkGeometry?.();
 // Choose a readable initial size once, then let the same board transform
 // scale it freely. A minimum screen-size clamp makes a world object float.
 const scaleWork=()=>{const g=geometry(),unit=g?.unitScale||.3;if(!worldSize){const runtime=window.portfolioRuntime,base=(runtime?.workOverviewCamera?.zoom||.3)*(runtime?.fitScale||1);worldSize=clamp(base*1.9,.58,1.05)/base}return unit*worldSize;};
 function copySync(){button.setAttribute('aria-label',copy().name);help.textContent=copy().name;button.querySelector('.companion-hint').textContent=selected?copy().place:copy().hint;}
 window.portfolioI18n?.subscribe(copySync);copySync();
 function announce(message){clearTimeout(clearLive);live.textContent=message;clearLive=setTimeout(()=>{live.textContent=''},1500)}
 function setPose(next){pose=next;button.dataset.pose=next;}
 function setAction(next){action=next;button.dataset.action=next;}
 function cancelAction(){clearTimeout(actionTimer);actionTimer=0;travel=null;}
 function rest(){setAction('idle');setPose(mode==='detail'?'peek':'think');}
 function react(next='note',duration=1450){cancelAction();setAction('react');setPose(next);actionTimer=setTimeout(()=>{actionTimer=0;if(!drag&&!selected)rest()},reduced.matches?0:duration);}
 function viewport(){const safe=window.portfolioSafeArea;return{left:12,right:innerWidth-12,top:Math.max(12,safe?.top||0)+8,bottom:Math.min(innerHeight-18,safe?.bottom||innerHeight-18)}}
 function bound(point,scale,v=viewport()){const hw=W*scale/2,hh=H*scale/2;return{x:clamp(point.x,v.left+hw,Math.max(v.left+hw,v.right-hw)),y:clamp(point.y,v.top+hh,Math.max(v.top+hh,v.bottom-hh)),scale};}
 function rectangle(p,pad=0){return{left:p.x-W*p.scale/2-pad,right:p.x+W*p.scale/2+pad,top:p.y-H*p.scale/2-pad,bottom:p.y+H*p.scale/2+pad};}
 const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 function clearSpot(point,scale=scaleWork()){
  const g=geometry(),blocked=(g?.projects||[]).map(p=>p.bounds).filter(Boolean),base=bound(point,scale);
  const free=p=>!blocked.some(box=>overlap(rectangle(p,12),box));
  if(free(base))return base;
  for(const radius of [28,56,96,144,208,300,420,600])for(let i=0;i<16;i++){
   const a=i*Math.PI/8,p=bound({x:base.x+Math.cos(a)*radius,y:base.y+Math.sin(a)*radius},scale);if(free(p))return p;
  }
  return bound({x:g?.x??innerWidth/2,y:g?.y??innerHeight/2},scale);
 }
 function projected(point=world){const g=geometry();if(!g)return null;return{x:g.x+point.x*g.unitScale,y:g.y+point.y*g.unitScale,scale:scaleWork()};}
 function toWorld(point){const g=geometry();return g?.unitScale?{x:(point.x-g.x)/g.unitScale,y:(point.y-g.y)/g.unitScale}:null;}
 function saveWorld(point){const g=geometry();if(!g?.unitScale)return;world={x:(point.x-g.x)/g.unitScale,y:(point.y-g.y)/g.unitScale};}
 function render(point){if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;current={...point};button.style.transform=`translate3d(${(point.x-W*point.scale/2).toFixed(2)}px,${(point.y-H*point.scale/2).toFixed(2)}px,0) scale(${point.scale.toFixed(4)})`;button.style.setProperty('--companion-line',(1/point.scale).toFixed(2));button.dataset.visible='true';}
 function draw(now){
  if(mode==='hidden'||document.hidden)return;
  if(travel){
   const following=travel.follow==='work'?projected():travel.follow==='detail'?detailSpot():null;if(following)travel.to={...following};
   const p=reduced.matches?1:clamp((now-travel.started)/travel.duration,0,1),e=1-(1-p)**3,to=travel.to;
   const from=travel.fromWorld?projected(travel.fromWorld):travel.from;
   render({x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,scale:from.scale+(to.scale-from.scale)*e});
   if(p>=1){const done=travel.done;travel=null;done?.();}
  }else if(mode==='work'&&!drag)render(projected());
  else if(mode==='detail'&&!awaitingProject){const target=detailSpot();if(target)render(target);}
 }
 function tick(now){
  frame=0;draw(now);
  if(mode!=='hidden'&&!document.hidden&&(travel||drag||now<until))frame=requestAnimationFrame(tick);
 }
 function wake(ms=1000){if(mode==='hidden'||document.hidden)return;until=performance.now()+ms;if(!frame)frame=requestAnimationFrame(tick)}
 function walkTo(target,done=rest,duration=820){cancelAction();const from=current||target;button.style.setProperty('--companion-face',target.x<from.x?-1:1);setAction('walking');setPose('walk');travel={from:{...from},fromWorld:mode==='work'?toWorld(from):null,to:{...target},started:performance.now(),duration:reduced.matches?0:duration,done,follow:mode==='detail'?'detail':'work'};wake(Math.max(duration+100,mode==='detail'?1200:0));}
 function select(value){selected=value;button.dataset.selected=String(value);button.setAttribute('aria-pressed',String(value));copySync();if(value){selectionOrigin={...world};cancelAction();setAction('selected');setPose('lift')}else{selectionOrigin=null;rest()}}
 function releaseCapture(){if(!drag)return;const id=drag.id;drag=null;try{if(button.hasPointerCapture(id))button.releasePointerCapture(id)}catch{}}
 function cancelMove(restore=true){if(drag)ignoreClickUntil=performance.now()+500;if(restore&&drag?.origin)world={...drag.origin};else if(restore&&selected&&selectionOrigin)world={...selectionOrigin};releaseCapture();select(false);button.style.removeProperty('--companion-sway');if(mode==='work')render(projected());}
 function land(){render(projected());setAction('landing');setPose('think');actionTimer=setTimeout(rest,reduced.matches?0:430)}
 function place(point,animated=true){const target=clearSpot(point),relocated=Math.hypot(target.x-point.x,target.y-point.y)>8;saveWorld(target);select(false);button.style.removeProperty('--companion-sway');if(animated||relocated)walkTo(target,land,560);else land();announce(copy().moved);}
 function detailSpot(){
  const front=geometry()?.front;if(!front)return null;
  const v={...viewport(),left:4,right:innerWidth-4},preferred=innerWidth<600?.48:.66,gap=innerWidth<600?4:8;
  const controls=['previous-material','next-material'].map(id=>document.getElementById(id)).filter(n=>n&&n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden').map(n=>n.getBoundingClientRect());
  const free=point=>!controls.some(box=>overlap(rectangle(point,4),box));
  for(const scale of [preferred,.42,.32,.24]){
   const width=W*scale,height=H*scale;
   for(const side of ['right','left']){
    if(side==='right'?front.right+width+gap>v.right:front.left-width-gap<v.left)continue;
    const x=side==='right'?front.right+width/2+gap:front.left-width/2-gap;
    for(const y of [front.bottom-height/2,front.top+height/2]){const point={...bound({x,y},scale,v),side};if(free(point))return point;}
   }
   if(front.top-height-12>=v.top){const point={...bound({x:front.right-width/2,y:front.top-height/2-8},scale,v),side:'above'};if(free(point))return point;}
  }
  return null;
 }
 function arriveProject(){
  if(mode!=='detail'||window.portfolioRuntime?.moving)return;
  const target=detailSpot();if(!target)return;
  awaitingProject=false;
  const start=target.side==='left'?{...target,x:-W*target.scale/2}:{...target,x:innerWidth+W*target.scale/2};
  render(start);button.style.setProperty('--companion-face',target.side==='left'?1:-1);
  walkTo(target,()=>{button.style.setProperty('--companion-face',target.side==='left'?1:-1);react('note')});
 }
 function sync(){
  const next=!document.hidden&&['work','detail'].includes(scene())?scene():'hidden';
  if(next===mode){if(next==='work'&&!travel&&!drag)render(projected());return;}
  const previous=mode;cancelAction();cancelMove(true);mode=next;button.dataset.mode=next;
  button.tabIndex=next==='work'?0:-1;button.setAttribute('aria-hidden',String(next!=='work'));button.inert=next!=='work';
  if(next==='hidden'){button.dataset.visible='false';cancelAnimationFrame(frame);frame=0;awaitingProject=false;return;}
  if(next==='detail'){wasDetail=true;button.dataset.visible='false';awaitingProject=true;latestKey=window.portfolioRuntime?.focusedKey;latestMaterial=window.portfolioRuntime?.materialIndex??0;arriveProject();return;}
  const target=projected();if(!target)return;
  if(previous==='detail'||wasDetail){wasDetail=false;if(current)walkTo(target,rest,750);else render(target);}
  else if(!initialized){const safe=clearSpot(target);saveWorld(safe);render(safe);initialized=true;rest();}
  else {render(target);rest();}
  initialized=true;wake(1400);
 }
 function projectState(event){
  sync();const s=event.detail||{};if(mode!=='detail')return;
  if(s.key!==latestKey){latestKey=s.key;latestMaterial=s.materialIndex;awaitingProject=true;cancelAction();button.dataset.visible='false';}
  if(s.moving)return;
  if(awaitingProject){arriveProject();return;}
  if(s.materialIndex!==latestMaterial){latestMaterial=s.materialIndex;const target=detailSpot();if(target)walkTo(target,()=>{button.style.setProperty('--companion-face',target.side==='left'?1:-1);react('note',1250)},530);}
 }
 button.addEventListener('pointerdown',event=>{
  if(mode!=='work'||event.button!==0||!event.isPrimary)return;
  event.stopPropagation();cancelAction();const p=current||projected();if(!p)return;
  drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,offsetX:event.clientX-p.x,offsetY:event.clientY-p.y,origin:{...world},moved:false};
  button.setPointerCapture(event.pointerId);wake();
 });
 button.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();
  if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<4)return;
  drag.moved=true;selected=false;button.dataset.selected='false';button.setAttribute('aria-pressed','false');copySync();setAction('dragging');setPose('lift');
  const target=bound({x:event.clientX-drag.offsetX,y:event.clientY-drag.offsetY},scaleWork());saveWorld(target);render(target);
  button.style.setProperty('--companion-sway',`${clamp((event.clientX-drag.lastX)*.5,-9,9)}deg`);drag.lastX=event.clientX;
 });
 button.addEventListener('pointerup',event=>{if(!drag||drag.id!==event.pointerId)return;event.stopPropagation();const moved=drag.moved;releaseCapture();if(moved){ignoreClickUntil=performance.now()+500;place(current,false)}else rest();});
 button.addEventListener('pointercancel',event=>{if(!drag)return;event.stopPropagation();cancelMove(true)});
 button.addEventListener('lostpointercapture',()=>{if(drag)cancelMove(true)});
 button.addEventListener('click',event=>{event.stopPropagation();if(mode!=='work'||performance.now()<ignoreClickUntil)return;select(!selected);});
 document.addEventListener('pointerdown',event=>{
  if(!selected||mode!=='work'||button.contains(event.target)||event.button!==0)return;
  if(event.target.closest('button,a,input,select,textarea')){select(false);return;}
  event.preventDefault();event.stopImmediatePropagation();placementPointer=event.pointerId;placedClick={x:event.clientX,y:event.clientY,time:performance.now()};place({x:event.clientX,y:event.clientY});
 },true);
 document.addEventListener('pointerup',event=>{if(event.pointerId===placementPointer){event.preventDefault();event.stopImmediatePropagation();placementPointer=null}},true);
 document.addEventListener('click',event=>{if(placedClick&&event.detail>0&&performance.now()-placedClick.time<700&&Math.hypot(event.clientX-placedClick.x,event.clientY-placedClick.y)<18){event.preventDefault();event.stopImmediatePropagation();placedClick=null}},true);
 document.addEventListener('keydown',event=>{
  if(mode!=='work')return;
  if(event.key==='Escape'&&(selected||drag)){event.preventDefault();event.stopImmediatePropagation();cancelMove(true);announce(copy().cancelled);return;}
  if(document.activeElement!==button||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();event.stopImmediatePropagation();const p=current||projected(),step=event.shiftKey?40:16;
  place({x:p.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),y:p.y+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0)},false);
 },true);
 function resize(){cancelMove(true);cancelAction();if(mode==='work')render(projected());else if(mode==='detail'){const target=detailSpot();if(target){render(target);rest()}else button.dataset.visible='false';}wake(50);}
 addEventListener('portfolio:entrystate',sync);addEventListener('portfolio:projectstate',projectState);addEventListener('portfolio:safearea',()=>{if(mode==='detail'&&awaitingProject)arriveProject()});
 // Native post-draw notification uses the camera that was actually rendered.
 // This runs in that same frame, including gesture inertia, with no idle loop.
 addEventListener('portfolio:boardframe',()=>{if(mode!=='hidden'&&!drag)draw(performance.now());});
 addEventListener('resize',resize);addEventListener('blur',()=>{if(drag||selected)cancelMove(true)});
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{if(drag||selected)cancelMove(true);if(travel){const to=travel.to,done=travel.done;travel=null;render(to);done?.()}else if(action==='react'){cancelAction();rest()}wake(50)});
 window.portfolioCompanion=Object.freeze({getState:()=>({active:mode!=='hidden',mode,action,pose,worldPos:{...world},worldSize,dragging:!!drag?.moved,selected,destination:travel?{...travel.to}:null,position:current?{...current}:null,frameScheduled:!!frame,project:latestKey,materialIndex:latestMaterial,awaitingProject}),refresh:sync});
 sync();
})();
