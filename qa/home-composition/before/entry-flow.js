/* Home is an introduction; Work is the existing spatial portfolio. */
(()=>{
 const I=window.portfolioI18n;
 const COPY={
  en:{hello:'Hi, I’m',role:'I make websites.',work:'Work',about:'About',load:'Opening the studio',ready:'Ready to explore',slow:'The workspace is taking a little longer.',continue:'Enter the studio',index:'Selected work',hint:'Drag to explore · Scroll to zoom',back:'Back to the studio',process:'Process',failed:'The interactive space is still loading. You can also open the projects directly.'},
  ro:{hello:'Salut, sunt',role:'Creez site-uri.',work:'Lucrări',about:'Despre',load:'Se deschide studioul',ready:'Totul este pregătit',slow:'Spațiul are nevoie de puțin timp.',continue:'Intră în studio',index:'Lucrări selectate',hint:'Trage pentru a explora · Scroll pentru zoom',back:'Înapoi în studio',process:'Proces',failed:'Spațiul interactiv se încarcă. Poți deschide și proiectele direct.'},
  ru:{hello:'Привет, я',role:'Я создаю сайты.',work:'Работы',about:'Обо мне',load:'Открываю студию',ready:'Можно начинать',slow:'Пространство загружается чуть дольше.',continue:'Войти в студию',index:'Работы',hint:'Перетаскивайте пространство · Колесо меняет масштаб',back:'Назад в студию',process:'Процесс',failed:'Пространство ещё загружается. Можно открыть сами проекты по ссылкам.'}
 };
 const copy=()=>COPY[I.locale]||COPY.en;
 const pathIsDetail=/^\/(work|stories)\//.test(location.pathname);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nav=detail=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail}));
 const root=document.createElement('section');root.id='studio-home';root.setAttribute('aria-labelledby','studio-title');
 const deskObjects=[
  {name:'notebook',label:'process',key:'process',group:0},
  {name:'phone',label:'about',key:'despre',group:0},
  {name:'airpods',group:0},
  {name:'laptop',label:'work',group:1},
  {name:'pack',group:1},
  {name:'pen',group:1},
  {name:'lighter',group:2},
  {name:'cable',group:2},
  {name:'receipt',group:2}
 ];
 // CSS crops keep the original transparent source files intact.
 const deskCrops={laptop:[1254,1254,71,17,1104,1229],notebook:[1254,1254,18,174,1224,912],phone:[1254,1254,306,16,643,1238],airpods:[1254,1254,26,3,1198,1242],pack:[1254,1254,193,2,877,1235],lighter:[1254,1254,377,0,498,1252],pen:[1254,1254,495,0,285,1254],cable:[1254,1254,129,19,980,1213],receipt:[1254,1254,246,4,757,1238]};
 // Match the unrotated bitmap width, including the transparent crop margin.
 // Browser selection retains enough source pixels for high-density displays.
 const deskSizes=name=>{
  const ratio=deskCrops[name][0]/deskCrops[name][4],n=v=>(v*ratio).toFixed(3);
  const scene=(percent,heightCap,max)=>`min(${n(percent)}vw, ${n(Math.min(percent*1.85,heightCap||Infinity))}svh, ${n(Math.min(percent*22.8,max||Infinity))}px)`;
  const phone={notebook:37,phone:13,airpods:23,laptop:62,pack:12,lighter:4.5,pen:4,cable:21,receipt:12};
  const shortPhone={notebook:35,phone:10.5,airpods:22,laptop:50,pack:10,lighter:3.5,pen:3,cable:16,receipt:10};
  const landscape={notebook:17,phone:5.2,airpods:12,laptop:20,pack:5,lighter:1.8,pen:1.5,cable:8,receipt:4};
  const tablet={notebook:25,phone:8.5,airpods:18,laptop:34,pack:8.5,lighter:3,pen:2.5,cable:14,receipt:7};
  const shortDesktop={notebook:20,phone:6,airpods:15,laptop:25,pack:6.2,lighter:2.6,pen:1.7,cable:12,receipt:5};
  const desktop={notebook:24,phone:7.6,airpods:16.5,laptop:25.5,pack:7.3,lighter:2.6,pen:2.15,cable:15,receipt:6.8};
  return [`(max-width: 680px) and (max-height: 700px) ${n(shortPhone[name])}vw`,`(max-width: 350px) ${n(name==='laptop'?59:phone[name])}vw`,`(max-width: 680px) ${n(phone[name])}vw`,`(max-width: 1000px) and (max-height: 520px) ${name==='laptop'?`min(${n(20)}vw, ${n(33)}svh)`:`${n(landscape[name])}vw`}`,`(max-height: 520px) ${scene(shortDesktop[name],name==='laptop'?35:0)}`,`(max-width: 1000px) ${scene(tablet[name],name==='laptop'?38:0)}`,`(min-width: 1900px) ${scene(name==='notebook'?23:desktop[name],name==='laptop'?41:0,name==='laptop'?520:0)}`,scene(desktop[name],name==='laptop'?41:0,name==='laptop'?520:0)].join(', ');
 };
 const deskSrcset=name=>[256,384,512,768,1024].map(w=>`/hero/desk/v2/responsive/${name}-${w}.webp ${w}w`).concat(`/hero/desk/v2/${name}.webp 1254w`).join(', ');
 const deskObject=({name,label,key,group})=>{
  const tag=label?'button':'div',src=`/hero/desk/v2/${name}.webp`;
  const [canvasWidth,canvasHeight,x,y,width,height]=deskCrops[name],percent=value=>`${value.toFixed(5)}%`;
  const crop=`--paper-ratio:${width}/${height};--paper-width:${percent(canvasWidth/width*100)};--paper-height:${percent(canvasHeight/height*100)};--paper-left:${percent(-x/width*100)};--paper-top:${percent(-y/height*100)};--paper-bg-x:${percent(canvasWidth===width?50:x/(canvasWidth-width)*100)};--paper-bg-y:${percent(canvasHeight===height?50:y/(canvasHeight-height)*100)}`;
  return `<${tag} ${name==='laptop'?'id="enter-work" ':''}class="desk-object desk-${name}" data-desk-object="${name}" data-reveal="pending"${key?` data-desk-open="${key}"`:''}${label?' type="button"':' aria-hidden="true"'} style="--reveal-delay:${group*280}ms">
   <span class="desk-cutout" style="${crop}"><img srcset="${deskSrcset(name)}" sizes="${deskSizes(name)}" src="${src}" width="1254" height="1254"${name==='laptop'&&!pathIsDetail?' fetchpriority="high"':pathIsDetail?' fetchpriority="low"':''} alt="" draggable="false" decoding="async"><span class="paper-fold paper-fold-first" aria-hidden="true"></span><span class="paper-fold paper-fold-middle" aria-hidden="true"></span><span class="paper-fold paper-fold-last" aria-hidden="true"></span></span>
   ${label?`<span class="desk-label"><span data-entry-copy="${label}"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10"/></svg></span>`:''}
  </${tag}>`;
 };
 root.dataset.paperReveal='pending';
 root.innerHTML=`<div class="studio-field">${deskObjects.map(deskObject).join('')}</div>
 <div class="studio-intro"><h1 id="studio-title"><span class="studio-sentence"><span class="studio-greeting" data-entry-copy="hello"></span> <span class="studio-name">Dumitru.</span></span> <span class="studio-role" data-entry-copy="role"></span></h1></div>`;
 document.body.append(root);
 // Fold layers reuse the browser-selected bitmap; they must not fetch the full
 // master a second time when a smaller responsive source was selected.
 for(const img of root.querySelectorAll('.desk-cutout>img')){
  const sync=()=>{if(img.currentSrc)img.parentElement.style.setProperty('--cutout',`url("${img.currentSrc}")`)};
  img.addEventListener('load',sync);if(img.complete)sync();
 }
 const overview=document.createElement('div');overview.id='work-overview';overview.innerHTML='<span data-entry-copy="index"></span><p data-entry-copy="hint"></p>';document.body.append(overview);
 const loader=document.getElementById('studio-loader');
 let mode=pathIsDetail?'work':'home',origin='work',generation=0,booted=false,pending=false,hadDetail=false,scheduledHome=false,overviewVisited=false;
 const setMode=next=>{mode=next;document.body.dataset.entry=next;root.inert=next!=='home';document.getElementById('portfolio-root').inert=next==='home';root.setAttribute('aria-hidden',String(next!=='home'));dispatchEvent(new CustomEvent('portfolio:entrystate',{detail:{mode}}))};
 const syncCopy=()=>{document.querySelectorAll('[data-entry-copy]').forEach(el=>el.textContent=copy()[el.dataset.entryCopy]);loader?.setAttribute('aria-label',copy().load);loader?.querySelector('[role=progressbar]')?.setAttribute('aria-label',copy().load);loader?.querySelector('[data-loader-status]')?.replaceChildren(document.createTextNode(copy().load))};
 I.subscribe(syncCopy);syncCopy();root.inert=true;
 const nativeReady=()=>!!window.portfolioRuntime?.ready;
 function waitForNative(timeout=12000){return new Promise(resolve=>{const start=performance.now();const tick=()=>{if(nativeReady())return resolve(true);if(performance.now()-start>=timeout)return resolve(false);setTimeout(tick,70)};tick()})}
 const dismissHome=()=>{root.inert=true;document.body.dataset.entry='leaving';root.setAttribute('aria-hidden','true')};
 async function enterWork(){
  if(!booted||pending)return;
  const token=++generation;origin='work';pending=true;
  root.querySelector('#enter-work').setAttribute('aria-busy','true');
  if(!await waitForNative()){if(token===generation){pending=false;showHome();showFallback()}return}
  if(token!==generation)return;
  root.querySelector('#enter-work').removeAttribute('aria-busy');dismissHome();
  overviewVisited=true;nav({action:'overview'});
  await new Promise(r=>setTimeout(r,reduced()?0:620));
  if(token!==generation)return;pending=false;setMode('work');
 }
 async function open(key){
  if(!booted||pending)return;
  const token=++generation;if(mode!=='detail')origin=mode==='home'?'home':'work';pending=true;
  if(!await waitForNative()){if(token===generation){pending=false;showHome();showFallback()}return}
  if(token!==generation)return;dismissHome();nav({key});
  await new Promise(r=>setTimeout(r,reduced()?0:460));
  if(token!==generation)return;pending=false;setMode('detail');hadDetail=true;
 }
 function showHome(){if(!booted)return;generation++;pending=false;hadDetail=false;scheduledHome=false;origin='home';setMode('home');root.querySelector('#enter-work').removeAttribute('aria-busy');nav({key:'home'});root.querySelector('#enter-work').focus({preventScroll:true})}
 function showFallback(){let fallback=document.getElementById('studio-fallback');if(!fallback){fallback=document.createElement('p');fallback.id='studio-fallback';root.querySelector('.studio-intro').append(fallback)}fallback.textContent=copy().failed;fetch('/portfolio-data.json').then(r=>r.json()).then(d=>{if(!fallback.querySelector('a'))for(const p of d.projects.filter(p=>p.portfolioCase&&p.externalUrl)){const a=document.createElement('a');a.textContent=p.name;a.href=p.externalUrl;a.target='_blank';a.rel='noopener noreferrer';fallback.append(a)}}).catch(()=>{})}
 window.portfolioEntry=Object.freeze({get mode(){return mode},get ready(){return booted},enterWork,open,showHome});
 window.addEventListener('portfolio:nativehome',()=>{if(booted&&!pending&&mode!=='home'){generation++;origin='home';hadDetail=false;setMode('home')}});
 root.querySelector('#enter-work').onclick=enterWork;
 root.querySelectorAll('[data-desk-open]').forEach(button=>button.onclick=()=>open(button.dataset.deskOpen));
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
 // A deliberate downward gesture also leads from the introduction into Work.
 let wheelSum=0,wheelAt=0,touchStart=null;
 root.addEventListener('wheel',e=>{if(mode!=='home'||pending)return;e.preventDefault();const now=performance.now();if(now-wheelAt>300)wheelSum=0;wheelAt=now;wheelSum+=Math.max(0,e.deltaY);if(wheelSum>170){wheelSum=0;enterWork()}},{passive:false});
 document.addEventListener('wheel',e=>{if(pending){e.preventDefault();e.stopImmediatePropagation()}},{passive:false,capture:true});
 root.addEventListener('touchstart',e=>{touchStart=e.touches.length===1?e.touches[0].clientY:null},{passive:true});
 root.addEventListener('touchend',e=>{if(touchStart!==null&&touchStart-e.changedTouches[0].clientY>90&&mode==='home')enterWork();touchStart=null},{passive:true});
 document.addEventListener('keydown',e=>{if((e.key==='Home'||(e.key==='Escape'&&mode==='work'&&!window.portfolioRuntime?.focusedKey&&!window.portfolioRuntime?.helpOpen&&document.getElementById('work-list')?.hidden))&&!e.ctrlKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();showHome()}},true);
 setInterval(()=>{
  if(!booted||pending)return;
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
 const images=[...root.querySelectorAll('img'),...walker?.querySelectorAll('img')||[]],total=images.length+2;
 const loaderState=()=>Object.freeze({phase,ready:booted,completed,total,resourcesSettled,loadingFailed,skipped,finishReason,minimumDone,frame:Number(walker?.dataset.frame??frame),walking,walkerX,character:window.portfolioCharacter?.getState(),nativeReady:nativeReady(),elapsed:performance.now()-started});
 Object.defineProperty(window,'portfolioLoader',{configurable:true,value:Object.freeze({getState:loaderState})});
 const progress=()=>{if(!loader)return;loader.dataset.resources=resourcesSettled?'settled':'loading';const status=loader.querySelector('[data-loader-status]');if(status)status.textContent=loadingFailed?copy().slow:resourcesSettled?copy().ready:copy().load};
 const paintWalker=()=>{if(!walker)return;walker.dataset.frame=String(frame);walker.dataset.direction=direction<0?'left':'right';walker.style.transform=`translateX(${walkerX.toFixed(2)}px)`};
 const measureWalk=()=>{if(!walker)return;const left=parseFloat(getComputedStyle(walker).left)||20;walkLimit=Math.max(0,innerWidth-left-walker.offsetWidth);walkerX=Math.min(walkerX,walkLimit);paintWalker()};
 const walk=time=>{if(!walking)return;const seconds=Math.max(0,Math.min(100,time-lastWalkTime))/1000;lastWalkTime=Math.max(lastWalkTime,time);walkerX+=69*seconds*direction;if(walkerX>walkLimit){walkerX=Math.max(0,2*walkLimit-walkerX);direction=-1}else if(walkerX<0){walkerX=-walkerX;direction=1}if(!walkLimit)walkerX=0;frame=Math.floor(Math.max(0,time-started)/200)%5;paintWalker();walkFrameId=requestAnimationFrame(walk)};
 const touchCharacter=matchMedia('(pointer:coarse)').matches;
 const walkerCopy=()=>{if(!walker)return;walker.dataset.locale=I.locale;const words=({en:{loading:'Loading',scroll:touchCharacter?'Swipe':'Scroll',controls:'use wasd'},ro:{loading:'Se încarcă',scroll:touchCharacter?'Glisează':'Derulează',controls:'folosește WASD'},ru:{loading:'Загрузка',scroll:touchCharacter?'Смахните':'Прокрутите',controls:'клавиши WASD'}})[I.locale]||{};walker.querySelectorAll('[data-walker-copy]').forEach(el=>el.textContent=words[el.dataset.walkerCopy]||'');const hint=walker.querySelector('[data-walker-scroll]');if(hint&&touchCharacter)hint.src='/hero/walker/swipe.webp'};
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
  const park=()=>{walking=false;cancelAnimationFrame(walkFrameId);window.removeEventListener('resize',measureWalk);loader?.remove();phase='complete';window.portfolioCharacter?.start({x:walkerX,direction});};
  if(walker)walker.dataset.state='leaving';
  if(loader){loader.dataset.ready='true';loader.setAttribute('aria-hidden','true');loader.inert=true}
  if(staticIntro)park();else setTimeout(park,600);
  if(skipped&&!pathIsDetail)root.querySelector('#enter-work')?.focus({preventScroll:true});
 };
 const maybeFinish=()=>{if(resourcesSettled&&minimumDone)finish('ready')};
 if(!staticIntro)later(()=>{minimumDone=true;maybeFinish()},2000);
 if(loader){const enter=loader.querySelector('#loader-continue');if(enter)enter.onclick=()=>finish('skip');later(()=>{if(!booted){if(enter)enter.hidden=false;loader.querySelector('[data-loader-status]').textContent=copy().slow}},7000)}
 const tasks=images.map(img=>new Promise(resolve=>{let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok){loadingFailed=true;if(img.complete&&!img.naturalWidth){img.hidden=true;img.parentElement.dataset.failed='true'}}completed++;progress();resolve()};const decode=()=>img.decode().then(()=>done(true),()=>done(false));const timer=setTimeout(()=>done(false),10000);if(img.complete)decode();else{img.addEventListener('load',decode,{once:true});img.addEventListener('error',()=>done(false),{once:true})}}));
 tasks.push(new Promise(resolve=>{let settled=false;const done=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok)loadingFailed=true;completed++;progress();resolve()};const timer=setTimeout(()=>done(false),10000);Promise.resolve(document.fonts?.ready).then(()=>done(true),()=>done(false))}));
 tasks.push(waitForNative().then(ok=>{if(!ok)loadingFailed=true;completed++;progress()}));
 Promise.allSettled(tasks).then(()=>{resourcesSettled=true;progress();maybeFinish()});
})();
