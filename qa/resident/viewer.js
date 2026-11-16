/* Local developer viewer, served only by scripts/serve.py at /__character/. */
(() => {
  'use strict';
  if (window.__residentViewer) return;
  window.__residentViewer = true;
  const style = document.createElement('style');
  style.textContent = `
    #resident-viewer{position:fixed;right:12px;bottom:12px;z-index:80;width:min(370px,calc(100vw - 24px));max-height:72svh;overflow:auto;border:1px solid #74746e;border-radius:10px;background:#171715f5;color:#eee;font:13px/1.45 system-ui,sans-serif;padding:12px;box-sizing:border-box;color-scheme:dark}
    #resident-viewer summary{cursor:pointer;font-weight:650;font-size:14px}
    #resident-viewer fieldset{border:0;padding:10px 0;margin:0;display:flex;flex-wrap:wrap;gap:8px}
    #resident-viewer legend{padding-top:10px;color:#bbb;font-weight:600}
    #resident-viewer label{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    #resident-viewer :is(button,select,input){font:inherit;min-height:32px;border:1px solid #606059;border-radius:5px;background:#292925;color:#eee;padding:4px 7px;box-sizing:border-box}
    #resident-viewer button{cursor:pointer;min-width:44px}#resident-viewer input[type=number]{width:80px}#resident-viewer input[type=checkbox]{min-height:20px;width:20px;margin:0}
    #resident-viewer :focus-visible{outline:2px solid #dedec2;outline-offset:3px}
    #resident-viewer pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.45 ui-monospace,monospace;max-height:160px;overflow:auto;border-top:1px solid #555;padding-top:8px}
    #resident-viewer .viewer-note{color:#bcbcb3;font-size:12px}#resident-viewer img{width:48px;height:61px;object-fit:contain;vertical-align:middle}
  `;
  document.head.append(style);
  const panel = document.createElement('details'); panel.id = 'resident-viewer'; panel.open = true;
  panel.innerHTML = `<summary>Resident · local scene viewer</summary>
    <p class="viewer-note"><img src="/hero/walker/frame-1.webp" alt="Original thin pencil figure reference"> Real site geometry and controls; tools are not published.</p>
    <fieldset><legend>Scene</legend><label for="resident-scene">Action</label><select id="resident-scene"></select><label for="resident-variant">Variant</label><input id="resident-variant" type="number" min="0" max="2" value="0"><label for="resident-speed">Speed</label><select id="resident-speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select><button type="button" id="resident-play">Play scene</button><button type="button" id="resident-stop">Interrupt</button></fieldset>
    <fieldset><legend>Lifecycle</legend><button type="button" id="resident-toggle-pause">Pause resident</button><label><input type="checkbox" id="resident-rig-debug"> Show joints and contacts</label><label><input type="checkbox" id="resident-reduced"> Reduced-motion behavior</label><label><input type="checkbox" id="resident-external-pause"> Simulate external pause</label><label for="resident-seed">Random seed</label><input id="resident-seed" type="number" value="42"><button type="button" id="resident-set-seed">Apply seed</button></fieldset>
    <fieldset><legend>Context</legend><button type="button" data-view="home">Home</button><button type="button" data-view="work">Work</button><button type="button" data-view="despre">About</button><button type="button" data-view="process">Process</button><button type="button" data-view="andra">ANDRA</button></fieldset>
    <p id="resident-viewer-message" role="status">Waiting for the resident controller…</p><pre id="resident-viewer-state" aria-label="Current resident state"></pre>`;
  document.body.append(panel);
  const $ = id => panel.querySelector('#' + id), message = text => { $('resident-viewer-message').textContent = text; };
  let paused = false, connected = false, destroyed = false, refreshTimer = 0, attempts = 0;
  const get = () => window.portfolioCompanion;
  const invoke = (name, ...args) => {
    if (typeof get()?.[name] !== 'function') { message(`Controller does not expose ${name} yet.`); return null; }
    try { return get()[name](...args); } catch (error) { message(error.message); return null; }
  };
  const summarize = () => {
    const state = invoke('getState');
    if (!state) return;
    const life = state.life || {};
    const selected = {mode: state.mode, action: state.action, phase: life.phase, token: life.token, paused: state.paused ?? life.paused, hiddenReason: state.hiddenReason, anchor: state.anchor, fixture: state.fixture, dragging: state.dragging, worldPos: state.worldPos || state.world, position: state.position || state.current, frameScheduled: state.frameScheduled, lifeFrame: life.frameScheduled, lifeTimer: life.timerScheduled, pendingInteraction: life.interactionPending, props: state.rig?.handProp};
    $('resident-viewer-state').textContent = JSON.stringify(selected, null, 2);
  };
  function tick() {
    refreshTimer = 0;
    if (destroyed || document.hidden) return;
    if (!connected) {
      if (get()?.play && get()?.getState) connect();
      else if (++attempts >= 80) { message('Resident controller was not connected. Check the console and script order.'); return; }
    }
    if (connected && panel.open) summarize();
    refreshTimer = setTimeout(tick, 500);
  }
  function connect() {
    connected = true;
    const rigActions = window.StudioCharacterRig?.actions || [];
    const ids = [...new Set([...Object.keys(window.StudioCharacterLife?.activities || {}), ...rigActions])];
    for (const id of ids) { const option = document.createElement('option'); option.value = id; option.textContent = id; $('resident-scene').append(option); }
    $('resident-scene').value = ids.includes('work') ? 'work' : ids[0];
    message('Ready. Playback uses the current site context and available space.');
    invoke('seed', 42);
  }
  $('resident-play').onclick = () => {
    const id = $('resident-scene').value, speed = Number($('resident-speed').value);
    if (window.StudioCharacterLife?.config) StudioCharacterLife.config.timeScale = 1 / speed;
    const result = invoke('play', id, {variant: Number($('resident-variant').value), debug: $('resident-rig-debug').checked, speed});
    message(`Requested ${id}; unavailable scenes may be declined for this context.`);
    if (result?.catch) result.catch(error => message(error.message));
  };
  $('resident-stop').onclick = () => { invoke('stop'); message('Current scene interrupted.'); };
  $('resident-toggle-pause').onclick = () => { paused = !paused; invoke('pause', paused); $('resident-toggle-pause').textContent = paused ? 'Resume resident' : 'Pause resident'; };
  $('resident-rig-debug').onchange = event => invoke('setDebug', event.target.checked);
  $('resident-reduced').onchange = event => invoke('setReduced', event.target.checked);
  $('resident-external-pause').onchange = event => invoke('setExternalPause', event.target.checked);
  $('resident-set-seed').onclick = () => { invoke('seed', Number($('resident-seed').value)); message('Random seed applied.'); };
  panel.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { const view = button.dataset.view; if (view === 'home') portfolioEntry.showHome(); else if (view === 'work') portfolioEntry.enterWork(); else portfolioEntry.open(view); }; });
  document.addEventListener('visibilitychange', () => { clearTimeout(refreshTimer); refreshTimer = 0; if (!document.hidden) tick(); });
  addEventListener('pagehide', () => { clearTimeout(refreshTimer); refreshTimer = 0; });
  addEventListener('pageshow', () => { if (!refreshTimer) tick(); });
  window.residentViewer = Object.freeze({refresh: summarize, destroy: () => { destroyed = true; clearTimeout(refreshTimer); invoke('setDebug', false); panel.remove(); style.remove(); }});
  tick();
})();
