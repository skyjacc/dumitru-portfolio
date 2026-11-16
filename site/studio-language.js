/* Motion's rolling-label pattern: whole text, one baseline, no glyph fragments. */
(()=>{
 const I=window.portfolioI18n;if(!I)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const motion=import('/vendor/motion-mini-14.14.0.mjs').catch(()=>null);
 const selector=['#studio-title','[data-copy]','[data-entry-copy]','[data-studio-back-label]','#studio-process-title','.process-step-title','[data-about-copy]','#return-control>span','#work-overview p'].join(',');
 let version=0,controls=[],records=[],timer=0,sceneVersion=0;
 function clear(){
  clearTimeout(timer);for(const control of controls)control.cancel();controls=[];
  for(const {el,semantic,window:frame} of records){if(frame.parentNode===el&&semantic.parentNode===el)el.replaceChildren(...semantic.childNodes);el.classList.remove('locale-rolling');}
  records=[];
 }
 function cancel(){sceneVersion++;clear();}
 function roots(){return [...document.querySelectorAll(selector)].filter(el=>{
  if(el.closest('[hidden],[inert]')||el.parentElement?.closest(selector))return false;
  if(el.checkVisibility&&!el.checkVisibility({opacityProperty:true,visibilityProperty:true}))return false;
  const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
 });}
 const content=el=>el.id==='studio-title'?el.firstElementChild:el;
 function play(before,animate){
  if(reduced.matches||document.hidden||window.portfolioEntry?.pending)return;
  const batches=roots().flatMap(root=>{const old=before.get(root),el=content(root);return old&&el&&old.text!==el.textContent&&el.textContent.length<=120?[{el,old}]:[];}).slice(0,18);
  for(const [index,{el,old}] of batches.entries()){
   const semantic=document.createElement('span');semantic.className='locale-semantic';
   const frame=document.createElement('span');frame.className='locale-roll-window';frame.setAttribute('aria-hidden','true');frame.inert=true;
   const outgoing=document.createElement('span'),incoming=document.createElement('span');outgoing.className='locale-roll-copy locale-roll-out';incoming.className='locale-roll-copy locale-roll-in';
   outgoing.append(...old.nodes.map(n=>n.cloneNode(true)));incoming.append(...[...el.childNodes].map(n=>n.cloneNode(true)));
   semantic.append(...el.childNodes);frame.append(outgoing,incoming);el.append(semantic,frame);el.classList.add('locale-rolling');records.push({el,semantic,window:frame});
   const delay=Math.min(.075,index*.012),duration=.38,ease=[.22,1,.36,1];
   controls.push(animate(outgoing,{transform:['translateY(0%)','translateY(-110%)'],opacity:[1,0]},{duration,delay,ease}));
   controls.push(animate(incoming,{transform:['translateY(110%)','translateY(0%)'],opacity:[0,1]},{duration,delay,ease}));
  }
  if(records.length)timer=setTimeout(clear,490);
 }
 const original=I.setLocale.bind(I);
 I.setLocale=async next=>{
  const ticket=++version;clear();const previous=I.locale,scene=sceneVersion;
  const before=new Map(roots().map(root=>{const el=content(root);return [root,{text:el?.textContent,nodes:el?[...el.childNodes].map(n=>n.cloneNode(true)):[]}]}));
  await original(next);if(ticket!==version||I.locale===previous)return;
  const engine=await motion;if(ticket!==version||scene!==sceneVersion||!engine)return;play(before,engine.animate);
 };
 for(const event of ['resize','portfolio:entrystate','blur'])addEventListener(event,cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});reduced.addEventListener('change',cancel);
 document.addEventListener('wheel',cancel,{capture:true,passive:true});document.addEventListener('touchmove',cancel,{capture:true,passive:true});
 window.portfolioLanguageMotion=Object.freeze({getState:()=>({active:records.length>0,roots:records.length,glyphs:0,hidden:0,engine:'Motion mini 14.14.0'}),cancel});
})();
