(() => {
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${({back:'M19 12H5m6-6-6 6 6 6',arrow:'M6 18 18 6M6 6h12v12',prev:'m14 6-6 6 6 6',next:'m10 6 6 6-6 6'})[name]}"/></svg>`;
  const navigate = detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail }));
  fetch('/portfolio-data.json').then(r => r.json()).then(data => {
    const ui = document.createElement('div');
    ui.id = 'portfolio-ui';
    ui.innerHTML = `<nav class="portfolio-nav" aria-label="Navigare principală">
      <div class="index-wrap"><button id="work-toggle" aria-expanded="false" aria-controls="work-list">Lucrări <sup>05</sup></button>
      <div id="work-list" hidden>${data.projects.filter(p => p.portfolioCase).map((p,i)=>`<button data-key="${p.key}"><span>0${i+1}</span>${p.name}${icon('arrow')}</button>`).join('')}<p>Concepte independente · 2026</p></div></div>
      <button id="about-control" data-key="despre">Despre</button>
      <a id="contact-control" href="mailto:andrusciac.dumitru@gmail.com">Contact ${icon('arrow')}</a>
    </nav>
    <div id="project-controls" hidden>
      <button id="return-control" aria-label="Înapoi în spațiu">${icon('back')}<span>Înapoi</span></button>
      <div class="material-controls" aria-label="Materiale">
        <button id="previous-material" aria-label="Materialul anterior">${icon('prev')}</button>
        <div id="material-dots"></div>
        <button id="next-material" aria-label="Materialul următor">${icon('next')}</button>
      </div>
      <a id="visit-control" target="_blank" rel="noopener noreferrer">Vezi site-ul ${icon('arrow')}</a>
    </div>`;
    document.body.append(ui);
    const workToggle = ui.querySelector('#work-toggle'), workList = ui.querySelector('#work-list');
    let returnFocus = workToggle, wasFocused = false;
    const closeIndex = () => {workList.hidden = true;workToggle.setAttribute('aria-expanded','false')};
    workToggle.onclick = () => {workList.hidden=!workList.hidden;workToggle.setAttribute('aria-expanded',String(!workList.hidden))};
    ui.querySelectorAll('[data-key]').forEach(button=>button.onclick=()=>{returnFocus=button.id==='about-control'?button:workToggle;closeIndex();navigate({key:button.dataset.key})});
    ui.querySelector('#return-control').onclick=()=>navigate({action:'return'});
    ui.querySelector('#previous-material').onclick=()=>navigate({action:'material',step:-1});
    ui.querySelector('#next-material').onclick=()=>navigate({action:'material',step:1});
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.index-wrap'))closeIndex()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!workList.hidden){e.stopImmediatePropagation();closeIndex();workToggle.focus()}},true);
    let previous = '', displayedKey = '';
    const update = () => {
      const state=window.portfolioRuntime;
      if(!state?.ready)return;
      const signature=[state.focusedKey,state.materialIndex,state.materialCount].join('|');
      if(signature===previous)return;
      previous=signature;
      const project=data.projects.find(p=>p.key===state.focusedKey);
      document.body.dataset.focus=project?'project':'space';
      ui.querySelector('#project-controls').hidden=!project;
      ui.querySelector('#about-control').setAttribute('aria-current',project?.key==='despre'?'page':'false');
      if(!project){if(wasFocused)returnFocus.focus({preventScroll:true});wasFocused=false;return;}
      wasFocused=true;
      const visit=ui.querySelector('#visit-control');
      visit.href=project.externalUrl||'mailto:andrusciac.dumitru@gmail.com';
      visit.innerHTML=(project.portfolioCase?'Vezi site-ul':'Să vorbim')+' '+icon('arrow');
      const dots=ui.querySelector('#material-dots');
      if(displayedKey!==project.key){
        displayedKey=project.key;
        dots.innerHTML=project.images.map((_,i)=>`<button aria-label="${project.materialLabels[i]}" title="${project.materialLabels[i]}" aria-pressed="${i===state.materialIndex}" data-material="${i}"><span>${String(i+1).padStart(2,'0')}</span></button>`).join('');
        dots.querySelectorAll('button').forEach(button=>button.onclick=()=>navigate({action:'material',index:Number(button.dataset.material)}));
      }
      dots.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.material)===state.materialIndex)));
    };
    update();setInterval(update,100);
  });
})();
