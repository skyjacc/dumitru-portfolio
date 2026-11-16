/*
 * Kernjosh's original five-frame character, isolated for this portfolio's Home.
 * Behavior adapted from https://webdesign.kernjosh.com/assets/main-CwptEoZ4.js
 * (the character module beginning `var jd=320`; original sprite images retained).
 * The loader hands over its current translation through portfolioCharacter.start.
 */
(() => {
  'use strict';
  if (window.portfolioCharacter) return;

  const SPEED = 320, RETURN_SPEED = 90, JUMP = 760, GRAVITY = 2600;
  const MASK_SIZE = 64, ALPHA_THRESHOLD = 16, BODY_WIDTH = .35;
  const SIDE_SAMPLES = [.25, .55, .85], SUPPORT_RANGE = 12;
  const SURFACE_STEP = 3, MOVE_STEP = 2, MAX_SHOVE = 40;
  const NEAR_MARGIN = 48, CANDIDATE_MARGIN = 320, CANDIDATE_INTERVAL = 150;
  const IDLE_FRAME = 4, FRAME_SECONDS = .2, WAKE_AFTER_SCROLL = 2000;
  const KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyS']);
  const HORIZONTAL = new Set(['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD']);
  const JUMP_KEYS = new Set(['ArrowUp', 'Space', 'KeyW']);
  const INTERACTIVE = 'a,button,input,textarea,select,summary,iframe,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="menuitem"],[role="listbox"],[role="option"],[role="slider"],[role="textbox"],[role="combobox"],[role="spinbutton"],[role="switch"],[tabindex]:not([tabindex="-1"])';
  const UI_SURFACE = '#portfolio-ui,#language-control,#language-popover,[data-language-popover],[role="dialog"],[role="menu"],dialog';
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const touchQuery = matchMedia('(pointer: coarse)');
  const held = new Set(), obstacles = new Map();
  let walker = null, started = false, active = false, returning = false;
  let x = 0, y = 0, vy = 0, direction = 1, grounded = true;
  let originLeft = 0, width = 80, height = 80 * 803 / 630, floor = innerHeight;
  let frame = IDLE_FRAME, gaitTime = 0, raf = 0, lastTime = 0, idleTask = 0;
  let activated = false, collisionEnabled = false, support = null, supportX = 0;
  let candidates = [], nearby = [], candidateAt = -Infinity, scrollAt = -Infinity;
  let deskRoot = null, deskObserver = null;

  const home = () => document.body?.dataset.entry === 'home';
  const clampX = value => Math.max(-originLeft, Math.min(innerWidth - originLeft - width, value));
  const centerX = () => originLeft + x + width / 2;
  const emit = name => window.dispatchEvent(new CustomEvent(name, { detail: getState() }));

  function measure() {
    if (!walker) return;
    const css = getComputedStyle(walker);
    originLeft = parseFloat(css.left) || 0;
    width = walker.offsetWidth || parseFloat(css.width) || 80;
    height = walker.offsetHeight || width * 803 / 630;
    floor = innerHeight - (parseFloat(css.bottom) || 0);
    x = clampX(x);
    candidateAt = -Infinity;
  }

  function paint() {
    if (!walker) return;
    walker.style.transform = `translate3d(${x.toFixed(3)}px, ${(-y).toFixed(3)}px, 0)`;
    walker.dataset.frame = String(frame);
    walker.dataset.direction = direction < 0 ? 'left' : 'right';
    walker.dataset.sfActive = String(activated);
    walker.dataset.state = !active ? 'suspended' : returning ? 'returning' : (held.size || !grounded) ? 'controlled' : 'parked';
  }

  function visible(el) {
    if (!el || !el.isConnected || el.hidden || !el.getClientRects().length) return false;
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const css = getComputedStyle(node);
      if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) < .5) return false;
    }
    return true;
  }

  function uiOwnsKeyboard(event) {
    if (event && (event.altKey || event.ctrlKey || event.metaKey || event.isComposing)) return true;
    const target = event?.target;
    if (target instanceof Element && target.closest(INTERACTIVE + ',' + UI_SURFACE)) return true;
    const focused = document.activeElement;
    if (focused && focused !== document.body && focused !== document.documentElement && focused.closest(INTERACTIVE + ',' + UI_SURFACE)) return true;
    if (document.body?.dataset.help === 'open' || window.portfolioRuntime?.helpOpen) return true;
    const panels = document.querySelectorAll('dialog[open],[role="dialog"],#work-list,#language-popover,.language-popover,[data-language-popover]');
    for (const panel of panels) if (visible(panel)) return true;
    for (const trigger of document.querySelectorAll('#portfolio-ui [aria-expanded="true"][aria-controls]')) {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (visible(panel)) return true;
    }
    if (window.CSS?.supports('selector(:popover-open)') && document.querySelector(':popover-open')) return true;
    return false;
  }

  // Listeners are installed before the native portfolio bundle. Outside Home,
  // or while a real control has focus, they leave its keyboard behavior intact.
  function keydown(event) {
    if (!KEYS.has(event.code) || !started || !active || !home() || touchQuery.matches || document.hidden) return;
    if (uiOwnsKeyboard(event)) { held.clear(); return; }
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!activated) {
      activated = true;
      walker.dataset.sfActive = 'true';
      emit('portfolio:characteractive');
    }
    if (event.code !== 'ArrowDown' && event.code !== 'KeyS') collisionEnabled = true;
    if (HORIZONTAL.has(event.code)) {
      held.add(event.code);
      returning = false;
    }
    if (JUMP_KEYS.has(event.code) && !event.repeat && grounded) {
      vy = JUMP;
      grounded = false;
      support = null;
    }
    wake();
  }

  function keyup(event) {
    if (!KEYS.has(event.code)) return;
    held.delete(event.code);
    if (!active || !home() || touchQuery.matches || document.hidden || uiOwnsKeyboard(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    wake();
  }
  window.addEventListener('keydown', keydown, { capture: true });
  window.addEventListener('keyup', keyup, { capture: true });

  const imageSource = img => [img.src, img.srcset, img.currentSrc].join('\n');

  function resetImageMask(entry) {
    entry.source = imageSource(entry.el);
    entry.mask = null;
    entry.pending = false;
    entry.unreadable = false;
    entry.version++;
  }

  function createImageMask(entry) {
    const img = entry.el;
    if (entry.source !== imageSource(img)) resetImageMask(entry);
    if (entry.mask || entry.pending || entry.unreadable) return;
    entry.pending = true;
    const version = entry.version;
    const build = () => {
      if (version !== entry.version) return;
      entry.pending = false;
      if (!img.naturalWidth || !img.naturalHeight) return;
      const scale = MASK_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const mw = Math.max(1, Math.round(img.naturalWidth * scale));
      const mh = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = mw;
      canvas.height = mh;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      try {
        context.drawImage(img, 0, 0, mw, mh);
        const pixels = context.getImageData(0, 0, mw, mh).data;
        const mask = new Uint8Array(mw * mh);
        // Clean native alpha uses the original character's visible-pixel cutoff.
        for (let i = 0; i < mask.length; i++) mask[i] = +(pixels[i * 4 + 3] >= ALPHA_THRESHOLD);
        entry.mask = mask;
        entry.mw = mw;
        entry.mh = mh;
        candidateAt = -Infinity;
        wake();
      } catch (_) {
        // An unreadable image remains air: its transparent corners must not
        // unexpectedly become a solid rectangular obstacle.
        entry.unreadable = true;
      }
    };
    if (img.complete && img.naturalWidth) build();
    else img.decode().then(build, () => { if (version === entry.version) entry.pending = false; });
  }

  function prepareObstacles() {
    const root = document.getElementById('studio-home');
    if (root !== deskRoot) {
      deskObserver?.disconnect();
      deskRoot = root;
      if (root) {
        deskObserver = new MutationObserver(refreshDesk);
        deskObserver.observe(root, { childList: true, subtree: true, attributes: true,
          attributeFilter: ['src', 'srcset', 'data-reveal'] });
      }
    }
    const current = new Set();
    for (const el of document.querySelectorAll('.desk-object[data-desk-object] .desk-cutout > img')) {
      current.add(el);
      let entry = obstacles.get(el);
      if (!entry) {
        entry = { el, object: el.closest('.desk-object[data-desk-object]'), image: true,
          source: '', version: 0, mask: null, pending: false };
        obstacles.set(el, entry);
        entry.onLoad = () => {
          resetImageMask(entry);
          if (active) createImageMask(entry);
          refreshDesk();
        };
        el.addEventListener('load', entry.onLoad);
      }
      entry.object = el.closest('.desk-object[data-desk-object]');
      entry.cutout = el.closest('.desk-cutout');
      createImageMask(entry);
    }
    for (const [el, entry] of obstacles) {
      if (!current.has(el)) {
        el.removeEventListener('load', entry.onLoad);
        entry.version++;
        obstacles.delete(el);
      }
    }
    candidateAt = -Infinity;
  }

  function refreshDesk() {
    candidateAt = -Infinity;
    if (!active) return;
    scheduleMasks();
    wake();
  }

  function scheduleMasks() {
    if (touchQuery.matches || idleTask) return;
    const run = () => { idleTask = 0; if (active) prepareObstacles(); };
    idleTask = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 300 }) : setTimeout(run, 0);
  }

  // Compose ancestor transforms for both the bitmap and its crop. The image
  // may be oversized and negatively positioned inside the rotated cutout.
  function transformedBox(el) {
    const rect = el.getBoundingClientRect(), css = getComputedStyle(el);
    const w = el.offsetWidth || parseFloat(css.width), h = el.offsetHeight || parseFloat(css.height);
    if (!w || !h) return null;
    let matrix = new DOMMatrix();
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const transform = getComputedStyle(node).transform;
      if (transform && transform !== 'none') matrix = new DOMMatrix(transform).multiply(matrix);
    }
    const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
    if (Math.abs(determinant) < 1e-8) return null;
    return { rect, w, h, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2,
      ia: matrix.d / determinant, ib: -matrix.b / determinant, ic: -matrix.c / determinant, id: matrix.a / determinant };
  }

  function geometry(entry) {
    const el = entry.el;
    // The folded fragments are CSS backgrounds. Only the final, settled image
    // has the geometry represented by this mask; unfolding pieces remain air.
    if (entry.object?.dataset.reveal !== 'settled') return null;
    if (!visible(el) || !entry.mask || entry.source !== imageSource(el)) return null;
    const box = transformedBox(el);
    if (!box) return null;
    const { w, h } = box, css = getComputedStyle(el);
    const clip = entry.cutout ? transformedBox(entry.cutout) : null;
    if (entry.cutout && !clip) return null;
    let art = { x: 0, y: 0, w, h };
    if (entry.image && css.objectFit === 'contain') {
      const scale = Math.min(w / entry.el.naturalWidth, h / entry.el.naturalHeight);
      const aw = entry.el.naturalWidth * scale, ah = entry.el.naturalHeight * scale;
      art = { x: (w - aw) / 2, y: (h - ah) / 2, w: aw, h: ah };
    }
    return { entry, el, ...box, rect: clip?.rect || box.rect, art, clip };
  }

  function updateNearby(time) {
    nearby = [];
    if (!collisionEnabled || !obstacles.size) return;
    const cx = centerX(), feet = floor - y;
    if (time - candidateAt >= CANDIDATE_INTERVAL) {
      candidateAt = time;
      candidates = [];
      for (const entry of obstacles.values()) {
        const bounds = (entry.cutout || entry.el).getBoundingClientRect();
        if (entry.el === support || !(bounds.right < cx - CANDIDATE_MARGIN || bounds.left > cx + CANDIDATE_MARGIN || bounds.bottom < feet - height - CANDIDATE_MARGIN || bounds.top > feet + CANDIDATE_MARGIN)) candidates.push(entry);
      }
    }
    for (const entry of candidates) {
      const item = geometry(entry);
      if (!item) continue;
      const r = item.rect;
      if (item.el === support || !(r.right < cx - width / 2 - NEAR_MARGIN || r.left > cx + width / 2 + NEAR_MARGIN || r.bottom < feet - height - NEAR_MARGIN || r.top > feet + NEAR_MARGIN)) nearby.push(item);
    }
  }

  function hitAt(screenX, screenY) {
    for (const item of nearby) {
      if (item.clip) {
        const clip = item.clip, dx = screenX - clip.cx, dy = screenY - clip.cy;
        const lx = clip.ia * dx + clip.ic * dy + clip.w / 2;
        const ly = clip.ib * dx + clip.id * dy + clip.h / 2;
        if (lx < 0 || lx >= clip.w || ly < 0 || ly >= clip.h) continue;
      }
      const dx = screenX - item.cx, dy = screenY - item.cy;
      const lx = item.ia * dx + item.ic * dy + item.w / 2;
      const ly = item.ib * dx + item.id * dy + item.h / 2;
      const u = (lx - item.art.x) / item.art.w, v = (ly - item.art.y) / item.art.h;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
      const entry = item.entry;
      if (!entry.image || entry.mask[Math.floor(v * entry.mh) * entry.mw + Math.floor(u * entry.mw)] === 1) return item;
    }
    return null;
  }

  function surfaceBetween(from, to) {
    if (to < from) return null;
    const cx = centerX(), radius = BODY_WIDTH * width / 2;
    for (let sy = from; ; sy = Math.min(to, sy + SURFACE_STEP)) {
      let count = 0, item = null;
      for (const sx of [cx - radius, cx, cx + radius]) {
        const hit = hitAt(sx, sy);
        if (hit) { count++; item = hit; }
      }
      if (count >= 2) return { sy, item };
      if (sy >= to) return null;
    }
  }

  function sideBlocked(nextX, side) {
    const sx = originLeft + nextX + width / 2 + side * BODY_WIDTH * width / 2;
    return SIDE_SAMPLES.some(sample => hitAt(sx, floor - y - sample * height));
  }

  function overlappingItem() {
    const cx = centerX(), radius = BODY_WIDTH * width / 2;
    for (const sample of SIDE_SAMPLES) {
      for (const sx of [cx - radius, cx + radius]) {
        const item = hitAt(sx, floor - y - sample * height);
        if (item && item.el !== support) return item;
      }
    }
    return null;
  }

  function landed(hit) {
    y = floor - hit.sy;
    vy = 0;
    grounded = true;
    support = hit.item.el;
    supportX = hit.item.cx;
  }

  function tick(time) {
    raf = 0;
    if (!active || !home() || document.hidden) return;
    const dt = Math.max(0, Math.min((time - lastTime) / 1000, 1 / 30));
    lastTime = time;
    if (held.size && uiOwnsKeyboard()) held.clear();
    updateNearby(time);
    if (support) {
      const item = nearby.find(item => item.el === support);
      if (item) { x = clampX(x + item.cx - supportX); supportX = item.cx; }
      else { support = null; grounded = false; vy = 0; }
    }

    const input = +(held.has('ArrowRight') || held.has('KeyD')) - +(held.has('ArrowLeft') || held.has('KeyA'));
    let movement = input, parkedNow = false;
    if (returning) {
      if (input) returning = false;
      else if (x > -originLeft + .5) movement = -1;
      else {
        x = -originLeft;
        returning = false;
        direction = 1;
        parkedNow = true;
      }
    }
    if (movement) direction = movement > 0 ? 1 : -1;
    let remaining = (returning ? RETURN_SPEED : SPEED) * dt;
    while (movement && remaining > 0) {
      const step = Math.min(MOVE_STEP, remaining);
      const nextX = clampX(x + movement * step);
      if (nextX === x) break;
      if (nearby.length && sideBlocked(nextX, movement)) { returning = false; break; }
      x = nextX;
      remaining -= step;
    }

    if (grounded && support) {
      const feet = floor - y;
      const hit = surfaceBetween(feet - SUPPORT_RANGE, feet + SUPPORT_RANGE);
      if (hit) landed(hit);
      else { support = null; grounded = false; vy = 0; }
    } else {
      const descending = vy <= 0, previousFeet = floor - y;
      const nextY = y + vy * dt;
      // A newly requested RAF can carry a timestamp just before wake() ran.
      // Keep the upward impulse when that first integration step has dt === 0.
      if (nextY <= 0 && vy <= 0) { y = 0; vy = 0; grounded = true; }
      else { y = nextY; vy -= GRAVITY * dt; grounded = false; }
      if (descending && nearby.length) {
        const hit = surfaceBetween(previousFeet, floor - y);
        if (hit) landed(hit);
      }
    }
    for (let pushed = 0; nearby.length && pushed < MAX_SHOVE; pushed += MOVE_STEP) {
      const item = overlappingItem();
      if (!item) break;
      const nextX = clampX(x + (centerX() < item.cx ? -MOVE_STEP : MOVE_STEP));
      if (nextX === x) break;
      x = nextX;
    }

    const walking = grounded && movement !== 0 && !reducedQuery.matches;
    gaitTime = walking ? (gaitTime + dt) % (FRAME_SECONDS * 5) : 0;
    frame = walking ? Math.min(IDLE_FRAME, Math.floor(gaitTime / FRAME_SECONDS)) : IDLE_FRAME;
    paint();
    if (parkedNow) emit('portfolio:characterparked');
    if (movement || !grounded || returning || support || nearby.length || time - scrollAt < WAKE_AFTER_SCROLL) raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (raf || !active || !home() || document.hidden) return;
    lastTime = performance.now();
    candidateAt = -Infinity;
    raf = requestAnimationFrame(tick);
  }

  function stopAnimation() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (idleTask) {
      if (window.cancelIdleCallback) cancelIdleCallback(idleTask);
      else clearTimeout(idleTask);
      idleTask = 0;
    }
    held.clear();
  }

  function resetBody() {
    y = 0;
    vy = 0;
    grounded = true;
    support = null;
    gaitTime = 0;
    frame = IDLE_FRAME;
    candidates = [];
    nearby = [];
    candidateAt = -Infinity;
  }

  function suspend() {
    if (!started) return;
    active = false;
    returning = false;
    stopAnimation();
    resetBody();
    if (walker) { walker.hidden = true; paint(); }
  }

  function activate(initialPosition) {
    if (!started || !walker || !home()) return;
    active = true;
    walker.hidden = false;
    resetBody();
    activated = false;
    collisionEnabled = false;
    measure();
    x = initialPosition && !reducedQuery.matches ? clampX(initialPosition.x) : -originLeft;
    direction = initialPosition?.direction === -1 ? -1 : 1;
    returning = !!initialPosition && !reducedQuery.matches && x > -originLeft + .5;
    if (!returning) { x = -originLeft; direction = 1; }
    paint();
    scheduleMasks();
    if (returning) wake();
    else emit('portfolio:characterparked');
  }

  function syncEntry() {
    if (!started) return;
    if (home()) { if (!active) activate(); }
    else if (active || !walker?.hidden) suspend();
  }

  function start(options = {}) {
    if (started) return getState();
    walker = document.getElementById('loader-walker');
    if (!walker) return getState();
    started = true;
    const initial = { x: Number.isFinite(options.x) ? options.x : 0, direction: options.direction === -1 ? -1 : 1 };
    if (home()) activate(initial);
    else suspend();
    return getState();
  }

  function getState() {
    return Object.freeze({ started, active, home: home(), x, y, vy, frame, direction, returning, grounded,
      onPlatform: !!support, width, height, originLeft, viewportX: originLeft + x,
      activated, collisionEnabled, reducedMotion: reducedQuery.matches, touch: touchQuery.matches,
      keyboardEnabled: active && home() && !touchQuery.matches,
      heldKeys: Object.freeze([...held]), candidateCount: candidates.length, nearbyCount: nearby.length,
      maskCount: [...obstacles.values()].filter(entry => entry.mask).length, animating: !!raf });
  }

  window.addEventListener('portfolio:entrystate', syncEntry);
  window.addEventListener('portfolio:deskready', refreshDesk);
  const observeEntry = () => {
    if (!document.body) return;
    new MutationObserver(syncEntry).observe(document.body, { attributes: true, attributeFilter: ['data-entry'] });
  };
  if (document.body) observeEntry();
  else document.addEventListener('DOMContentLoaded', observeEntry, { once: true });
  window.addEventListener('resize', () => {
    if (!active) return;
    const parked = !returning && !activated;
    measure();
    if (parked) x = -originLeft;
    paint();
    wake();
  });
  window.addEventListener('blur', () => held.clear());
  document.addEventListener('focusin', event => { if (uiOwnsKeyboard(event)) held.clear(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAnimation();
    else if (active) { scheduleMasks(); wake(); }
  });
  const scrollWake = () => { if (active) { scrollAt = performance.now(); wake(); } };
  window.addEventListener('wheel', scrollWake, { passive: true });
  window.addEventListener('touchmove', scrollWake, { passive: true });
  reducedQuery.addEventListener('change', () => {
    if (!active) return;
    if (reducedQuery.matches && returning) {
      returning = false;
      x = -originLeft;
      direction = 1;
      frame = IDLE_FRAME;
      paint();
      emit('portfolio:characterparked');
    }
    wake();
  });
  touchQuery.addEventListener('change', () => {
    held.clear();
    if (!touchQuery.matches) scheduleMasks();
  });
  window.addEventListener('pagehide', stopAnimation);
  window.addEventListener('pageshow', () => { if (active) { scheduleMasks(); wake(); } });
  Object.defineProperty(window, 'portfolioCharacter', { value: Object.freeze({ start, getState }) });
})();
