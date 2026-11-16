(() => {
  const i18n=window.portfolioI18n, t=key=>i18n.t(key);
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-${name}"><path d="${({back:'M19 12H5m6-6-6 6 6 6',arrow:'M6 18 18 6M6 6h12v12',prev:'m14 6-6 6 6 6',next:'m10 6 6 6-6 6',work:'M4 5.5 19 4l1 13.5-15 1.2L4 5.5Zm1.2 3.6 14.2-1.2M8 21l9-1M7 6.9h.1m2.3-.2h.1',process:'m12 2 .2 20M2.6 7l18.8 10M3.1 17.7 17.8 3.8M4 3.8 16.9 20M2 12.1l20-1.2',about:'M10.4 12c-.6 5-2.1 7.6-4.1 7.4S3.1 16.1 3.5 11 5.7 3.4 7.8 3.7s3.2 3.2 2.6 8.3Zm10.1-.5c.6 4.9-.3 8.1-2.4 8.3s-3.9-2.5-4.5-7.5.4-8.1 2.5-8.3 3.8 2.5 4.4 7.5Z',contact:'M12.2 20C9.8 17.9 2.5 12.7 3.1 7.3c.5-4.5 6.4-5.6 9.1-.7C15.5 1.7 21.4 3.5 21 8c-.4 4.9-6.5 9.8-8.8 12Z',home:'m5 14 7-7 7 7M12 7v14'})[name]}"/>${name==='about'?'<g class="eye-pupils" fill="currentColor" stroke="none"><ellipse cx="7.1" cy="12.6" rx="1.5" ry="3.3"/><ellipse cx="17.4" cy="12.6" rx="1.5" ry="3.3"/></g>':''}</svg>`;
  const navigate = detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail }));
  const surface = detail => window.dispatchEvent(new CustomEvent('portfolio:surface', { detail }));
  fetch('/portfolio-data.json').then(r => r.json()).then(data => {
    data.projects=data.projects.map(i18n.project);
    const ui = document.createElement('div');
    ui.id = 'portfolio-ui';
    ui.innerHTML = `<button id="home-control" class="home-anchor" aria-label="${t('ui.homeLabel')}">Dumitru ${icon('home')}</button>
    <nav class="portfolio-nav" aria-label="${t('ui.navigation')}">
      <div class="index-wrap"><button id="work-toggle" class="nav-pill" aria-expanded="false" aria-controls="work-list">${icon('work')}<span data-copy="ui.work">${t('ui.work')}</span></button>
      <div id="work-list" hidden>${data.projects.filter(p => p.portfolioCase).map((p,i)=>`<button data-key="${p.key}"><span>${String(i+1).padStart(2,'0')}</span>${p.name}${icon('arrow')}</button>`).join('')}<p>${t('ui.concepts')}</p></div></div>
      <button id="process-control" class="nav-pill" data-key="process">${icon('process')}<span data-copy="ui.process">${t('ui.process')}</span></button>
      <button id="about-control" class="nav-pill" data-key="despre">${icon('about')}<span data-copy="ui.about">${t('ui.about')}</span></button>
      <a id="nav-contact" class="nav-pill" href="mailto:andrusciac.dumitru@gmail.com">${icon('contact')}<span data-copy="ui.contact">${t('ui.contact')}</span></a>
    </nav>
    <nav id="language-control" aria-label="${t('ui.languages')}">${[['en','English'],['ro','Română'],['ru','Русский']].map(([lang,label])=>`<button data-locale="${lang}" lang="${lang}" aria-label="${label}" aria-pressed="${lang===i18n.locale}">${lang.toUpperCase()}</button>`).join('')}</nav>
    <div id="project-controls" hidden>
      <button id="return-control" aria-label="${t('ui.return')}">${icon('back')}<span>${t('ui.back')}</span></button>
      <div class="material-controls" aria-label="${t('ui.materials')}">
        <button id="previous-material" aria-label="${t('ui.previous')}">${icon('prev')}</button>
        <div id="material-dots"></div>
        <button id="next-material" aria-label="${t('ui.next')}">${icon('next')}</button>
      </div>
      <a id="visit-control" target="_blank" rel="noopener noreferrer">${t('ui.visit')} ${icon('arrow')}</a>
    </div><p id="surface-announcement" class="sr-only" role="status" aria-live="polite"></p>`;
    document.body.append(ui);
    ui.querySelectorAll('[data-locale]').forEach(button=>button.onclick=()=>i18n.setLocale(button.dataset.locale));
    const updateCopy=()=>{
      ui.querySelector('.portfolio-nav').setAttribute('aria-label',t('ui.navigation'));
      ui.querySelectorAll('[data-copy]').forEach(node=>node.textContent=t(node.dataset.copy));
      ui.querySelector('#home-control').setAttribute('aria-label',t('ui.homeLabel'));
      ui.querySelector('#work-list p').textContent=t('ui.concepts');
      ui.querySelector('#return-control').setAttribute('aria-label',t('ui.return'));
      ui.querySelector('#return-control span').textContent=t('ui.back');
      ui.querySelector('.material-controls').setAttribute('aria-label',t('ui.materials'));
      ui.querySelector('#previous-material').setAttribute('aria-label',t('ui.previous'));
      ui.querySelector('#next-material').setAttribute('aria-label',t('ui.next'));
      ui.querySelector('#language-control').setAttribute('aria-label',t('ui.languages'));
      ui.querySelectorAll('[data-locale]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.locale===i18n.locale)));
    };
    const hideLegacyControls=()=>{
      document.querySelectorAll('[data-help-sticker],[data-sticker-link],[data-sticker="work"]').forEach(node=>{
        node.hidden=true;
        node.inert=true;
        node.tabIndex=-1;
        node.setAttribute('aria-hidden','true');
      });
    };
    hideLegacyControls();
    ui.querySelector('#home-control').onclick=()=>window.portfolioEntry?window.portfolioEntry.showHome():navigate({key:'home'});
    const workToggle = ui.querySelector('#work-toggle'), workList = ui.querySelector('#work-list');
    let returnFocus = workToggle, wasFocused = false, lastProject = null, requestedKey = null, keyboardOpen = false, pendingReturnFocus = null;
    const rememberOpener=(button,key,event)=>{if(!window.portfolioRuntime?.focusedKey)returnFocus=button;requestedKey=key;keyboardOpen=event.detail===0;pendingReturnFocus=null};
    const restoreFocus=()=>{
      if(!pendingReturnFocus||pendingReturnFocus.closest('[inert]'))return;
      if(!pendingReturnFocus.getClientRects().length)return;
      if(getComputedStyle(pendingReturnFocus).visibility==='hidden'){requestAnimationFrame(restoreFocus);return;}
      pendingReturnFocus.focus({preventScroll:true});
      if(document.activeElement===pendingReturnFocus)pendingReturnFocus=null;
    };
    // Home becomes inert before the native camera moves, so remember the
    // initiating object before that transition removes its keyboard focus.
    document.addEventListener('click',event=>{const button=event.target.closest('[data-desk-open]');if(button)rememberOpener(button,button.dataset.deskOpen,event)},true);
    addEventListener('portfolio:entrystate',restoreFocus);
    const measureSafeArea=()=>{
      const top=Math.max(...[ui.querySelector('.portfolio-nav'),ui.querySelector('#home-control'),ui.querySelector('#language-control')].map(el=>el.getBoundingClientRect().bottom))+12;
      const controls=ui.querySelector('#project-controls'),bounds=controls.hidden?null:controls.getBoundingClientRect(),bottom=bounds?bounds.top-12:innerHeight-80;
      window.portfolioSafeArea=Object.freeze({width:innerWidth,height:innerHeight,top,bottom,left:Math.max(18,bounds?bounds.left+6:18),right:Math.min(innerWidth-18,bounds?bounds.right-6:innerWidth-18)});
    };
    let layoutFrame=0;
    const scheduleMeasure=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(measureSafeArea)};
    const layoutObserver=new ResizeObserver(scheduleMeasure);
    [ui.querySelector('.portfolio-nav'),ui.querySelector('#project-controls'),ui.querySelector('#language-control')].forEach(el=>layoutObserver.observe(el));
    addEventListener('resize',scheduleMeasure);
    // The native focused key clears as return begins. Guard against a second
    // close, while allowing a newly opened project to close during that flight.
    const requestReturn=()=>{if(!data.projects.some(p=>p.key===window.portfolioRuntime?.focusedKey))return;navigate({action:'return'})};
    const closeIndex = () => {workList.hidden = true;workToggle.setAttribute('aria-expanded','false')};
    workToggle.onclick = () => {if(window.portfolioEntry&&(portfolioEntry.mode!=='work'||window.portfolioRuntime?.focusedKey)){closeIndex();portfolioEntry.enterWork();return}workList.hidden=!workList.hidden;workToggle.setAttribute('aria-expanded',String(!workList.hidden))};
    ui.querySelectorAll('[data-key]').forEach(button=>button.onclick=event=>{closeIndex();if(window.portfolioRuntime?.focusedKey!==button.dataset.key){rememberOpener(button.classList.contains('nav-pill')?button:workToggle,button.dataset.key,event);if(window.portfolioEntry)portfolioEntry.open(button.dataset.key);else navigate({key:button.dataset.key})}});
    ui.querySelector('#return-control').onclick=requestReturn;
    const changeMaterial=step=>{const key=window.portfolioRuntime?.focusedKey;if(window.portfolioSurfaces?.count(key))surface({key,step});else navigate({action:'material',step})};
    ui.querySelector('#previous-material').onclick=()=>changeMaterial(-1);
    ui.querySelector('#next-material').onclick=()=>changeMaterial(1);
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.index-wrap'))closeIndex()});
    document.addEventListener('keydown',e=>{
      const keyboardProject=window.portfolioRuntime?.focusedKey;
      if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!window.portfolioRuntime?.helpOpen&&(window.portfolioSurfaces?.count(keyboardProject)||(keyboardProject&&ui.contains(e.target)))){
        e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)changeMaterial(e.key==='ArrowLeft'?-1:1);return;
      }
      if(e.key!=='Escape')return;
      const state=window.portfolioRuntime;
      const focusedControl=ui.contains(e.target)&&state?.focusedKey;
      if(!state?.helpOpen&&workList.hidden&&!focusedControl)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if(e.repeat)return;
      if(state?.helpOpen){navigate({action:'help'});return;}
      if(!workList.hidden){closeIndex();workToggle.focus();return;}
      // Native Escape only blurs focused controls. Our project controls close
      // the project directly, matching Escape from the canvas.
      requestReturn();
    },true);
    let previous = '', displayedKey = '';
    const update = () => {
      hideLegacyControls();
      const state=window.portfolioRuntime;
      if(!state?.ready)return;
      const focusedProject=data.projects.find(p=>p.key===state.focusedKey);
      const returning=!!(!focusedProject&&lastProject&&(state.flight||state.moving));
      const project=focusedProject||(returning?lastProject:null);
      if(focusedProject)lastProject=focusedProject;
      const surfaceCount=window.portfolioSurfaces?.count(project?.key)||0;
      const index=surfaceCount?window.portfolioSurfaces.getIndex(project.key):state.materialIndex;
      const signature=[i18n.locale,state.focusedKey,returning,index,surfaceCount,state.materialCount,state.helpOpen,window.portfolioEntry?.mode].join('|');
      if(signature===previous)return;
      previous=signature;
      updateCopy();
      document.title=project?project.name+' | Dumitru':t('site.title');
      document.body.dataset.focus=project?'project':'space';
      document.body.dataset.project=project?.key||'';
      document.body.dataset.materialCount=project?String(project.images.length):'0';
      document.body.dataset.surface=surfaceCount?'true':'false';
      document.body.dataset.returning=String(returning);
      document.body.dataset.help=state.helpOpen?'open':'closed';
      ui.querySelector('#project-controls').hidden=!project;
      ui.querySelector('#about-control').setAttribute('aria-current',project?.key==='despre'?'page':'false');
      ui.querySelector('#process-control').setAttribute('aria-current',project?.key==='process'?'page':'false');
      workToggle.setAttribute('aria-current',window.portfolioEntry?.mode==='work'||project?.portfolioCase?'page':'false');
      if(!project){if(wasFocused)pendingReturnFocus=returnFocus;wasFocused=false;restoreFocus();return;}
      if(focusedProject&&requestedKey===project.key){if(keyboardOpen)ui.querySelector('#return-control').focus({preventScroll:true});requestedKey=null;keyboardOpen=false;}
      else if(!wasFocused)returnFocus=workToggle;
      wasFocused=true;
      const visit=ui.querySelector('#visit-control');
      visit.href=project.externalUrl||'mailto:andrusciac.dumitru@gmail.com';
      visit.innerHTML=(project.key==='despre'?t('ui.instagram'):project.portfolioCase?t('ui.visit'):t('ui.contact'))+' '+icon('arrow');
      const labels=surfaceCount?(project.key==='despre'?[t('ui.profile'),...Array.from({length:surfaceCount-1},(_,i)=>t('ui.photo')+' '+(i+1))]:t('process.steps').map(s=>s.title)):project.materialLabels;
      ui.querySelector('.material-controls').setAttribute('aria-label',project.key==='despre'?t('ui.photos'):project.key==='process'?t('ui.processSteps'):t('ui.materials'));
      ui.querySelector('#previous-material').setAttribute('aria-label',project.key==='despre'?t('ui.previousPhoto'):t('ui.previous'));
      ui.querySelector('#next-material').setAttribute('aria-label',project.key==='despre'?t('ui.nextPhoto'):t('ui.next'));
      const dots=ui.querySelector('#material-dots');
      if(displayedKey!==project.key+':'+i18n.locale){
        displayedKey=project.key+':'+i18n.locale;
        dots.innerHTML=labels.map((label,i)=>`<button aria-label="${label}" title="${label}" aria-pressed="${i===index}" data-material="${i}"><span>${project.key==='despre'?(i===0?t('ui.profile'):String(i)):String(i+1).padStart(2,'0')}</span></button>`).join('');
        dots.querySelectorAll('button').forEach(button=>button.onclick=()=>surfaceCount?surface({key:project.key,index:Number(button.dataset.material)}):navigate({action:'material',index:Number(button.dataset.material)}));
      }
      dots.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.material)===index)));
      // Reveal the selected touch tab without scrolling the document/camera.
      const selected=dots.querySelector('[aria-pressed="true"]');
      if(selected&&dots.scrollWidth>dots.clientWidth){const tab=selected.getBoundingClientRect(),strip=dots.getBoundingClientRect();if(tab.left<strip.left)dots.scrollLeft-=strip.left-tab.left;else if(tab.right>strip.right)dots.scrollLeft+=tab.right-strip.right;}
      measureSafeArea();
      ui.querySelector('#surface-announcement').textContent=surfaceCount?labels[index]:'';
    };
    i18n.subscribe(()=>{previous='';updateCopy();update()});
    updateCopy();update();setInterval(update,100);
  });
})();
