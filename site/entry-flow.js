/* Home is an introduction; Work is the existing spatial portfolio. */
(()=>{
 const I=window.portfolioI18n;
 const COPY={
  en:{hello:'Hi, I’m',role:'I make websites.',work:'Work',about:'About',load:'Opening the studio',ready:'Ready to explore',slow:'The workspace is taking a little longer.',continue:'Enter the studio',index:'Selected work',hint:'Drag to explore · Scroll to zoom',back:'Back to the studio',process:'Process',failed:'The interactive space is still loading. You can also open the projects directly.'},
  ro:{hello:'Salut, sunt',role:'Creez site-uri.',work:'Lucrări',about:'Despre',load:'Se deschide studioul',ready:'Totul este pregătit',slow:'Spațiul are nevoie de puțin timp.',continue:'Intră în studio',index:'Lucrări selectate',hint:'Trage pentru a explora · Scroll pentru zoom',back:'Înapoi în studio',process:'Proces',failed:'Spațiul interactiv se încarcă. Poți deschide și proiectele direct.'},
  ru:{hello:'Привет, я',role:'Я создаю сайты.',work:'Работы',about:'Обо мне',load:'Открываю студию',ready:'Можно начинать',slow:'Пространство загружается чуть дольше.',continue:'Войти в студию',index:'Работы',hint:'Перетаскивайте пространство · Колесо меняет масштаб',back:'Назад в студию',process:'Процесс',failed:'Пространство ещё загружается. Можно открыть сами проекты по ссылкам.'}
 };
 COPY.en.clickHere='Click here';COPY.ro.clickHere='Apasă aici';COPY.ru.clickHere='Нажми здесь';
 const copy=()=>COPY[I.locale]||COPY.en;
 const pathIsDetail=/^\/(work|stories)\//.test(location.pathname);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nav=detail=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail}));
 const root=document.createElement('section');root.id='studio-home';root.setAttribute('aria-labelledby','studio-title');
 const deskObjects=[
  {name:'notebook',label:'process',key:'process',group:0},
  {name:'phone',group:0},
  {name:'airpods',group:0},
  {name:'laptop',label:'work',group:1},
  {name:'pack',group:1},
  {name:'pen',group:1},
  {name:'lighter',group:2},
  {name:'receipt',group:2},
  {name:'scissors',group:2}
 ];
 // CSS crops keep the original transparent source files intact.
 const deskCrops={laptop:[1254,1254,71,17,1104,1229],notebook:[1254,1254,107,15,1011,1226],phone:[1254,1254,324,34,606,1205],airpods:[1254,1254,26,3,1198,1242],pack:[1254,1254,193,2,877,1235],lighter:[1254,1254,377,0,498,1252],pen:[1254,1254,495,0,285,1254],cable:[1254,1254,129,19,980,1213],receipt:[1254,1254,246,4,757,1238],scissors:[1254,1254,85,18,1085,1235]};
 // Match the unrotated bitmap width, including the transparent crop margin.
 // Browser selection retains enough source pixels for high-density displays.
 const deskSizes=name=>{
  const ratio=deskCrops[name][0]/deskCrops[name][4],n=v=>(v*ratio).toFixed(3);
  const scene=(percent,heightCap,max)=>`min(${n(percent)}vw, ${n(Math.min(percent*1.85,heightCap||Infinity))}svh, ${n(Math.min(percent*22.8,max||Infinity))}px)`;
  const phone={notebook:25,phone:13,airpods:23,laptop:58,pack:12,lighter:4.5,pen:4,cable:17,receipt:10,scissors:18};
  const shortPhone={notebook:23,phone:10.5,airpods:22,laptop:48,pack:10,lighter:3.5,pen:3,cable:14,receipt:9,scissors:15};
  const landscape={notebook:11,phone:5.2,airpods:12,laptop:20,pack:5,lighter:1.8,pen:1.5,cable:8,receipt:4,scissors:9};
  const tablet={notebook:17,phone:8.5,airpods:18,laptop:32,pack:8.5,lighter:3,pen:2.5,cable:12,receipt:7,scissors:12};
  const shortDesktop={notebook:13,phone:6,airpods:15,laptop:25,pack:6.2,lighter:2.6,pen:1.7,cable:10,receipt:5,scissors:10};
  const desktop={notebook:17,phone:7.6,airpods:16.5,laptop:25.5,pack:7.3,lighter:2.6,pen:2.15,cable:12,receipt:6.8,scissors:13};
  return [`(max-width: 680px) and (max-height: 700px) ${n(shortPhone[name])}vw`,`(max-width: 680px) ${n(phone[name])}vw`,`(max-width: 1000px) and (max-height: 520px) ${name==='laptop'?`min(${n(20)}vw, ${n(33)}svh)`:`${n(landscape[name])}vw`}`,`(max-height: 520px) ${scene(shortDesktop[name],name==='laptop'?35:0)}`,`(max-width: 1000px) ${scene(tablet[name],name==='laptop'?38:0)}`,scene(desktop[name],name==='laptop'?41:0,name==='laptop'?520:0)].join(', ');
 };
 const deskAsset=name=>`/hero/desk/${name==='phone'?'v4':name==='notebook'||name==='scissors'?'v3':'v2'}`;
 const deskSrcset=name=>(name==='laptop'?[256,384,512,768,1024,1254]:[256,384,512,768,1024]).map(w=>`${deskAsset(name)}/responsive/${name}-${w}.webp ${w}w`).concat(name==='laptop'?[]:[`${deskAsset(name)}/${name}.webp 1254w`]).join(', ');
 const deskObject=({name,label,key,group})=>{
  const tag=label?'button':'div',src=`${deskAsset(name)}/${name}.webp`;
  const [canvasWidth,canvasHeight,x,y,width,height]=deskCrops[name],percent=value=>`${value.toFixed(5)}%`;
  const crop=`--paper-ratio:${width}/${height};--paper-width:${percent(canvasWidth/width*100)};--paper-height:${percent(canvasHeight/height*100)};--paper-left:${percent(-x/width*100)};--paper-top:${percent(-y/height*100)};--paper-bg-x:${percent(canvasWidth===width?50:x/(canvasWidth-width)*100)};--paper-bg-y:${percent(canvasHeight===height?50:y/(canvasHeight-height)*100)}`;
  return `<${tag} ${name==='laptop'?'id="enter-work" ':''}class="desk-object desk-${name}" data-desk-object="${name}" data-reveal="pending"${key?` data-desk-open="${key}"`:''}${label?' type="button"':' aria-hidden="true"'} style="--reveal-delay:${group*280}ms">
   <span class="desk-cutout" style="${crop}"><img srcset="${deskSrcset(name)}" sizes="${deskSizes(name)}" src="${src}" width="1254" height="1254"${name==='laptop'&&!pathIsDetail?' fetchpriority="high"':pathIsDetail?' fetchpriority="low"':''} alt="" draggable="false" decoding="async"><span class="paper-fold paper-fold-first" aria-hidden="true"></span><span class="paper-fold paper-fold-middle" aria-hidden="true"></span><span class="paper-fold paper-fold-last" aria-hidden="true"></span></span>
   ${name==='laptop'?'<span class="desk-label desk-work-hint" aria-hidden="true"><span class="desk-work-prompt" data-entry-copy="clickHere"></span><img class="desk-work-arrow" src="/hero/desk/work-arrow.webp" width="512" height="341" alt="" draggable="false"></span>':label?`<span class="desk-label"><span data-entry-copy="${label}"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10"/></svg></span>`:''}
  </${tag}>`;
 };
 root.dataset.paperReveal='pending';
 root.innerHTML=`<div class="studio-field">${deskObjects.map(deskObject).join('')}</div>
 <div class="studio-intro"><h1 id="studio-title"></h1></div>`;
 document.body.append(root);
 window.portfolioProcess?.mount(root);
 window.portfolioComposition?.mount(root);
 window.portfolioAbout?.mount(root);
 // Fold layers reuse the browser-selected bitmap; they must not fetch the full
 // master a second time when a smaller responsive source was selected.
 for(const img of root.querySelectorAll('.desk-cutout>img')){
  const sync=()=>{if(img.currentSrc){const source=`url("${img.currentSrc}")`;img.parentElement.style.setProperty('--cutout',source);if(img.closest('.desk-phone'))img.closest('.desk-phone').style.setProperty('--phone-art',source)}};
  img.addEventListener('load',sync);if(img.complete)sync();
 }
 const overview=document.createElement('div');overview.id='work-overview';overview.innerHTML='<span data-entry-copy="index"></span><p data-entry-copy="hint"></p>';document.body.append(overview);
 const loader=document.getElementById('studio-loader');
 let mode=pathIsDetail?'work':'home',origin='work',generation=0,booted=false,pending=false,hadDetail=false,scheduledHome=false,overviewVisited=false;
 let processReturnMode='home',processOpener=null,processReturnScene=null;
 let queuedIntent=null,historyRestoring=false;
 let phoneView='profile',phoneOpener=null;
 const selectPhoneView=view=>{phoneView=view==='contact'?'contact':'profile';document.body.dataset.phoneView=phoneView;};
 addEventListener('portfolio:phoneview',event=>{selectPhoneView(event.detail?.view);if(booted&&mode==='about'&&!pending)recordScene({section:'about',phoneView})});
 const composition=()=>window.portfolioComposition;
 // One history owner for the authored sections and native gallery. Native
 // camera changes report through this bridge instead of mutating history twice.
 const routeScene=()=>{
  const key=location.pathname.match(/^\/(?:work|stories)\/([^/]+)\/?$/)?.[1],view=new URLSearchParams(location.search).get('view');
  if(key==='despre'||view==='about'||view==='contact')return{section:'about',phoneView:view==='contact'?'contact':'profile'};
  if(key==='process'||view==='process')return{section:'process',returnScene:{section:'home'}};
  if(key)return{section:'detail',key,origin:'work'};
  return{section:view==='work'?'work':'home'};
 };
 const sceneURL=scene=>scene.section==='detail'?`/work/${encodeURIComponent(scene.key)}`:scene.section==='home'?'/':`/?view=${scene.section==='about'?(scene.phoneView==='contact'?'contact':'about'):scene.section}`;
 const initialScene=history.state?.portfolioScene||routeScene();
 let historyDepth=history.state?.portfolioDepth||0,lastHistorySave=0;
 const snapshotScene=()=>{const state=window.portfolioRuntime,section=mode;return{section,key:section==='detail'?state?.focusedKey:null,phoneView,origin,camera:state?.camera,returnCamera:state?.returnCamera,overviewZoom:state?.workOverviewActive?state?.workOverviewCamera?.zoom:null,materialIndex:state?.materialIndex||0,...(section==='process'?{returnScene:processReturnScene||{section:processReturnMode}}:{})}};
 const sameScene=(a,b)=>a?.section===b?.section&&(a?.key||null)===(b?.key||null)&&(a?.section!=='about'||a?.phoneView===b?.phoneView);
 function rememberScene(force=false){if(historyRestoring||!booted||pending||!force&&performance.now()-lastHistorySave<600)return;const old=history.state?.portfolioScene,current=snapshotScene();if(sameScene(old,current)&&JSON.stringify(old)!==JSON.stringify(current)){history.replaceState({...history.state,portfolioScene:current},'',sceneURL(current));lastHistorySave=performance.now()}}
 function recordScene(scene){
  if(historyRestoring||!booted)return;
  if(sameScene(history.state?.portfolioScene,scene))return;
  rememberScene(true);history.pushState({portfolioDepth:++historyDepth,portfolioScene:scene},'',sceneURL(scene));
 }
 history.replaceState({...history.state,portfolioDepth:historyDepth,portfolioScene:initialScene},'',sceneURL(initialScene));
 window.portfolioHistory=Object.freeze({native(key){
  if(!booted||pending||historyRestoring||!['work','detail'].includes(mode))return;
  const candidate=key&&window.portfolioRuntime?.projects.includes(key)&&!['despre','process','home'].includes(key);
  if(candidate)recordScene({section:'detail',key,origin});
  else if(history.state?.portfolioScene?.section==='detail'&&historyDepth>0)history.back();
  else recordScene({section:origin==='home'?'home':'work'});
 }});
 addEventListener('pointerdown',()=>{if(mode==='work')rememberScene(true)},{capture:true,passive:true});
 async function restoreHistory(scene){
  const token=++generation;pending=true;historyRestoring=true;queuedIntent=null;scheduledHome=false;hadDetail=false;
  announceTarget(scene.section);cancelProcessFade();window.portfolioProcess?.hide();
  if(mode==='about'){await retreatPhone(token);if(token!==generation)return;}
  else await window.portfolioAbout?.hide();
  if(token!==generation)return;
  const nativeScene=scene.section==='process'?(scene.returnScene||{section:'home'}):scene;
  nav({action:'restore',scene:nativeScene});
  origin=scene.origin||'work';
  if(scene.section==='about'){
   selectPhoneView(scene.phoneView);phoneOpener=document.getElementById(phoneView==='contact'?'nav-contact':'about-control');
   setMode('home',false);await composition()?.restore({duration:reduced()?0:700});if(token!==generation)return;
   setMode('about',false);root.querySelector('.desk-phone .desk-cutout>img').sizes='1254px';
   await Promise.all([composition()?.focusPhone({duration:reduced()?0:850}),pause(467).then(()=>token===generation&&window.portfolioAbout?.show({view:phoneView,onBack:closeAbout}))]);
  }else if(scene.section==='process'){
   processReturnScene=scene.returnScene||{section:'home'};processReturnMode=processReturnScene.section;
   setMode('process',false);await composition()?.scatter({duration:reduced()?0:900});if(token!==generation)return;
   window.portfolioProcess?.show({onBack:closeProcess});
  }else if(scene.section==='home'){
   origin='home';setMode('home',false);await composition()?.restore({duration:reduced()?0:700});
  }else{
   dismissHome();await Promise.all([composition()?.scatter({duration:reduced()?0:900}),pause(900)]);if(token!==generation)return;
   overviewVisited=true;hadDetail=scene.section==='detail';setMode(hadDetail?'detail':'work',false);
  }
  if(token!==generation)return;
  if(nativeScene.section==='detail'){
   const started=performance.now();
   while(token===generation&&performance.now()-started<8000){const state=window.portfolioRuntime;if(state?.focusedKey===nativeScene.key&&!state.moving&&state.materialMode!=='composition')break;await new Promise(resolve=>setTimeout(resolve,50));}
   if(token!==generation)return;
   if(Number.isInteger(nativeScene.materialIndex))nav({action:'material',index:nativeScene.materialIndex});
  }
  pending=false;historyRestoring=false;delete document.body.dataset.entryTarget;
  if(mode==='home')composition()?.setEnabled(true);
  announceSettled();rememberScene();
  (mode==='home'?root.querySelector('#enter-work'):document.getElementById('studio-back'))?.focus({preventScroll:true});
 }
 addEventListener('popstate',event=>{event.stopImmediatePropagation();historyDepth=event.state?.portfolioDepth||0;const scene=event.state?.portfolioScene||routeScene();if(booted)void restoreHistory(scene)},true);
 const announceTarget=target=>{document.body.dataset.entryTarget=target;dispatchEvent(new CustomEvent('portfolio:entryintent',{detail:{target}}))};
 const announceSettled=()=>dispatchEvent(new CustomEvent('portfolio:entrysettled',{detail:{mode}}));
 const setMode=(next,restore=true)=>{
  mode=next;document.body.dataset.entry=next;
  if(next!=='about')delete root.dataset.retreat;
  delete document.body.dataset.entryTarget;
  const studio=['home','process','about'].includes(next);root.inert=!studio;
  document.getElementById('portfolio-root').inert=studio;
  root.querySelector('.studio-field').inert=!['home','about'].includes(next);
  root.querySelectorAll('button.desk-object').forEach(button=>button.inert=next!=='home');
  root.querySelector('.studio-intro').inert=next!=='home';
  root.setAttribute('aria-hidden',String(!studio));composition()?.setEnabled(false);
  if(next==='home'){
   delete root.dataset.exit;
   Promise.resolve(restore?composition()?.restore({duration:reduced()?0:700}):null).then(()=>{if(mode==='home'&&!pending)composition()?.setEnabled(true)});
  }
  dispatchEvent(new CustomEvent('portfolio:entrystate',{detail:{mode}}));
 };
 const introductions={en:'<span>Hey, I’m <strong>Dumitru.</strong> I turn <em>ideas</em> into websites.</span>',ro:'<span>Salut, sunt <strong>Dumitru.</strong> Transform <em>ideile</em> în site-uri.</span>',ru:'<span>Привет, я <strong>Dumitru.</strong> Превращаю <em>идеи</em> в сайты.</span>'};
 const syncCopy=()=>{document.querySelectorAll('[data-entry-copy]').forEach(el=>el.textContent=copy()[el.dataset.entryCopy]);root.querySelector('#enter-work').setAttribute('aria-label',copy().work);root.querySelector('#studio-title').innerHTML=introductions[I.locale]||introductions.en;loader?.setAttribute('aria-label',copy().load);loader?.querySelector('[role=progressbar]')?.setAttribute('aria-label',copy().load);loader?.querySelector('[data-loader-status]')?.replaceChildren(document.createTextNode(copy().load))};
 I.subscribe(syncCopy);syncCopy();root.inert=true;
 const nativeReady=()=>!!window.portfolioRuntime?.ready;
 function waitForNative(timeout=12000){return new Promise(resolve=>{const start=performance.now();const tick=()=>{if(nativeReady())return resolve(true);if(performance.now()-start>=timeout)return resolve(false);setTimeout(tick,70)};tick()})}
 let processFade=null;
 const cancelProcessFade=()=>{processFade?.cancel();processFade=null};
 // Keep Process on screen while the gallery fades in. Its public hide() is
 // intentionally immediate, so defer that call until this short handoff ends.
 function fadeProcess(token=generation){
  const panel=document.getElementById('studio-process');
  if(!panel||panel.hidden)return Promise.resolve();
  const opacity=Number(getComputedStyle(panel).opacity)||0;
  cancelProcessFade();panel.inert=true;
  if(reduced()||!panel.animate){window.portfolioProcess?.hide();return Promise.resolve();}
  const animation=panel.animate([{opacity},{opacity:0}],{duration:300,easing:'ease-out',fill:'forwards'});processFade=animation;
  return animation.finished.catch(()=>{}).then(()=>{
   if(token===generation)window.portfolioProcess?.hide();
   if(processFade===animation){animation.cancel();processFade=null;}
  });
 }
 const dismissHome=()=>{root.inert=true;root.dataset.exit='work';composition()?.setEnabled(false);document.body.dataset.entry='leaving';root.setAttribute('aria-hidden','true')};
 const exitStudio=()=>{const fading=fadeProcess();dismissHome();return Promise.all([fading,composition()?.scatter({duration:reduced()?0:900})])};
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,reduced()?0:ms));
 async function retreatPhone(token=generation){
  root.dataset.retreat='true';
  await window.portfolioAbout?.hide();
  if(token!==generation)return;
  await composition()?.restorePhone({duration:reduced()?0:700});
 }
 async function enterWork(){
  if(!booted)return;if(pending){queuedIntent='work';return;}
  recordScene({section:'work'});
  const fromStudio=['home','process','about'].includes(mode),fromAbout=mode==='about',fromDetail=mode==='detail',resumeWork=mode==='process'&&processReturnMode==='work';
  const token=++generation;origin='work';pending=true;
  announceTarget('work');
  root.querySelector('#enter-work').setAttribute('aria-busy','true');
  if(!await waitForNative()){if(token===generation){pending=false;showHome();showFallback()}return}
  if(token!==generation)return;
  if(fromAbout){await retreatPhone(token);if(token!==generation)return;}
  root.querySelector('#enter-work').removeAttribute('aria-busy');
  const exit=fromStudio?exitStudio():Promise.resolve();
  overviewVisited=true;if(fromDetail)nav({action:'return'});else if(!resumeWork)nav({action:'overview'});
  await Promise.all([exit,new Promise(r=>setTimeout(r,reduced()?0:fromStudio?900:620))]);
  if(token!==generation)return;pending=false;setMode('work');
 }
 async function openProcess(){
  if(!booted||pending||mode==='process')return;
  processReturnScene=snapshotScene();recordScene({section:'process',returnScene:processReturnScene});
  const fromNative=mode==='work'||mode==='detail';
  const token=++generation;processReturnMode=mode==='about'?'home':mode;processOpener=document.activeElement;
  if(mode==='home')origin='home';else if(mode==='work')origin='work';
  pending=true;
  announceTarget('process');
  if(mode==='about'){await retreatPhone(token);if(token!==generation)return;}
  cancelProcessFade();delete root.dataset.exit;setMode('process');window.portfolioProcess?.hide();
  const spread=Promise.resolve(composition()?.scatter({duration:reduced()?0:900}));
  await new Promise(r=>setTimeout(r,reduced()||fromNative?0:650));if(token!==generation)return;
  window.portfolioProcess?.show({onBack:closeProcess});
  document.getElementById('studio-back')?.focus({preventScroll:true});
  await spread;if(token!==generation)return;pending=false;announceSettled();
 }
 async function closeProcess(){
  if(mode!=='process')return;
  if(history.state?.portfolioScene?.section==='process'&&historyDepth>0){history.back();return;}
  historyRestoring=false;
  const token=++generation;pending=true;
  const target=processReturnMode==='process'?'home':processReturnMode;
  recordScene(processReturnScene||{section:target});const fading=fadeProcess(token);setMode(target);announceTarget(target);
  await fading;if(token!==generation)return;pending=false;delete document.body.dataset.entryTarget;if(mode==='home'&&reduced())composition()?.setEnabled(true);announceSettled();
  requestAnimationFrame(()=>{if(token===generation&&processOpener?.isConnected&&!processOpener.closest('[inert]'))processOpener.focus({preventScroll:true})});
 }
 async function openAbout(view='profile'){
  if(!booted||pending||mode==='about')return;
  recordScene({section:'about',phoneView:view});
  selectPhoneView(view);
  // WebKit touch taps can leave activeElement on BODY or a previous control.
  // Restore the actual section entry, not that unrelated focus snapshot.
  phoneOpener=document.getElementById(view==='contact'?'nav-contact':'about-control');
  const from=mode,token=++generation;pending=true;origin='home';hadDetail=false;
  announceTarget('about');
  // The small Home source must not be stretched across the enlarged phone.
  root.querySelector('.desk-phone .desk-cutout>img').sizes='1254px';
  await fadeProcess(token);if(token!==generation)return;
  if(from!=='home'){
   setMode('home',false);announceTarget('about');nav({key:'home'});
   await composition()?.restore({duration:reduced()?0:700});
   if(token!==generation)return;
  }
  delete root.dataset.exit;delete root.dataset.retreat;setMode('about',false);announceTarget('about');
  await Promise.all([
   composition()?.focusPhone({duration:reduced()?0:850}),
   pause(467).then(()=>{if(token===generation)return window.portfolioAbout?.show({view:phoneView,onBack:closeAbout})})
  ]);
  if(token!==generation)return;
  pending=false;delete document.body.dataset.entryTarget;announceSettled();
 }
 async function closeAbout(){
  if(mode!=='about'||pending&&document.body.dataset.entryTarget==='home')return;
  queuedIntent=null;historyRestoring=false;recordScene({section:'home'});const token=++generation;pending=true;
  announceTarget('home');
  await retreatPhone(token);if(token!==generation)return;
  pending=false;setMode('home',false);root.dataset.paperReveal='done';
  (phoneOpener?.isConnected&&!phoneOpener.closest('[inert]')?phoneOpener:document.getElementById('about-control'))?.focus({preventScroll:true});
 }
 async function open(key){
  if(historyRestoring&&pending){queuedIntent=key;return;}
  if(key==='process'||key==='despre'||key==='contact'){
   if(!booted)return;
   const target=key==='process'?'process':'about',view=key==='contact'?'contact':'profile',intent=document.body.dataset.entryTarget;
   // The active section is a toggle, including its approach animation. A
   // second press while retreating must not start a new approach underneath it.
   if(pending&&intent==='home'){queuedIntent=key;return;}
   // Profile and Contact share one already enlarged phone. Switching them
   // changes only the screen; it must not start another camera/desk flight.
   if(target==='about'&&(mode==='about'||intent==='about')&&phoneView!==view){
    recordScene({section:'about',phoneView:view});selectPhoneView(view);phoneOpener=document.activeElement;
    if(window.portfolioAbout?.getState().visible)void window.portfolioAbout.setView(view);
    return;
   }
   if(intent===target||!intent&&mode===target){showHome();return;}
   if(pending){queuedIntent=key;return;}
   if(target==='process')void openProcess();else void openAbout(view);
   return;
  }
  if(!booted)return;if(pending){queuedIntent=key;return;}
  recordScene({section:'detail',key,origin:mode==='home'?'home':'work'});
  const fromStudio=['home','process','about'].includes(mode),fromAbout=mode==='about';
  const token=++generation;if(mode!=='detail'&&mode!=='process')origin=mode==='home'?'home':'work';pending=true;
  announceTarget('detail');
  if(!await waitForNative()){if(token===generation){pending=false;showHome();showFallback()}return}
  if(token!==generation)return;
  if(fromAbout){await retreatPhone(token);if(token!==generation)return;}
  const exit=fromStudio?exitStudio():Promise.resolve();nav({key});
  await Promise.all([exit,new Promise(r=>setTimeout(r,reduced()?0:fromStudio?900:460))]);
  if(token!==generation)return;pending=false;setMode('detail');hadDetail=true;
 }
 function showHome(){if(!booted)return;queuedIntent=null;historyRestoring=false;recordScene({section:'home'});if(mode==='about'){void closeAbout();return;}generation++;pending=false;hadDetail=false;scheduledHome=false;origin='home';void fadeProcess(generation);window.portfolioAbout?.hide();setMode('home');root.querySelector('#enter-work').removeAttribute('aria-busy');nav({key:'home'});root.querySelector('#enter-work').focus({preventScroll:true})}
 function back(){if(pending&&document.body.dataset.entryTarget==='home')return;if(pending&&document.body.dataset.entryTarget==='about'&&mode==='home'){showHome();return;}if(mode==='about'){void closeAbout();return;}if(mode==='process'){closeProcess();return;}if(pending){showHome();return;}if(mode==='detail'){nav({action:'return'});return;}showHome()}
 function showFallback(){let fallback=document.getElementById('studio-fallback');if(!fallback){fallback=document.createElement('p');fallback.id='studio-fallback';root.querySelector('.studio-intro').append(fallback)}fallback.textContent=copy().failed;fetch('/portfolio-data.json').then(r=>r.json()).then(d=>{if(!fallback.querySelector('a'))for(const p of d.projects.filter(p=>p.portfolioCase&&p.externalUrl)){const a=document.createElement('a');a.textContent=p.name;a.href=p.externalUrl;a.target='_blank';a.rel='noopener noreferrer';fallback.append(a)}}).catch(()=>{})}
 window.portfolioEntry=Object.freeze({get mode(){return mode},get ready(){return booted},get pending(){return pending},enterWork,open,showHome,closeProcess,closeAbout,back});
 window.addEventListener('portfolio:nativehome',()=>{if(booted&&!pending&&mode!=='home'){generation++;origin='home';hadDetail=false;setMode('home')}});
 const laptopButton=root.querySelector('#enter-work');let laptopPointerStart=true;
 // WebKit can move a touch-generated click onto a nearby button. Respect the
 // original pointer target so a tap in the transparent margin stays on Home.
 root.addEventListener('pointerdown',event=>{laptopPointerStart=laptopButton.contains(event.target)},{capture:true,passive:true});
 laptopButton.onclick=event=>{if(event.detail>0&&!laptopPointerStart){event.preventDefault();return;}enterWork()};
 root.querySelectorAll('[data-desk-open]').forEach(button=>button.onclick=()=>open(button.dataset.deskOpen));
 // About is a scene within the desk, not a modal. Only a complete blank-space
 // tap dismisses it: phone gestures, controls and drags keep their own behavior.
 let aboutBlankPress=null,aboutDismissedClick=null;
 const blankOutsidePhone=(target,x,y)=>{
  if(!(target instanceof Element)||target.closest('#portfolio-ui,.desk-phone,button,a,input,textarea,select,[role="button"],[role="menu"],#work-companion'))return false;
  const phone=root.querySelector('.desk-phone'),r=phone?.getBoundingClientRect();
  return !!r&&(x<r.left||x>r.right||y<r.top||y>r.bottom);
 };
 document.addEventListener('pointerdown',event=>{
  aboutBlankPress=null;
  if(mode!=='about'||pending||!event.isPrimary||event.button!==0||!blankOutsidePhone(event.target,event.clientX,event.clientY))return;
  aboutBlankPress={id:event.pointerId,x:event.clientX,y:event.clientY,generation};
 },{capture:true,passive:true});
 document.addEventListener('pointermove',event=>{if(aboutBlankPress?.id===event.pointerId&&Math.hypot(event.clientX-aboutBlankPress.x,event.clientY-aboutBlankPress.y)>8)aboutBlankPress=null;},{capture:true,passive:true});
 document.addEventListener('pointercancel',()=>{aboutBlankPress=null;},{capture:true,passive:true});
 document.addEventListener('pointerup',event=>{
  const press=aboutBlankPress;aboutBlankPress=null;
  if(!press||event.pointerId!==press.id||press.generation!==generation||mode!=='about'||pending||Math.hypot(event.clientX-press.x,event.clientY-press.y)>8||!blankOutsidePhone(event.target,event.clientX,event.clientY))return;
  event.preventDefault();event.stopImmediatePropagation();
  aboutDismissedClick={x:event.clientX,y:event.clientY,time:performance.now()};
  back();
 },{capture:true});
 document.addEventListener('click',event=>{
  if(!aboutDismissedClick||event.detail===0||performance.now()-aboutDismissedClick.time>700||Math.hypot(event.clientX-aboutDismissedClick.x,event.clientY-aboutDismissedClick.y)>20)return;
  aboutDismissedClick=null;event.preventDefault();event.stopImmediatePropagation();
 },{capture:true});
 addEventListener('blur',()=>{aboutBlankPress=null;});
 // Three objects unfold at a time, once the loader has actually left the screen.
 let deskRevealed=false,deskRevealFrame=0,deskRevealObserver=null;
 const revealDesk=()=>{
  if(deskRevealed||document.body.dataset.entry!=='home')return;
  if(document.getElementById('studio-loader')){
   if(!deskRevealObserver){deskRevealObserver=new MutationObserver(revealDesk);deskRevealObserver.observe(document.body,{childList:true})}
   return;
  }
  deskRevealObserver?.disconnect();deskRevealObserver=null;
  cancelAnimationFrame(deskRevealFrame);
  deskRevealFrame=requestAnimationFrame(()=>{
   if(document.body.dataset.entry!=='home')return;
   deskRevealed=true;root.dataset.paperReveal=reduced()?'done':'running';
   const settled=()=>{root.dataset.paperReveal='done';root.querySelectorAll('.desk-object').forEach(object=>object.dataset.reveal='settled');dispatchEvent(new CustomEvent('portfolio:deskready'))};
   if(reduced())settled();else setTimeout(settled,840);
  });
 };
 addEventListener('portfolio:entrystate',event=>{if(event.detail.mode==='home')revealDesk()});
 // Home wheel/touch belongs to the cyclic composition controller. Work is explicit.
 document.addEventListener('wheel',e=>{if(pending){e.preventDefault();e.stopImmediatePropagation()}},{passive:false,capture:true});
 document.addEventListener('keydown',e=>{if(['process','about'].includes(mode)&&e.key==='Escape'){if(mode==='about'&&['photo','contact'].includes(window.portfolioAbout?.getState()?.view))return;e.preventDefault();e.stopImmediatePropagation();back()}},true);
 document.addEventListener('keydown',e=>{if((e.key==='Home'||(e.key==='Escape'&&mode==='work'&&!window.portfolioRuntime?.focusedKey&&!window.portfolioRuntime?.helpOpen))&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();showHome()}},true);
 setInterval(()=>{
  if(booted&&!pending&&queuedIntent){const target=queuedIntent;queuedIntent=null;if(target==='work')void enterWork();else void open(target);return;}
  if(booted&&!pending)rememberScene();
  if(!booted||pending||mode==='process'||mode==='about')return;
  const s=window.portfolioRuntime;if(!s?.ready)return;
  document.getElementById('studio-fallback')?.remove();
  if(s.focusedKey&&s.focusedKey!=='home'){hadDetail=true;if(mode==='work')setMode('detail')}
  if(!s.focusedKey&&hadDetail&&!s.moving){hadDetail=false;if(origin==='home'){setMode('home')}else{setMode('work');if(!overviewVisited){overviewVisited=true;nav({action:'overview'})}}}
  if(mode==='home'&&s.focusedKey&&!s.moving&&!scheduledHome){scheduledHome=true;nav({key:'home'})}
 },100);
 /* Full reference character: initial gait hands over to the Home-only controller. */
 const started=performance.now(),staticIntro=reduced(),walker=document.getElementById('loader-walker');
 const lockBackground=()=>{root.inert=true;document.getElementById('portfolio-root').inert=true;const ui=document.getElementById('portfolio-ui');if(ui)ui.inert=true};
 lockBackground();const loadingObserver=new MutationObserver(lockBackground);loadingObserver.observe(document.body,{childList:true});
 loader?.addEventListener('wheel',event=>{if(!event.ctrlKey&&!event.metaKey)event.preventDefault();event.stopPropagation()},{passive:false});
 let completed=0,loadingFailed=false,resourcesSettled=false,finishing=false,skipped=false,phase='loading',finishReason=null,minimumDone=staticIntro;
 let frame=staticIntro?2:0,walking=false,walkerX=0,direction=1,walkLimit=0,walkFrameId=0,lastWalkTime=started;
 const timers=new Set(),later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn()},ms);timers.add(id);return id};
 const images=[...root.querySelectorAll('.desk-cutout>img'),...walker?.querySelectorAll('img')||[]],total=images.length+2;
 const loaderState=()=>Object.freeze({phase,ready:booted,completed,total,resourcesSettled,loadingFailed,skipped,finishReason,minimumDone,frame:Number(walker?.dataset.frame??frame),walking,walkerX,character:window.portfolioCharacter?.getState(),nativeReady:nativeReady(),elapsed:performance.now()-started});
 Object.defineProperty(window,'portfolioLoader',{configurable:true,value:Object.freeze({getState:loaderState})});
 const progress=()=>{if(!loader)return;loader.dataset.resources=resourcesSettled?'settled':'loading';const status=loader.querySelector('[data-loader-status]');if(status)status.textContent=loadingFailed?copy().slow:resourcesSettled?copy().ready:copy().load};
 const paintWalker=()=>{if(!walker)return;walker.dataset.frame=String(frame);walker.dataset.direction=direction<0?'left':'right';walker.style.transform=`translateX(${walkerX.toFixed(2)}px)`};
 const measureWalk=()=>{if(!walker)return;const left=parseFloat(getComputedStyle(walker).left)||20;walkLimit=Math.max(0,innerWidth-left-walker.offsetWidth);walkerX=Math.min(walkerX,walkLimit);paintWalker()};
 const walk=time=>{if(!walking)return;const seconds=Math.max(0,Math.min(100,time-lastWalkTime))/1000;lastWalkTime=Math.max(lastWalkTime,time);walkerX+=69*seconds*direction;if(walkerX>walkLimit){walkerX=Math.max(0,2*walkLimit-walkerX);direction=-1}else if(walkerX<0){walkerX=-walkerX;direction=1}if(!walkLimit)walkerX=0;frame=Math.floor(Math.max(0,time-started)/200)%5;paintWalker();walkFrameId=requestAnimationFrame(walk)};
 const touchCharacter=matchMedia('(pointer:coarse)').matches;
 const walkerCopy=()=>{if(!walker)return;walker.dataset.locale=I.locale;const words=({en:{loading:'Loading',scroll:touchCharacter?'Swipe':'Scroll',controls:'use wasd'},ro:{loading:'Se încarcă',scroll:touchCharacter?'Glisează':'Derulează',controls:'folosește WASD'},ru:{loading:'Загрузка',scroll:touchCharacter?'Смахните':'Прокрутите',controls:'клавиши WASD'}})[I.locale]||{};walker.querySelectorAll('[data-walker-copy]').forEach(el=>el.textContent=words[el.dataset.walkerCopy]||'')};
 I.subscribe(walkerCopy);walkerCopy();measureWalk();window.addEventListener('resize',measureWalk);paintWalker();
 // Keep the sprite at its initial position until all five poses can be painted.
 Promise.allSettled([...walker?.querySelectorAll('.walker-frame')||[]].map(img=>img.decode())).then(()=>{if(booted)return;walking=!!walker&&!staticIntro;lastWalkTime=performance.now();if(walker)walker.dataset.state=walking?'walking':'static';if(walking)walkFrameId=requestAnimationFrame(walk)});
 let hintTimer=0,hintDismissed=false;
 const dismissWalkerHint=()=>{hintDismissed=true;clearTimeout(hintTimer);if(walker)walker.dataset.hint='false'};
 addEventListener('portfolio:characterparked',()=>{if(hintDismissed)return;clearTimeout(hintTimer);hintTimer=setTimeout(()=>{if(!hintDismissed&&document.body.dataset.entry==='home'&&walker)walker.dataset.hint='true'},2000)});
 addEventListener('portfolio:characteractive',dismissWalkerHint);
 root.addEventListener('wheel',dismissWalkerHint,{passive:true});root.addEventListener('touchmove',dismissWalkerHint,{passive:true});
 addEventListener('portfolio:entrystate',e=>{if(e.detail.mode!=='home')dismissWalkerHint()});
 const finish=reason=>{
  if(booted||finishing)return;finishing=true;skipped=reason==='skip';finishReason=reason;phase='leaving';generation++;pending=false;
  for(const id of timers)clearTimeout(id);timers.clear();
  loadingObserver.disconnect();const ui=document.getElementById('portfolio-ui');if(ui)ui.inert=false;
  if(window.__portfolioLoaderKeyGuard){window.removeEventListener('keydown',window.__portfolioLoaderKeyGuard,true);delete window.__portfolioLoaderKeyGuard}
  booted=true;setMode(pathIsDetail&&nativeReady()?'work':'home');if(!nativeReady())showFallback();
  const park=()=>{walking=false;cancelAnimationFrame(walkFrameId);window.removeEventListener('resize',measureWalk);loader?.remove();phase='complete';window.portfolioCharacter?.start({x:walkerX,direction});window.dispatchEvent(new CustomEvent("portfolio:loaderhandoff"));if(initialScene.section!=='home'){root.dataset.paperReveal='done';deskRevealed=true;void restoreHistory(initialScene)}};
  if(walker)walker.dataset.state='leaving';
  if(loader){loader.dataset.ready='true';loader.setAttribute('aria-hidden','true');loader.inert=true}
  if(staticIntro)park();else setTimeout(park,600);
  if(skipped&&!pathIsDetail)root.querySelector('#enter-work')?.focus({preventScroll:true});
 };
 const maybeFinish=()=>{if(resourcesSettled&&minimumDone)finish('ready')};
 if(!staticIntro)later(()=>{minimumDone=true;maybeFinish()},2000);
 if(loader){const enter=loader.querySelector('#loader-continue');if(enter)enter.onclick=()=>finish('skip');later(()=>{if(!booted){if(enter)enter.hidden=false;loader.querySelector('[data-loader-status]').textContent=copy().slow}},7000)}
 const tasks=images.map(img=>new Promise(resolve=>{
  let settled=false;const cutout=img.closest('.desk-cutout');if(cutout)cutout.dataset.decoded='pending';
  const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok){loadingFailed=true;if(cutout)cutout.dataset.failed='true'}completed++;progress();resolve()};
  // A readiness timeout releases the page, not a partially decoded bitmap.
  // The late load still swaps its complete image over the small preview.
  const decode=()=>img.decode().then(()=>{if(cutout){cutout.dataset.decoded='true';delete cutout.dataset.failed}img.hidden=false;done(true)},()=>done(false));
  const timer=setTimeout(()=>done(false),10000);
  if(img.complete)decode();else{img.addEventListener('load',decode,{once:true});img.addEventListener('error',()=>done(false),{once:true})}
 }));
 tasks.push(new Promise(resolve=>{let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok)loadingFailed=true;completed++;progress();resolve()};const timer=setTimeout(()=>done(false),10000);Promise.resolve(document.fonts?.ready).then(()=>done(true),()=>done(false))}));
 tasks.push(waitForNative().then(ok=>{if(!ok)loadingFailed=true;completed++;progress()}));
 Promise.allSettled(tasks).then(()=>{resourcesSettled=true;progress();maybeFinish()});
})();
