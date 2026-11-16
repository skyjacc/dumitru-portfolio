const fs = require('node:fs');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'); }
const source = fs.readFileSync(path.resolve(__dirname, '../../../site/character-runtime.js'), 'utf8');
const out = path.join(__dirname, 'legacy-lifecycle-report.json');
const results = [];

async function fixture(page, mode = 'home') {
  await page.setContent(`<!doctype html><style>
    #loader-walker {position:fixed;left:36px;bottom:0;width:80px;height:102px}
    .walker-frame {width:80px;height:102px}.desk-object {position:absolute;left:300px;top:200px}
  </style><body data-entry="${mode}">
    <div id="loader-walker" data-frame="4" data-direction="right"><img class="walker-frame" data-pose="4"></div>
    <div id="studio-home"><div class="desk-object" data-desk-object="laptop" data-reveal="settled"><div class="desk-cutout"></div></div></div>
  </body>`);
  await page.evaluate(() => {
    window.__lifecycle = {observers: 0, rasterizations: 0};
    const OriginalObserver = MutationObserver;
    window.MutationObserver = class extends OriginalObserver {
      constructor(...args) { super(...args); this.owned = new Error().stack.includes('legacy-character-under-test.js'); }
      observe(...args) { if (this.owned && !this.counted) { this.counted = true; __lifecycle.observers++; } return super.observe(...args); }
      disconnect() { if (this.counted) { this.counted = false; __lifecycle.observers--; } return super.disconnect(); }
    };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args) { __lifecycle.rasterizations++; return getContext.apply(this, args); };
  });
  await page.addScriptTag({content: source + '\n//# sourceURL=legacy-character-under-test.js'});
}

(async () => {
  for (const engineName of ['chromium', 'webkit']) {
    const browser = await playwright[engineName].launch({headless: true, ...(engineName === 'chromium' ? {channel: 'chrome'} : {})});
    const page = await browser.newPage({viewport: {width: 900, height: 640}});
    const checks = [], errors = [];
    const check = (name, pass, data) => checks.push({name, pass, data});
    page.on('pageerror', error => errors.push(error.message));
    try {
      await fixture(page);
      await page.evaluate(() => portfolioCharacter.start({x: 180, direction: -1}));
      await page.waitForFunction(() => portfolioCharacter.getState().animating);
      const paused = await page.evaluate(() => {
        portfolioCharacter.suspend();
        dispatchEvent(new CustomEvent('portfolio:entrystate', {detail: {mode: 'home'}}));
        return portfolioCharacter.getState();
      });
      check('explicit suspend remains paused across entry notification', paused.suspended && !paused.active && !paused.animating, paused);
      const resumed = await page.evaluate(() => portfolioCharacter.resume());
      check('resume restores pre-retirement Home ownership', resumed.active && !resumed.suspended && !resumed.retired, resumed);

      // Hold a real image request across retirement: its decode/load continuation
      // must not rebuild collision masks or reawaken the previous controller.
      let releaseImage;
      const requested = new Promise(resolve => {
        page.route('https://resident.test/delayed.svg', route => {
          releaseImage = () => route.fulfill({contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100"><rect width="80" height="100" fill="white"/></svg>'});
          resolve();
        });
      });
      await page.evaluate(() => {
        const image = document.createElement('img');
        image.src = 'https://resident.test/delayed.svg';
        document.querySelector('.desk-cutout').append(image);
        dispatchEvent(new CustomEvent('portfolio:deskready'));
      });
      await requested;
      await page.waitForTimeout(80);
      const handoff = await page.evaluate(() => {
        dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyD', key: 'd', bubbles: true, cancelable: true}));
        const before = document.getElementById('loader-walker').getBoundingClientRect().toJSON();
        const value = portfolioCharacter.retire();
        return {before, value, state: portfolioCharacter.getState(), resources: {...__lifecycle}};
      });
      check('handoff captures visible translated rect before hiding', handoff.value.rect.width === 80 && handoff.value.rect.height === 102 && Math.abs(handoff.value.rect.x - handoff.before.x) < .01 && handoff.value.direction === 1, handoff);
      check('retirement clears animation, keys, observers and masks immediately', handoff.state.retired && !handoff.state.active && !handoff.state.animating && !handoff.state.idleScheduled && !handoff.state.heldKeys.length && !handoff.state.maskCount && !handoff.resources.observers, handoff.state);
      await releaseImage();
      await page.waitForTimeout(120);
      const after = await page.evaluate(() => {
        const first = portfolioCharacter.retire();
        portfolioCharacter.start({x: 450}); portfolioCharacter.resume();
        document.body.dataset.entry = 'work'; document.body.dataset.entry = 'home';
        for (const name of ['portfolio:entrystate', 'portfolio:deskready', 'resize', 'pageshow', 'wheel']) dispatchEvent(new Event(name));
        document.dispatchEvent(new Event('visibilitychange'));
        const key = new KeyboardEvent('keydown', {code: 'KeyD', key: 'd', bubbles: true, cancelable: true});
        dispatchEvent(key);
        return {same: first === portfolioCharacter.retire(), state: portfolioCharacter.getState(), hidden: document.getElementById('loader-walker').hidden, intercepted: key.defaultPrevented, resources: {...__lifecycle}};
      });
      await page.waitForTimeout(50);
      check('retirement is idempotent and start/resume cannot reactivate input', after.same && after.hidden && !after.intercepted && after.state.retired && !after.state.active && !after.state.animating && !after.state.idleScheduled, after);
      check('late image decode/load does not rasterize or rebuild after handoff', after.resources.rasterizations === handoff.resources.rasterizations && !after.resources.observers && !after.state.maskBuildsQueued && !after.state.buildingMasks, after);

      await page.goto('about:blank');
      await fixture(page, 'loading');
      const loading = await page.evaluate(() => {
        const walker = document.getElementById('loader-walker');
        walker.style.transform = 'translate3d(215px,0,0)';
        walker.dataset.direction = 'left';
        const untouched = !walker.hidden;
        const value = portfolioCharacter.retire();
        return {untouched, value, state: portfolioCharacter.start({x: 999})};
      });
      check('retirement before start preserves loader until explicit handoff', loading.untouched && loading.value.rect.x === 251 && loading.value.direction === -1 && loading.state.retired && !loading.state.started && !loading.state.active, loading);
    } catch (error) {
      checks.push({name: 'harness completed', pass: false, data: String(error.stack || error)});
    }
    check('no browser errors', errors.length === 0, errors);
    results.push({engine: engineName, checks});
    await browser.close();
  }
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  const failures = results.flatMap(result => result.checks.filter(check => !check.pass).map(check => ({engine: result.engine, ...check})));
  console.log(JSON.stringify({checks: results.reduce((sum, result) => sum + result.checks.length, 0), failures}, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
