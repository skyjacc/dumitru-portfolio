(() => {
  const i18n=window.portfolioI18n, t=key=>i18n.t(key);
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-${name}"><path d="${({back:'M19 12H5m6-6-6 6 6 6',arrow:'M6 18 18 6M6 6h12v12',prev:'m14 6-6 6 6 6',next:'m10 6 6 6-6 6',work:'M4 5.5 19 4l1 13.5-15 1.2L4 5.5Zm1.2 3.6 14.2-1.2M8 21l9-1M7 6.9h.1m2.3-.2h.1',process:'m12 2 .2 20M2.6 7l18.8 10M3.1 17.7 17.8 3.8M4 3.8 16.9 20M2 12.1l20-1.2',about:'M10.4 12c-.6 5-2.1 7.6-4.1 7.4S3.1 16.1 3.5 11 5.7 3.4 7.8 3.7s3.2 3.2 2.6 8.3Zm10.1-.5c.6 4.9-.3 8.1-2.4 8.3s-3.9-2.5-4.5-7.5.4-8.1 2.5-8.3 3.8 2.5 4.4 7.5Z',contact:'M12.2 20C9.8 17.9 2.5 12.7 3.1 7.3c.5-4.5 6.4-5.6 9.1-.7C15.5 1.7 21.4 3.5 21 8c-.4 4.9-6.5 9.8-8.8 12Z',home:'m5 14 7-7 7 7M12 7v14'})[name]}"/>${name==='about'?'<g class="eye-pupils" fill="currentColor" stroke="none"><ellipse cx="7.1" cy="12.6" rx="1.5" ry="3.3"/><ellipse cx="17.4" cy="12.6" rx="1.5" ry="3.3"/></g>':''}</svg>`;
  const navigate = detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail }));
  const surface = detail => window.dispatchEvent(new CustomEvent('portfolio:surface', { detail }));
  const conceptLabels = {en:['Concept','Fictional concept'],ro:['Concept','Concept fictiv'],ru:['Концепт','Вымышленный проект']};
  const attribute = value => String(value||'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const paperArrow = direction => `<svg viewBox="0 0 48 28" aria-hidden="true" class="paper-arrow paper-arrow-${direction}"><path d="M4 17c11-5 22-5 38-4M31 4l12 9-12 10M5 18c15-4 25-4 37-4"/></svg>`;
  const materialPoster = source => source==='/assets/hero-bouquet-hd.mp4'?'/assets/projects/andra/bouquet-poster.webp':source?.endsWith('/bloom.mp4')?'/assets/projects/andra/bloom-poster.webp':source;
  fetch('/portfolio-data.json').then(r => r.json()).then(data => {
    data.projects=data.projects.map(i18n.project);
    const ui = document.createElement('div');
    ui.id = 'portfolio-ui';
    ui.innerHTML = `<button id="home-control" class="home-anchor" type="button" aria-label="${t('ui.homeLabel')}"><span class="home-signature">Dumitru</span></button>
    <nav class="portfolio-nav" aria-label="${t('ui.navigation')}">
      <div class="index-wrap"><button id="work-toggle" class="nav-pill" aria-expanded="false" aria-controls="work-list">${icon('work')}<span data-copy="ui.work">${t('ui.work')}</span></button>
      <div id="work-list" hidden>${data.projects.filter(p => p.portfolioCase).map((p,i)=>`<button data-key="${p.key}"><span>${String(i+1).padStart(2,'0')}</span>${p.name}${icon('arrow')}</button>`).join('')}<p>${t('ui.concepts')}</p></div></div>
      <button id="process-control" type="button" class="nav-pill" data-key="process" aria-expanded="false" aria-controls="studio-process">${icon('process')}<span data-copy="ui.process">${t('ui.process')}</span></button>
      <button id="about-control" type="button" class="nav-pill" data-key="despre" aria-expanded="false" aria-controls="studio-about">${icon('about')}<span data-copy="ui.about">${t('ui.about')}</span></button>
      <a id="nav-contact" class="nav-pill" href="mailto:andrusciac.dumitru@gmail.com">${icon('contact')}<span data-copy="ui.contact">${t('ui.contact')}</span></a>
    </nav>
    <nav id="language-control" aria-label="${t('ui.languages')}"><button id="language-toggle" class="nav-pill" type="button" commandfor="language-options" command="toggle-popover" aria-controls="language-options" aria-expanded="false" aria-label="${t('ui.languages')}"><svg class="language-globe" viewBox="0 0 28 28" aria-hidden="true"><path d="M25 13.3C25.4 20.4 20.2 25.4 13.3 25S2.4 20.2 3 13.6 8 2.8 14.8 3 24.3 6.7 25 13.3ZM4 11.3q10.5 4 20.5.6M4.8 18.6q9.6-3.2 19 .5M14.8 3q-9 11.6-1.5 22M14.8 3q9 12.6-1.5 22"/></svg><span data-language-current>${i18n.locale.toUpperCase()}</span><svg class="language-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg></button><div id="language-options" popover="auto" data-language-popover role="group" aria-label="${t('ui.languages')}">${[['en','English'],['ro','Română'],['ru','Русский']].map(([lang,label])=>`<button type="button" data-locale="${lang}" lang="${lang}" aria-pressed="${lang===i18n.locale}"><span>${label}</span><span class="language-choice-code" aria-hidden="true">${lang.toUpperCase()}</span></button>`).join('')}</div></nav>
    <div id="project-controls" hidden>
      <button id="return-control" hidden tabindex="-1" aria-label="${t('ui.return')}">${icon('back')}<span>${t('ui.back')}</span></button>
      <div class="material-controls" role="group" aria-label="${t('ui.materials')}">
        <button id="previous-material" type="button" aria-label="${t('ui.previous')}">${paperArrow('previous')}</button>
        <div id="material-dots"></div>
        <button id="next-material" type="button" aria-label="${t('ui.next')}">${paperArrow('next')}</button>
      </div>
      <div class="project-visit"><p id="project-kind"></p><a id="visit-control" target="_blank" rel="noopener noreferrer"><span>${t('ui.visit')}</span>${paperArrow('visit')}</a></div>
    </div><p id="surface-announcement" class="sr-only" role="status" aria-live="polite"></p>`;
    document.body.append(ui);
    const languageToggle=ui.querySelector('#language-toggle'),languageOptions=ui.querySelector('#language-options');
    const nativePopover='popover' in HTMLElement.prototype;
    const languageOpen=()=>nativePopover?languageOptions.matches(':popover-open'):!languageOptions.hidden;
    const positionLanguages=()=>{const r=languageToggle.getBoundingClientRect();languageOptions.style.left=Math.max(8,Math.min(innerWidth-198,r.right-190))+'px';languageOptions.style.top=(r.bottom+8)+'px'};
    const closeLanguages=(focus=false)=>{if(nativePopover){if(languageOpen())languageOptions.hidePopover()}else languageOptions.hidden=true;languageToggle.setAttribute('aria-expanded','false');if(focus)languageToggle.focus({preventScroll:true})};
    const fallbackToggle=()=>{positionLanguages();if(nativePopover)languageOptions.togglePopover();else{languageOptions.hidden=!languageOptions.hidden;languageToggle.setAttribute('aria-expanded',String(!languageOptions.hidden))}};
    if(nativePopover){
      languageOptions.addEventListener('beforetoggle',e=>{if(e.newState==='open')positionLanguages()});
      languageOptions.addEventListener('toggle',()=>languageToggle.setAttribute('aria-expanded',String(languageOpen())));
      if(!('commandForElement' in HTMLButtonElement.prototype))import('/vendor/invokers-polyfill-1.0.4.mjs').catch(()=>{languageToggle.onclick=fallbackToggle});
    }else{languageOptions.removeAttribute('popover');languageOptions.hidden=true;languageOptions.dataset.fallback='true';languageToggle.removeAttribute('commandfor');languageToggle.removeAttribute('command');languageToggle.onclick=fallbackToggle;}
    document.addEventListener('pointerdown',e=>{if(!nativePopover&&!e.target.closest('#language-control'))closeLanguages()});
    window.addEventListener('keydown',e=>{
      if(!languageOpen())return;
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeLanguages(true);return;}
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
        e.preventDefault();e.stopImmediatePropagation();const choices=[...languageOptions.querySelectorAll('button')],current=choices.indexOf(document.activeElement);
        const next=e.key==='Home'?0:e.key==='End'?choices.length-1:(current+(e.key==='ArrowUp'?-1:1)+choices.length)%choices.length;choices[next].focus();
      }
    },true);
    addEventListener('resize',()=>{if(languageOpen())positionLanguages()});addEventListener('portfolio:entrystate',()=>closeLanguages());
    ui.querySelectorAll('[data-locale]').forEach(button=>button.onclick=()=>{closeLanguages(true);i18n.setLocale(button.dataset.locale)});
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
      languageToggle.setAttribute('aria-label',t('ui.languages'));languageOptions.setAttribute('aria-label',t('ui.languages'));
      ui.querySelector('[data-language-current]').textContent=i18n.locale.toUpperCase();
      ui.querySelectorAll('[data-locale]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.locale===i18n.locale)));
    };
    const hideLegacyControls=()=>{
      document.querySelectorAll('[data-help-sticker],[data-help-link],[data-sticker-link],[data-sticker="work"]').forEach(node=>{
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
      const controls=ui.querySelector('#project-controls'),rect=controls.hidden?null:controls.getBoundingClientRect(),bounds=rect?.width>0&&rect?.height>0?rect:null,bottom=bounds?bounds.top-24:innerHeight-(window.portfolioEntry?.mode==='about'?20:80);
      window.portfolioSafeArea=Object.freeze({width:innerWidth,height:innerHeight,top,bottom,left:Math.max(18,bounds?bounds.left+6:18),right:Math.min(innerWidth-18,bounds?bounds.right-6:innerWidth-18)});
      dispatchEvent(new CustomEvent('portfolio:safearea',{detail:window.portfolioSafeArea}));
    };
    let layoutFrame=0;
    const scheduleMeasure=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(measureSafeArea)};
    const layoutObserver=new ResizeObserver(scheduleMeasure);
    [ui.querySelector('.portfolio-nav'),ui.querySelector('#project-controls'),ui.querySelector('#language-control')].forEach(el=>layoutObserver.observe(el));
    addEventListener('resize',scheduleMeasure);
    addEventListener('portfolio:entrystate',scheduleMeasure);
    // The native focused key clears as return begins. Guard against a second
    // close, while allowing a newly opened project to close during that flight.
    const requestReturn=()=>{if(!data.projects.some(p=>p.key===window.portfolioRuntime?.focusedKey))return;navigate({action:'return'})};
    const closeIndex = () => {workList.hidden = true;workToggle.setAttribute('aria-expanded','false')};
    workToggle.onclick = () => {if(window.portfolioEntry&&(portfolioEntry.mode!=='work'||window.portfolioRuntime?.focusedKey)){closeIndex();portfolioEntry.enterWork();return}workList.hidden=!workList.hidden;workToggle.setAttribute('aria-expanded',String(!workList.hidden))};
    ui.querySelectorAll('[data-key]').forEach(button=>button.onclick=event=>{closeIndex();const key=button.dataset.key;if(key==='process'||key==='despre'||window.portfolioRuntime?.focusedKey!==key){rememberOpener(button.classList.contains('nav-pill')?button:workToggle,key,event);if(window.portfolioEntry)portfolioEntry.open(key);else navigate({key})}});
    ui.querySelector('#return-control').onclick=requestReturn;
    const changeMaterial=step=>{const key=window.portfolioRuntime?.focusedKey;if(window.portfolioSurfaces?.count(key))surface({key,step});else navigate({action:'material',step})};
    ui.querySelector('#previous-material').onclick=()=>changeMaterial(-1);
    ui.querySelector('#next-material').onclick=()=>changeMaterial(1);
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.index-wrap'))closeIndex()});
    document.addEventListener('keydown',e=>{
      if(languageOpen())return;
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
    let previous = '', displayedKey = '', announcedSelection = '';
    const update = () => {
      hideLegacyControls();
      const state=window.portfolioRuntime;
      if(!state?.ready)return;
      const customProcess=window.portfolioEntry?.mode==='process',customAbout=window.portfolioEntry?.mode==='about',customSurface=customProcess||customAbout;
      const focusedProject=customSurface?null:data.projects.find(p=>p.key===state.focusedKey);
      const returning=!customSurface&&!!(!focusedProject&&lastProject&&(state.flight||state.moving));
      const project=focusedProject||(returning?lastProject:null);
      if(focusedProject)lastProject=focusedProject;
      const surfaceCount=window.portfolioSurfaces?.count(project?.key)||0;
      const index=surfaceCount?window.portfolioSurfaces.getIndex(project.key):state.materialIndex;
      const intended=document.body.dataset.entryTarget;
      const signature=[i18n.locale,state.focusedKey,returning,index,surfaceCount,state.materialCount,state.helpOpen,!!state.moving,window.portfolioEntry?.mode,intended].join('|');
      if(signature===previous)return;
      previous=signature;
      updateCopy();
      document.title=customSurface?t(customAbout?'ui.about':'ui.process')+' | Dumitru':project?project.name+' | Dumitru':t('site.title');
      document.body.dataset.focus=project?'project':'space';
      document.body.dataset.project=project?.key||'';
      document.body.dataset.materialCount=project?String(project.images.length):'0';
      document.body.dataset.surface=surfaceCount?'true':'false';
      document.body.dataset.returning=String(returning);
      document.body.dataset.help=state.helpOpen?'open':'closed';
      ui.querySelector('#project-controls').hidden=!project;
      // Share discrete native changes with the character; it needs no idle poller.
      dispatchEvent(new CustomEvent('portfolio:projectstate',{detail:{key:focusedProject?.key||null,materialIndex:index,moving:!!state.moving,mode:window.portfolioEntry?.mode||'work'}}));
      const processActive=intended==='process'||!intended&&(customProcess||project?.key==='process');
      const aboutActive=intended==='about'||!intended&&(customAbout||project?.key==='despre');
      ui.querySelector('#process-control').setAttribute('aria-current',processActive?'page':'false');
      ui.querySelector('#process-control').setAttribute('aria-expanded',String(!!processActive));
      workToggle.setAttribute('aria-current',intended==='work'||!intended&&(window.portfolioEntry?.mode==='work'||project?.portfolioCase)?'page':'false');
      ui.querySelector('#about-control').setAttribute('aria-current',aboutActive?'page':'false');
      ui.querySelector('#about-control').setAttribute('aria-expanded',String(!!aboutActive));
      if(customSurface)return;
      if(!project){if(wasFocused)pendingReturnFocus=returnFocus;wasFocused=false;restoreFocus();return;}
      if(focusedProject&&requestedKey===project.key){if(keyboardOpen)(ui.querySelector('#studio-back')||workToggle).focus({preventScroll:true});requestedKey=null;keyboardOpen=false;}
      else if(!wasFocused)returnFocus=workToggle;
      wasFocused=true;
      const visit=ui.querySelector('#visit-control');
      visit.href=project.externalUrl||'mailto:andrusciac.dumitru@gmail.com';
      const visitLabel=project.key==='despre'?t('ui.instagram'):project.portfolioCase?t('ui.visit'):t('ui.contact');
      visit.innerHTML='<span>'+visitLabel.split(/\s+/).map(word=>'<span class="visit-word">'+attribute(word)+'</span>').join(' ')+'</span>'+paperArrow('visit');
      visit.setAttribute('aria-label',visitLabel+' — '+project.name+t('native.newTab'));
      const kind=ui.querySelector('#project-kind'),shortKind=conceptLabels[i18n.locale]||conceptLabels.en;
      kind.textContent=project.portfolioCase?shortKind[project.type===t('type.fictional')?1:0]:'';
      kind.title=project.portfolioCase?project.type:'';
      const labels=surfaceCount?(project.key==='despre'?[t('ui.profile'),...Array.from({length:surfaceCount-1},(_,i)=>t('ui.photo')+' '+(i+1))]:t('process.steps').map(s=>s.title)):project.materialLabels;
      ui.querySelector('.material-controls').setAttribute('aria-label',project.key==='despre'?t('ui.photos'):project.key==='process'?t('ui.processSteps'):t('ui.materials'));
      ui.querySelector('#previous-material').setAttribute('aria-label',project.key==='despre'?t('ui.previousPhoto'):t('ui.previous'));
      ui.querySelector('#next-material').setAttribute('aria-label',project.key==='despre'?t('ui.nextPhoto'):t('ui.next'));
      const dots=ui.querySelector('#material-dots');
      if(displayedKey!==project.key+':'+i18n.locale){
        displayedKey=project.key+':'+i18n.locale;
        dots.innerHTML=labels.map((label,i)=>`<button type="button" class="material-print" aria-label="${i+1} / ${labels.length} · ${attribute(label)}" title="${attribute(label)}" aria-pressed="${i===index}" data-material="${i}"><span class="material-paper" aria-hidden="true"><img src="${attribute(materialPoster(project.images[i]||project.images[0]))}" alt="" width="72" height="46" decoding="async" draggable="false"><span class="material-number">${i+1}</span></span><svg class="material-selected-mark" viewBox="0 0 32 12" aria-hidden="true"><path d="M2 7c5-7 25-8 28-3s-15 9-22 5C1 5 15 1 25 3"/></svg></button>`).join('');
        dots.querySelectorAll('button').forEach(button=>button.onclick=()=>surfaceCount?surface({key:project.key,index:Number(button.dataset.material)}):navigate({action:'material',index:Number(button.dataset.material)}));
      }
      dots.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.material)===index)));
      // Reveal the selected touch tab without scrolling the document/camera.
      const selected=dots.querySelector('[aria-pressed="true"]');
      if(selected&&dots.scrollWidth>dots.clientWidth){const tab=selected.getBoundingClientRect(),strip=dots.getBoundingClientRect();if(tab.left<strip.left)dots.scrollLeft-=strip.left-tab.left;else if(tab.right>strip.right)dots.scrollLeft+=tab.right-strip.right;}
      measureSafeArea();
      const selection=project.key+':'+i18n.locale+':'+index;
      if(!returning&&!state.moving&&selection!==announcedSelection){
        ui.querySelector('#surface-announcement').textContent=announcedSelection.startsWith(project.key+':')?`${index+1} / ${labels.length} · ${labels[index]}`:'';
        announcedSelection=selection;
      }
    };
    i18n.subscribe(()=>{previous='';updateCopy();update()});
    updateCopy();update();setInterval(update,100);
  });
})();
