(() => {
  'use strict';
  const asset = name => `/assets/nav-reference/${name}`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  // The change handler owns both the preference and the neutral reset.
  // Do not poll this MediaQueryList inside active animation callbacks.
  let reducedMotion = reduced.matches;
  const canMove = () => !reducedMotion && hover.matches && !document.hidden;
  const inOut = x => x < .5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2;
  const random = (a, b) => a + Math.random() * (b - a);
  const idlePath = [44,13,47.66,17,48.22,21.33,47,24.96,45.77,28.59,42.77,31.51,39.33,32.7,35.88,33.88,32,33.33,29,30,22,22,37,10,40,19,41,22,39.66,24.55,37.14,26.4,34.62,28.25,30.92,29.4,27.18,29.59,23.44,29.77,19.66,29,17,27,11,23,9,22.25,5,20];
  const longPath = [44,20.84,34.13,20.87,24.34,19.35,14.51,18.44,2.22,17.3,-10.13,17.1,-22.45,16.39,-33.58,15.74,-44.67,14.67,-55.8,14.05,-77.03,12.87,-98.15,17.01,-119.12,20.52,-129.78,22.3,-140.47,23.93,-151.18,25.4,-157.64,26.29,-164.17,27.13,-170.69,26.74,-178.49,26.28,-186.09,24.07,-193.86,23.28,-199.22,22.74,-204.62,22.87,-210,23];
  const makePath = values => `M${values[0]} ${values[1]} ` + Array.from({ length: 8 }, (_, i) => `C${values.slice(2 + i * 6, 8 + i * 6).join(' ')}`).join(' ');
  const picture = (name, cls, width, height) => `<img src="${asset(name)}" class="${cls}" width="${width}" height="${height}" alt="" draggable="false">`;
  let mounted = false;

  function mount() {
    const ui = document.getElementById('portfolio-ui');
    const nav = ui?.querySelector('.portfolio-nav');
    if (!nav || !window.portfolioI18n || mounted) return false;
    mounted = true;
    reducedMotion = reduced.matches;
    const i18n = window.portfolioI18n;
    nav.classList.add('studio-nav');
    const work = nav.querySelector('#work-toggle');
    const about = nav.querySelector('#about-control');
    const replace = (button, html) => {
      const holder = document.createElement('span');
      holder.className = 'studio-nav-icon';
      holder.setAttribute('aria-hidden', 'true');
      holder.innerHTML = html;
      button.querySelector(':scope > svg')?.replaceWith(holder);
      return holder;
    };
    const hammerBox = replace(work, `<span class="studio-hammer-offset">${picture('hammer.png', 'studio-hammer', 285, 450)}</span>`);
    hammerBox.classList.add('studio-hammer-box');
    // Keep the original drawing. Each pupil is clipped by its own eye opening.
    const eyeBox = replace(about, `<svg class="studio-eye-art" viewBox="0 0 320 252" aria-hidden="true"><defs><clipPath id="studio-eye-left"><path d="M78 25C51 51 23 84 20 120C16 153 34 205 64 227C94 203 118 164 118 120C118 78 101 39 78 25Z"/></clipPath><clipPath id="studio-eye-right"><path d="M218 23C207 44 199 78 201 118C204 163 232 202 268 220C292 194 298 151 291 114C285 67 257 27 218 23Z"/></clipPath></defs><g clip-path="url(#studio-eye-left)"><image class="studio-eye-pupil" data-eye-pupil="left" href="${asset('eyes-inner.webp')}" width="320" height="252"/></g><g clip-path="url(#studio-eye-right)"><image class="studio-eye-pupil" data-eye-pupil="right" href="${asset('eyes-inner.webp')}" width="320" height="252"/></g><image class="studio-eye-outline" href="${asset('eyes-outer.webp')}" width="320" height="252"/></svg>`);
    eyeBox.classList.add('studio-eyes');
    const process = nav.querySelector('#process-control');
    const processBox = replace(process, picture('process.webp', 'studio-process-mark', 320, 320));
    processBox.classList.add('studio-process-icon');
    const contact = nav.querySelector('#nav-contact');
    const heart = replace(contact, picture('heart.webp', 'studio-heart', 320, 320)).querySelector('.studio-heart');

    const back = document.createElement('button');
    back.id = 'studio-back';
    back.type = 'button';
    back.className = 'nav-pill studio-back';
    back.hidden = true;
    back.innerHTML = `<span class="studio-nav-icon studio-back-icon" aria-hidden="true"><svg class="studio-back-arrow" viewBox="0 0 48 40" fill="none"><defs><marker id="studioBackHead" viewBox="0 0 150 168" markerWidth="3.94" markerHeight="4.41" refX="150" refY="88" orient="auto" markerUnits="strokeWidth"><image class="studio-arrowhead" href="${asset('arrowhead.png')}" x="0" y="0" width="150" height="168" preserveAspectRatio="xMidYMid meet"/></marker><filter id="studioBackRough" filterUnits="userSpaceOnUse" x="-225" y="-10" width="290" height="60"><feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter></defs><path d="${makePath(idlePath)}" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#studioBackHead)" filter="url(#studioBackRough)"/></svg></span><span data-studio-back-label></span>`;
    nav.prepend(back);

    // Keep all existing buttons/listeners. This layer owns illustration motion only.
    const hammer = hammerBox.querySelector('.studio-hammer');
    const hammerOffset = hammerBox.querySelector('.studio-hammer-offset');
    const label = work.querySelector('[data-copy="ui.work"]');
    let hoveringWork = false, hammerAnimation = null, strikeTimer = 0, returnTimer = 0;
    let letters = [], letterAnimations = [], strikeCount = 0, splitText = '';
    const cancelLetters = () => { letterAnimations.forEach(a => a.cancel()); letterAnimations = []; };
    const splitLabel = () => {
      splitText = label.textContent;
      if (!label.style.width) label.style.width = label.getBoundingClientRect().width + 'px';
      work.setAttribute('aria-label', splitText);
      label.setAttribute('aria-hidden', 'true');
      label.replaceChildren(...Array.from(splitText, text => {
        const span = document.createElement('span');
        span.className = 'studio-work-letter'; span.textContent = text;
        return span;
      }));
      letters = [...label.children].map(node => ({ node, x: random(-14, 14), y: random(28, 60), r: random(-65, 65), last: 'translate(0px,0px) rotate(0deg)', opacity: 1 }));
    };
    const strike = () => {
      if (!hoveringWork || !canMove()) return;
      if (!label.querySelector('.studio-work-letter')) splitLabel();
      strikeCount++;
      const progress = Math.min(strikeCount / 14, 1);
      cancelLetters();
      for (const letter of letters) {
        const next = `translate(${letter.x * progress + random(-1.5, 1.5)}px,${letter.y * progress + random(-1, 1)}px) rotate(${letter.r * progress + random(-3, 3)}deg)`;
        const opacity = progress >= 1 ? 0 : 1 - progress * .4;
        letterAnimations.push(letter.node.animate([{ transform: letter.last, opacity: letter.opacity }, { transform: next, opacity }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }));
        letter.last = next; letter.opacity = opacity;
      }
      if (progress < 1) strikeTimer = setTimeout(strike, 610);
      else { hammerAnimation?.cancel(); hammerAnimation = hammer.animate([{ transform: 'rotate(80deg)' }, { transform: 'rotate(0deg)' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }); }
    };
    const startHammer = () => {
      if (hoveringWork || !canMove()) return;
      clearTimeout(returnTimer); hoveringWork = true; strikeCount = 0;
      hammerAnimation?.cancel(); cancelLetters(); splitLabel();
      hammerOffset.style.translate = '8px 0';
      hammerAnimation = hammer.animate([
        { transform: 'rotate(0deg)', offset: 0, easing: 'cubic-bezier(.25,.46,.45,.94)' },
        { transform: 'rotate(-25deg)', offset: 220 / 610, easing: 'cubic-bezier(.895,.03,.685,.22)' },
        { transform: 'rotate(80deg)', offset: 350 / 610, easing: 'cubic-bezier(.25,.46,.45,.94)' },
        { transform: 'rotate(0deg)', offset: 530 / 610 },
        { transform: 'rotate(0deg)', offset: 1 }
      ], { duration: 610, iterations: Infinity });
      strikeTimer = setTimeout(strike, 350);
    };
    const stopHammer = (instant = false) => {
      hoveringWork = false; clearTimeout(strikeTimer); clearTimeout(returnTimer);
      const current = getComputedStyle(hammer).transform;
      hammerAnimation?.cancel(); hammerOffset.style.translate = '0 0';
      if (!instant && canMove()) hammerAnimation = hammer.animate([{ transform: current }, { transform: 'rotate(0deg)' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
      cancelLetters();
      if (!instant && canMove()) {
        for (const letter of letters) letterAnimations.push(letter.node.animate([{ transform: letter.last, opacity: letter.opacity }, { transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 }], { duration: 450, delay: random(0, Math.max(0, letters.length - 1) * 20), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }));
        returnTimer = setTimeout(() => { cancelLetters(); label.textContent = i18n.t('ui.work'); label.removeAttribute('aria-hidden'); label.style.width = ''; }, 450 + letters.length * 20);
      } else { label.textContent = i18n.t('ui.work'); label.removeAttribute('aria-hidden'); label.style.width = ''; }
    };
    work.addEventListener('pointerenter', startHammer);
    work.addEventListener('pointerleave', () => stopHammer());
    work.addEventListener('click', () => stopHammer());

    // Original wd(): 150° rest, +720° over 2.8s on enter, power4.out.
    // Leave intentionally does not cancel the star's inertial turn.
    const processMark = processBox.querySelector('.studio-process-mark');
    let processFrame = 0, processAngle = 150, processFrom = 150, processStarted = 0;
    const paintProcess = () => { processMark.style.transform = `rotate(${processAngle}deg)`; };
    const spinProcess = now => {
      const progress = Math.min(1, (now - processStarted) / 2800);
      processAngle = processFrom + 720 * (1 - (1 - progress) ** 5);
      paintProcess();
      processFrame = progress < 1 && canMove() ? requestAnimationFrame(spinProcess) : 0;
    };
    const startProcess = event => {
      if (!canMove() || event.pointerType === 'touch') return;
      cancelAnimationFrame(processFrame); processFrom = processAngle; processStarted = performance.now();
      processFrame = requestAnimationFrame(spinProcess);
    };
    const resetProcess = () => { cancelAnimationFrame(processFrame); processFrame = 0; processAngle = 150; paintProcess(); };
    process.addEventListener('pointerenter', startProcess);
    process.addEventListener('focus', event => { if (process.matches(':focus-visible')) startProcess(event); });
    paintProcess();

    // Reference xd(): two heartbeats in a 900ms cycle, introduced after 175ms.
    // Amplitude eases away on leave instead of abruptly cutting off a pulse.
    let heartFrame = 0, heartStarted = 0, heartAmpStarted = 0, heartAmp = 0, heartFrom = 0, heartTarget = 0;
    const paintHeart = now => {
      const elapsed = now - heartAmpStarted;
      if (elapsed >= 0) {
        const p = Math.min(1, elapsed / (heartTarget ? 120 : 500));
        const ease = heartTarget ? 1 - (1 - p) ** 3 : p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
        heartAmp = heartFrom + (heartTarget - heartFrom) * ease;
      }
      const phase = Math.max(0, (now - heartStarted) % 900) / 900;
      const pulse = phase < .133 ? .22 * Math.sin(phase / .133 * Math.PI) : phase > .177 && phase < .288 ? .14 * Math.sin((phase - .177) / .111 * Math.PI) : 0;
      heart.style.transform = `scale(${1 + pulse * heartAmp})`;
      heartFrame = canMove() && (heartTarget || heartAmp > .0001) ? requestAnimationFrame(paintHeart) : 0;
      if (!heartFrame) { heartAmp = 0; heart.style.transform = 'scale(1)'; }
    };
    const startHeart = event => {
      if (!canMove() || event.pointerType === 'touch') return;
      heartAmp = heartFrom = 0; heartTarget = 1;
      heartStarted = heartAmpStarted = performance.now() + 175;
      if (!heartFrame) heartFrame = requestAnimationFrame(paintHeart);
    };
    const leaveHeart = () => {
      heartFrom = heartAmp; heartTarget = 0; heartAmpStarted = performance.now();
      if (heartAmp && !heartFrame && canMove()) heartFrame = requestAnimationFrame(paintHeart);
    };
    const resetHeart = () => { cancelAnimationFrame(heartFrame); heartFrame = heartAmp = heartTarget = 0; heart.style.transform = 'scale(1)'; };
    contact.addEventListener('pointerenter', startHeart);
    contact.addEventListener('pointerleave', leaveHeart);
    contact.addEventListener('focus', event => { if (contact.matches(':focus-visible')) startHeart(event); });
    contact.addEventListener('blur', leaveHeart);

    const eyeArt = eyeBox.querySelector('.studio-eye-art');
    const pupils = [...eyeBox.querySelectorAll('[data-eye-pupil]')];
    const pupilCenters = [[77.39, 135.96], [248.54, 123.34]], pupilBase = [[-5, -9], [0, 0]], eyeRadius = [[20, 34], [20, 34]];
    let eyeFrame = 0, eyeLastFrame = 0, eyeCurrent = [[0, 0], [0, 0]], eyeTarget = [[0, 0], [0, 0]], eyePointer = null, eyeDirty = false;
    const paintEyes = () => pupils.forEach((pupil, i) => {
      const [cx, cy] = pupilCenters[i];
      pupil.setAttribute('transform', `translate(${pupilBase[i][0] + eyeCurrent[i][0]} ${pupilBase[i][1] + eyeCurrent[i][1]}) translate(${cx} ${cy}) scale(.925) translate(${-cx} ${-cy})`);
    });
    const drawEyes = now => {
      if (!canMove()) { resetEyes(); return; }
      if (eyeDirty && eyePointer) {
        // Convert the pointer through the real SVG transform, including button
        // press/scale. A bounding rectangle alone loses that coordinate system.
        const matrix = eyeArt.getScreenCTM();
        if (!matrix) { resetEyes(); return; }
        const pointer = new DOMPoint(...eyePointer).matrixTransform(matrix.inverse());
        // Like the reference's shared pupil layer, both eyes aim together.
        // Per-eye directions would cross them when hovering between the eyes.
        const dx = pointer.x - 160, dy = pointer.y - 126, distance = Math.hypot(dx, dy);
        const center = new DOMPoint(160, 126).matrixTransform(matrix);
        const strength = Math.min(Math.hypot(eyePointer[0] - center.x, eyePointer[1] - center.y) / 18, 1);
        eyeTarget = eyeRadius.map(([rx, ry]) => distance < .01 ? [0, 0] : [rx * dx / distance * strength, ry * dy / distance * strength]);
        eyeDirty = false;
      }
      // Integrate elapsed frame time instead of restarting a 150ms tween on
      // every pointermove (which left progress at zero while the cursor moved).
      const delta = eyeLastFrame ? Math.min(64, now - eyeLastFrame) : 1000 / 60;
      eyeLastFrame = now;
      const follow = 1 - Math.exp(-delta / 42);
      eyeCurrent = eyeCurrent.map((point, i) => point.map((value, j) => {
        const next = value + (eyeTarget[i][j] - value) * follow;
        return Math.abs(eyeTarget[i][j] - next) < .015 ? eyeTarget[i][j] : next;
      }));
      paintEyes();
      const moving = eyeCurrent.some((point, i) => point.some((value, j) => value !== eyeTarget[i][j]));
      eyeFrame = moving ? requestAnimationFrame(drawEyes) : 0;
      if (!eyeFrame) eyeLastFrame = 0;
    };
    const resetEyes = () => { cancelAnimationFrame(eyeFrame); eyeFrame = eyeLastFrame = 0; eyePointer = null; eyeDirty = false; eyeCurrent = [[0, 0], [0, 0]]; eyeTarget = [[0, 0], [0, 0]]; paintEyes(); };
    const refreshEyes = () => { if (canMove() && eyePointer) { eyeDirty = true; if (!eyeFrame) eyeFrame = requestAnimationFrame(drawEyes); } };
    const neutralEyes = () => {
      eyePointer = null; eyeDirty = false;
      if (!canMove()) { resetEyes(); return; }
      eyeTarget = [[0, 0], [0, 0]];
      if (!eyeFrame) eyeFrame = requestAnimationFrame(drawEyes);
    };
    const eyeMove = event => {
      if (!canMove() || event.pointerType === 'touch' || ui.inert) return;
      eyePointer = [event.clientX, event.clientY]; refreshEyes();
    };
    addEventListener('pointermove', eyeMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', neutralEyes);
    addEventListener('blur', neutralEyes);
    addEventListener('pointercancel', neutralEyes);
    addEventListener('resize', refreshEyes);
    new ResizeObserver(refreshEyes).observe(nav);

    const path = back.querySelector('path');
    const arrow = back.querySelector('.studio-back-arrow');
    let backFrame = 0, backProgress = 0, backTarget = 0, backLast = 0, backFade = null;
    const paintArrow = () => {
      const progress = inOut(backProgress);
      path.setAttribute('d', makePath(idlePath.map((value, i) => +(value + (longPath[i] - value) * progress).toFixed(3))));
      arrow.style.transform = `rotate(${13 * (1 - progress)}deg)`;
    };
    const moveBack = now => {
      const step = Math.min(40, now - backLast) / 550; backLast = now;
      backProgress = backTarget ? Math.min(1, backProgress + step) : Math.max(0, backProgress - step);
      paintArrow();
      backFrame = backProgress !== backTarget && canMove() ? requestAnimationFrame(moveBack) : 0;
    };
    const targetBack = target => {
      if (!canMove()) return;
      backTarget = target;
      if (!backFrame) { backLast = performance.now(); backFrame = requestAnimationFrame(moveBack); }
    };
    const resetBack = () => { cancelAnimationFrame(backFrame); backFrame = 0; backProgress = backTarget = 0; backFade?.cancel(); backFade = null; paintArrow(); };
    back.addEventListener('pointerenter', () => targetBack(1));
    back.addEventListener('pointerleave', () => targetBack(0));
    back.addEventListener('click', event => {
      event.preventDefault();
      // The entry controller owns cancellation; Back must interrupt an opening flight.
      resetBack();
      if (!reducedMotion) backFade = back.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'cubic-bezier(.55,.085,.68,.53)' });
      window.portfolioEntry?.back();
    });

    const syncCopy = () => {
      back.querySelector('[data-studio-back-label]').textContent = ({ en: 'Back', ro: 'Înapoi', ru: 'Назад' })[i18n.locale] || 'Back';
      work.setAttribute('aria-label', i18n.t('ui.work'));
      refreshEyes();
      if (hoveringWork) stopHammer(true);
    };
    const syncState = () => {
      const mode = window.portfolioEntry?.mode || document.body.dataset.entry || 'home';
      const target = document.body.dataset.entryTarget;
      const visible = document.body.dataset.entry !== 'loading' && Boolean((target && target !== 'home') || (mode !== 'home' && mode !== 'loading'));
      if (back.hidden === visible) { back.hidden = !visible; nav.classList.toggle('studio-nav-has-back', visible); resetBack(); }
      refreshEyes();
      stopHammer(true);
    };
    i18n.subscribe(syncCopy);
    addEventListener('portfolio:entrystate', syncState);
    addEventListener('portfolio:entryintent', syncState);
    new MutationObserver(syncState).observe(document.body, { attributes: true, attributeFilter: ['data-entry', 'data-entry-target'] });
    const stopAll = () => { stopHammer(true); resetEyes(); resetBack(); resetProcess(); resetHeart(); };
    reduced.addEventListener('change', event => { reducedMotion = event.matches; stopAll(); }); hover.addEventListener('change', stopAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
    syncCopy(); syncState(); resetEyes(); paintArrow();
    window.portfolioNav = Object.freeze({ getState: () => ({ mounted, hammerActive: hoveringWork, strikes: strikeCount, eyeAnimating: !!eyeFrame, eyeOffset: eyeCurrent.map(p => [...p]), eyeRadius: eyeRadius.map(p => [...p]), processAnimating: !!processFrame, processAngle, heartAnimating: !!heartFrame, heartAmplitude: heartAmp, backAnimating: !!backFrame, backProgress, backVisible: !back.hidden }) });
    return true;
  }
  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.body, { childList: true });
  }
})();
