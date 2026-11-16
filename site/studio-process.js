/* Authored Process content; the entry controller owns scene/camera navigation. */
(() => {
  const copy = {
    en: {
      title: 'How I work', back: 'Back',
      steps: [
        ['Getting to know you', 'We start with your business, your audience and what the website should do. Together, we sort the content and decide what matters most.'],
        ['Finding the direction', 'I explore layouts, type and a visual direction. You see an early concept, and we refine it together before building the full site.'],
        ['Making it work', 'I turn the design into a working website, with responsive layouts, thoughtful motion and careful attention to detail on desktop and mobile.'],
        ['Checking & going live', 'We test the pages and contact flow, then prepare the launch. Domain connection, basic SEO and indexing setup can be included in the agreed scope.'],
        ['Handing it over', 'I walk you through the finished site and how to keep it up to date. We agree on any ongoing help and future improvements separately.']
      ]
    },
    ro: {
      title: 'Cum lucrez', back: 'Înapoi',
      steps: [
        ['Să ne cunoaștem', 'Pornim de la afacerea ta, publicul tău și rolul site-ului. Organizăm conținutul și stabilim împreună ce contează cel mai mult.'],
        ['Găsim direcția', 'Explorez structura, tipografia și stilul vizual. Vezi un prim concept, apoi îl ajustăm împreună înainte de a construi întregul site.'],
        ['Construim site-ul', 'Transform designul într-un site funcțional, cu pagini adaptive, animații și atenție la detalii pe desktop și mobil.'],
        ['Testăm și lansăm', 'Verificăm paginile și modul de contact, apoi pregătim lansarea. Conectarea domeniului, SEO de bază și indexarea pot face parte din oferta agreată.'],
        ['Predare și pașii următori', 'Îți arăt site-ul final și cum îl poți menține actualizat. Stabilim separat orice ajutor ulterior și eventualele îmbunătățiri.']
      ]
    },
    ru: {
      title: 'Как я работаю', back: 'Назад',
      steps: [
        ['Знакомимся', 'Обсуждаем твой бизнес, аудиторию и задачу сайта. Собираем материалы и вместе решаем, что посетителю нужно увидеть в первую очередь.'],
        ['Находим направление', 'Подбираю структуру, шрифты и визуальный стиль. Показываю первый концепт и дорабатываю его вместе с тобой до сборки всего сайта.'],
        ['Собираем сайт', 'Превращаю дизайн в работающий сайт: адаптирую страницы для компьютера и телефона, добавляю анимации и прорабатываю детали.'],
        ['Проверяем и запускаем', 'Проверяем страницы и путь до обращения, готовим запуск. Подключение домена, базовое SEO и настройку индексации можем включить в согласованный объём.'],
        ['Передаём и развиваем', 'Показываю готовый сайт и объясняю, как поддерживать его в актуальном состоянии. Дальнейшую помощь и новые возможности обсуждаем отдельно.']
      ]
    }
  };
  const mobile = matchMedia('(max-width: 680px)');
  const canFindHidden = 'onbeforematch' in HTMLElement.prototype;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  let panel, rows = [], backButton, title, content, track, followRing;
  let active = 0, opened = 0, visible = false, onBack = null, showFrame = 0, measureFrame = 0;
  let ringRotation = 0, driftTarget = 0, driftAnimation = null;
  const closeTimers = new Map();
  const locale = () => window.portfolioI18n?.locale || 'en';
  const words = () => copy[locale()] || copy.en;
  function positionRing() {
    if (!visible || !followRing || mobile.matches) return;
    const number = rows[active].querySelector('.process-step-number');
    // Layout offsets exclude the row entrance transform and the shared drift.
    // The circle therefore aims at the same number throughout both animations.
    let node = number, x = 0, y = 0;
    while (node && node !== track) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
    followRing.style.setProperty('--circle-x', `${x + (number.offsetWidth - followRing.offsetWidth) / 2}px`);
    followRing.style.setProperty('--circle-y', `${y + (number.offsetHeight - followRing.offsetHeight) / 2}px`);
    followRing.style.setProperty('--circle-rotation', `${ringRotation}deg`);
  }
  function scheduleRing() {
    cancelAnimationFrame(measureFrame);
    measureFrame = requestAnimationFrame(() => { measureFrame = 0; positionRing(); });
  }
  function setDrift(animate = true) {
    if (!content) return;
    const nextTarget = mobile.matches || !finePointer.matches ? 0 : -active / Math.max(1, rows.length - 1) * 35;
    if (animate && nextTarget === driftTarget) return;
    driftTarget = nextTarget;
    const current = Number.parseFloat(getComputedStyle(content).translate.split(' ')[1]) || 0;
    driftAnimation?.cancel(); driftAnimation = null;
    content.style.translate = `0 ${driftTarget}px`;
    if (!animate || reducedMotion || !visible || Math.abs(current - driftTarget) < .01) return;
    // Reference md(): 1.2s power2.out. Samples preserve its exact cubic curve
    // while keeping all motion on the compositor and allowing interruption.
    const frames = Array.from({length: 49}, (_, index) => {
      const progress = index / 48, ease = 1 - (1 - progress) ** 3;
      return {translate: `0 ${current + (driftTarget - current) * ease}px`, offset: progress};
    });
    const animation = content.animate(frames, {duration: 1200, easing: 'linear'});
    driftAnimation = animation;
    animation.finished.catch(() => {}).finally(() => { if (driftAnimation === animation) driftAnimation = null; });
  }
  function clearCloseTimer(description) {
    clearTimeout(closeTimers.get(description)); closeTimers.delete(description);
  }
  function paintState() {
    if (!panel) return;
    panel.dataset.activeStep = String(active);
    for (const [index, row] of rows.entries()) {
      const button = row.querySelector('button'), description = row.querySelector('.process-step-description');
      const wasOpen = row.dataset.expanded === 'true';
      row.dataset.active = String(index === active);
      if (mobile.matches && canFindHidden) {
        const expanded = index === opened;
        button.removeAttribute('aria-pressed');
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-controls', description.id);
        // These descriptions contain only text. Keep find-in-page available
        // through hidden="until-found"; inert would suppress beforematch.
        description.setAttribute('aria-hidden', String(!expanded));
        row.dataset.expanded = String(expanded);
        if (expanded) { clearCloseTimer(description); description.hidden = false; }
        else if (wasOpen && visible && !reducedMotion) {
          clearCloseTimer(description);
          description.hidden = false;
          closeTimers.set(description, setTimeout(() => {
            closeTimers.delete(description);
            if (mobile.matches && row.dataset.expanded !== 'true') description.hidden = 'until-found';
          }, 440));
        } else if (!closeTimers.has(description)) description.hidden = 'until-found';
      } else {
        clearCloseTimer(description);
        button.removeAttribute('aria-expanded');
        button.removeAttribute('aria-controls');
        button.setAttribute('aria-pressed', String(index === active));
        row.dataset.expanded = 'true';
        description.inert = false;
        description.removeAttribute('aria-hidden');
        description.hidden = false;
      }
      row.querySelector('.process-step-toggle').textContent = index === opened ? '−' : '+';
    }
    scheduleRing();
  }
  function select(index, toggle = false) {
    if (!Number.isInteger(index) || index < 0 || index >= rows.length) return;
    if (index !== active) ringRotation += index > active ? 30 : -30;
    active = index;
    if (mobile.matches && canFindHidden) opened = toggle && opened === index ? -1 : index;
    else opened = index;
    paintState();
    setDrift();
  }
  function translate() {
    if (!panel) return;
    const content = words();
    panel.lang = locale();
    title.textContent = content.title;
    backButton.querySelector('span').textContent = content.back;
    content.steps.forEach(([heading, body], index) => {
      rows[index].querySelector('.process-step-title').textContent = heading;
      rows[index].querySelector('.process-step-description p').textContent = body;
    });
    paintState();
  }
  function finishEntrance() {
    if (!panel) return;
    panel.classList.remove('is-process-entering');
    panel.dataset.ringVisible = String(visible);
    positionRing();
  }
  function mount(host) {
    if (panel) return panel;
    if (!(host instanceof HTMLElement)) throw new TypeError('Process needs its scene host');
    reducedMotion = motionPreference.matches;
    panel = document.createElement('section');
    panel.id = 'studio-process';
    panel.dataset.searchFallback = String(!canFindHidden);
    panel.setAttribute('aria-labelledby', 'studio-process-title');
    panel.hidden = true;
    panel.inert = true;
    panel.innerHTML = `<div class="process-paper-content"><header class="process-paper-heading"><h2 id="studio-process-title"></h2><button type="button" class="process-back"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg><span></span></button></header><div class="process-list-track"><span class="process-follow-ring" aria-hidden="true"><img src="/assets/nav-reference/process-circle.webp" width="320" height="320" alt="" draggable="false"></span><ol class="process-steps">${Array.from({length: 5}, (_, index) => `<li class="process-step" style="--step-index:${index}"><h3><button type="button"><span class="process-step-number" aria-hidden="true"><span>${index + 1}</span></span><span class="process-step-title"></span><span class="process-step-toggle" aria-hidden="true">+</span></button></h3><div class="process-step-description" id="process-description-${index}"><div class="process-step-description-inner"><p></p></div></div></li>`).join('')}</ol></div></div>`;
    host.append(panel);
    content = panel.querySelector('.process-paper-content');
    track = panel.querySelector('.process-list-track');
    followRing = panel.querySelector('.process-follow-ring');
    rows = [...panel.querySelectorAll('.process-step')];
    backButton = panel.querySelector('.process-back');
    title = panel.querySelector('#studio-process-title');
    backButton.addEventListener('click', () => { if (visible) onBack?.(); });
    rows.forEach((row, index) => {
      row.querySelector('button').addEventListener('click', () => select(index, true));
      row.addEventListener('pointerenter', () => { if (!mobile.matches && finePointer.matches) select(index); });
      row.querySelector('button').addEventListener('focus', () => { if (!mobile.matches) select(index); });
      row.querySelector('.process-step-description').addEventListener('beforematch', () => select(index));
    });
    // This is a scrollable part of the scene, not a gesture for changing scenes.
    panel.addEventListener('wheel', event => event.stopPropagation(), {passive: true});
    panel.addEventListener('touchstart', event => event.stopPropagation(), {passive: true});
    panel.addEventListener('touchmove', event => event.stopPropagation(), {passive: true});
    panel.addEventListener('touchend', event => event.stopPropagation(), {passive: true});
    panel.addEventListener('animationend', event => {
      if (!visible || event.animationName !== 'studioProcessStepIn') return;
      if (event.target === rows[0]) { panel.dataset.ringVisible = 'true'; positionRing(); }
      if (event.target === rows[rows.length - 1]) finishEntrance();
    });
    mobile.addEventListener('change', () => { paintState(); setDrift(false); });
    motionPreference.addEventListener('change', event => {
      reducedMotion = event.matches;
      if (reducedMotion) { finishEntrance(); setDrift(false); for (const item of closeTimers.keys()) clearCloseTimer(item); paintState(); }
    });
    new ResizeObserver(scheduleRing).observe(track);
    document.fonts?.ready.then(scheduleRing);
    window.portfolioI18n?.subscribe(translate);
    translate();
    return panel;
  }
  function show(options = {}) {
    if (!panel) mount(document.getElementById('studio-home'));
    cancelAnimationFrame(showFrame);
    onBack = typeof options.onBack === 'function' ? options.onBack : null;
    visible = true;
    panel.hidden = false;
    panel.inert = false;
    panel.scrollTop = 0;
    panel.dataset.ringVisible = 'false';
    panel.classList.remove('is-process-entering');
    driftTarget = 0;
    content.style.translate = '0 0';
    translate();
    showFrame = requestAnimationFrame(() => {
      if (!visible) return;
      panel.dataset.visible = 'true';
      positionRing();
      if (reducedMotion) finishEntrance();
      else panel.classList.add('is-process-entering');
      backButton.focus({preventScroll: true});
    });
  }
  function hide() {
    if (!panel) return;
    visible = false;
    cancelAnimationFrame(showFrame);
    cancelAnimationFrame(measureFrame); measureFrame = 0;
    driftAnimation?.cancel(); driftAnimation = null;
    for (const item of closeTimers.keys()) clearCloseTimer(item);
    panel.classList.remove('is-process-entering');
    panel.dataset.ringVisible = 'false';
    panel.dataset.visible = 'false';
    panel.inert = true;
    panel.hidden = true;
    onBack = null;
  }
  window.portfolioProcess = Object.freeze({
    mount, show, hide,
    getState: () => Object.freeze({visible, active, opened: mobile.matches && canFindHidden ? opened : null, mobile: mobile.matches, searchFallback: !canFindHidden, locale: locale(), entering: !!panel?.classList.contains('is-process-entering'), ringRotation, driftTarget, drifting: !!driftAnimation})
  });
})();
