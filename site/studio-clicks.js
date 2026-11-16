/* Kernjosh Ed/Od click mechanics: paper squash, elastic release, global ink burst. */
(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),pressed=new Map(),releases=new Set(),bursts=new Set();
 const selector='#portfolio-ui .nav-pill,button.desk-object,.process-step h3 button,.process-back';
 const burstSource='/assets/nav-reference/click-burst.png';
 const nodeFor=el=>el.matches('.desk-object')?el.querySelector('.desk-cutout'):el;
 const clamp=value=>Math.max(0,Math.min(1,value));
 const elastic=value=>value===0?0:value===1?1:1+1.3*Math.pow(2,-10*value)*Math.sin((value-.3/(2*Math.PI)*Math.asin(1/1.3))*2*Math.PI/.3);
 new Image().src=burstSource;
 addEventListener('pointerdown',event=>{
  const button=event.target.closest?.(selector);if(!button||button.closest('[inert]')||event.button!==0||reduced.matches)return;
  const node=nodeFor(button);if(!node)return;
  pressed.get(event.pointerId)?.animation.cancel();
  for(const item of releases)if(item.node===node){item.animation.cancel();releases.delete(item);}
  const desk=button.matches('.desk-object');
  const animation=node.animate([{scale:'1'},{scale:desk?'.98':'1.08 .90'}],{duration:140,fill:'forwards',easing:'cubic-bezier(.55,.055,.675,.19)'});
  pressed.set(event.pointerId,{node,animation,desk});
 },{passive:true});
 const release=event=>{
  const item=pressed.get(event.pointerId);if(!item)return;pressed.delete(event.pointerId);
  const current=getComputedStyle(item.node).scale.split(' ').map(Number);item.animation.cancel();
  if(reduced.matches)return;
  const x=Number.isFinite(current[0])?current[0]:1,y=current[1]??x;
  const frames=[];
  for(let i=0;i<=12;i++){
   const p=i/12,ease=1-(1-p)**3;
   frames.push({scale:`${x+((item.desk?.99:.96)-x)*ease} ${y+((item.desk?1.01:1.04)-y)*ease}`,offset:p*130/580});
  }
  for(let i=1;i<=45;i++){
   const p=i/45,ease=elastic(p),amount=item.desk?.01:.04;
   frames.push({scale:`${1-amount+amount*ease} ${1+amount-amount*ease}`,offset:(130+p*450)/580});
  }
  const animation=item.node.animate(frames,{duration:580,easing:'linear'}),active={node:item.node,animation};
  releases.add(active);animation.finished.catch(()=>{}).finally(()=>releases.delete(active));
 };
 addEventListener('pointerup',release,{passive:true});addEventListener('pointercancel',release,{passive:true});
 document.addEventListener('click',event=>{
  if(reduced.matches||event.detail===0||document.body.dataset.entry==='loading'||event.target.closest?.('input,textarea,select,[inert],[data-kuli-shot]'))return;
  const burst=document.createElement('img');burst.className='studio-click-burst';burst.alt='';burst.setAttribute('aria-hidden','true');burst.src=burstSource;
  burst.style.left=event.clientX+'px';burst.style.top=event.clientY+'px';
  const angle=-25+Math.random()*50,scale=.3+Math.random()*.125,frames=[];
  // Od(): 220ms back.out(1.6) expansion, fading from 180 to 280ms.
  for(let i=0;i<=28;i++){
   const ms=i*10,p=clamp(ms/220),q=p-1,ease=1+2.6*q*q*q+1.6*q*q;
   const fade=clamp((ms-180)/100);
   frames.push({scale:String(Math.max(0,ease*scale)),rotate:angle+'deg',opacity:.8*(1-fade**3),offset:i/28});
  }
  document.body.append(burst);
  const animation=burst.animate(frames,{duration:280,easing:'linear'}),active={node:burst,animation};bursts.add(active);
  animation.finished.catch(()=>{}).finally(()=>{burst.remove();bursts.delete(active)});
 },{capture:true,passive:true});
 const stop=()=>{for(const item of [...pressed.values(),...releases,...bursts])item.animation.cancel();pressed.clear();releases.clear();for(const item of bursts)item.node.remove();bursts.clear()};
 addEventListener('blur',stop);reduced.addEventListener('change',()=>{if(reduced.matches)stop()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
