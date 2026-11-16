/* Run only after the connected resident build is ready. No production mutations. */
const fs = require('node:fs'), path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'); }
const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:8943';
const out = path.join(__dirname, 'connected');
const near = (a, b, keys = ['x', 'y'], tolerance = .05) => !!a && !!b && keys.every(key => Math.abs(a[key] - b[key]) < tolerance);
const overlap = (a, b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
fs.mkdirSync(out, {recursive: true});

async function takeState(page) {
  return page.evaluate(() => {
    const c = portfolioCompanion.getState();
    return {c, world: c.worldPos || c.world, position: c.position || c.current, camera: {...portfolioRuntime.camera}, geometry: portfolioWorkGeometry(), mode: portfolioEntry.mode};
  });
}

async function bodyPoint(page) {
  return page.evaluate(() => {
    const hit = document.querySelector('.resident-hit[data-resident-hit="body"]');
    if (!hit || !hit.getTotalLength) throw Error('Actual resident body hit path is unavailable');
    const point = hit.getPointAtLength(hit.getTotalLength() * .42).matrixTransform(hit.getScreenCTM());
    return {x: point.x, y: point.y};
  });
}

async function drag(page, spec, start, dx, dy, held) {
  if (spec.name === 'touch390') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{id: 1, ...start}]});
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{id: 1, x: start.x + dx * i / 8, y: start.y + dy * i / 8}]});
    // CDP acknowledges dispatch before the last coalesced pointermove is painted.
    await page.waitForTimeout(50);
    await held?.();
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await cdp.detach();
  } else {
    await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(start.x + dx, start.y + dy, {steps: 8});
    await held?.(); await page.mouse.up();
  }
}

(async () => {
  const report = [];
  for (const spec of [{name: 'desktop', engine: 'chromium', w: 1440, h: 900}, {name: 'touch390', engine: 'chromium', w: 390, h: 844}, {name: 'webkit320', engine: 'webkit', w: 320, h: 640}]) {
    if (process.env.REVIEW_ENGINE && process.env.REVIEW_ENGINE !== spec.name) continue;
    const browser = await playwright[spec.engine].launch({headless: true, ...(spec.engine === 'chromium' ? {channel: 'chrome'} : {})});
    const page = await browser.newPage({viewport: {width: spec.w, height: spec.h}, isMobile: spec.w < 500, hasTouch: spec.w < 500, deviceScaleFactor: spec.w < 500 ? 3 : 1});
    const checks = [], errors = [];
    const check = (name, pass, data) => checks.push({name, pass, data});
    const settle = mode => page.waitForFunction(mode => portfolioEntry.mode === mode && !portfolioEntry.pending && !portfolioRuntime.moving, mode, {timeout: 30000});
    const residentSettled = () => page.waitForFunction(() => !portfolioCompanion.getState().frameScheduled && !portfolioCompanion.getState().dragging, null, {timeout: 10000});
    const capture = name => page.screenshot({path: path.join(out, `${spec.name}-${name}.png`), scale: 'css'});
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(origin + '/?character-debug=1&review=resident');
      await page.waitForFunction(() => portfolioEntry?.ready && portfolioLoader.getState().phase === 'complete', null, {timeout: 45000});
      await settle('home');
      await page.waitForFunction(() => document.body.dataset.resident === 'ready' && portfolioCompanion.getState().mode === 'home');
      check('Loading preserves the original Home walker and keeps the SVG inactive', await page.evaluate(() => {
        const old = portfolioCharacter.getState(), c = portfolioCompanion.getState(), walker = document.getElementById('loader-walker');
        return old.active && !old.retired && !walker.hidden && getComputedStyle(walker).display !== 'none' && !c.active && !c.life.running && !c.frameScheduled && document.querySelectorAll('#work-companion').length === 1;
      }));
      check('no public pause control is inserted', await page.locator('#companion-pause').count() === 0);
      check('public resident control API exists', await page.evaluate(() => ['play', 'pause', 'refresh', 'getState'].every(key => typeof portfolioCompanion[key] === 'function')));
      await page.evaluate(() => portfolioCompanion.pause(true));
      await page.locator('#work-toggle').click(); await settle('work');
      await residentSettled();
      check('Work suspends the original Home controller without retiring it', await page.evaluate(() => {
        const old = portfolioCharacter.getState();
        return !old.active && !old.retired && !old.animating && document.getElementById('loader-walker').hidden && portfolioCompanion.getState().life.running;
      }));
      const initial = await takeState(page);
      await page.evaluate(() => {
        window.__residentFollow = [];
        addEventListener('portfolio:boardframe', event => {
          const c = portfolioCompanion.getState(), p = c.position || c.current, world = c.worldPos || c.world;
          if (c.mode !== 'work' || c.dragging || c.frameScheduled || c.anchor?.kind !== 'world' || !p || !world) return;
          const {camera, fitScale} = event.detail, g = portfolioWorkGeometry(), unit = camera.zoom * fitScale;
          const x = innerWidth / 2 + (g.home.x + world.x - camera.x) * unit;
          const y = innerHeight / 2 + (g.home.y + world.y - camera.y) * unit;
          __residentFollow.push({error: Math.max(Math.abs(p.x - x), Math.abs(p.y - y)), world: {...world}});
        });
      });
      await drag(page, spec, {x: spec.w * .80, y: spec.h * .67}, -spec.w * .17, -30);
      await page.waitForTimeout(700);
      const panned = await takeState(page);
      check('board pan changes screen projection without relocating resident world position', near(initial.world, panned.world) && !near(initial.position, panned.position), {initial, panned});
      if (spec.name === 'desktop') {
        await page.mouse.move(spec.w * .75, spec.h * .55);
        for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -150); await page.waitForTimeout(40); }
        await page.waitForTimeout(700);
      }
      const samples = await page.evaluate(() => __residentFollow);
      check('every sampled board frame uses the rendered camera', samples.length > 5 && samples.every(sample => sample.error < .1), {count: samples.length, maximumError: Math.max(0, ...samples.map(sample => sample.error))});
      await page.evaluate(() => portfolioEntry.showHome()); await settle('home');
      check('returning Home restores the original walker and stops SVG activity', await page.evaluate(() => {
        const old = portfolioCharacter.getState(), c = portfolioCompanion.getState();
        return old.active && !old.retired && !document.getElementById('loader-walker').hidden && !c.active && !c.life.running && !c.frameScheduled && !c.life.frameScheduled && !c.life.timerScheduled;
      }));
      await page.locator('#work-toggle').click(); await settle('work');
      await residentSettled();
      const beforeDrag = await takeState(page), point = await bodyPoint(page);
      let lifted;
      await drag(page, spec, point, 32, 20, async () => { lifted = await takeState(page); });
      await page.waitForTimeout(400);
      const dropped = await takeState(page);
      check('actual body hit zone captures drag without moving the board', !!lifted.c.dragging && near(beforeDrag.camera, lifted.camera, ['x', 'y', 'zoom']) && !near(beforeDrag.world, lifted.world), {beforeDrag, lifted});
      check('drag preserves pointer grab offset', Math.abs(lifted.position.x - beforeDrag.position.x - 32) < 2 && Math.abs(lifted.position.y - beforeDrag.position.y - 20) < 2, {before: beforeDrag.position, after: lifted.position});
      check('drop does not accidentally open a project', dropped.mode === 'work' && !dropped.c.dragging && !dropped.c.selected && !dropped.c.project, dropped);
      await capture('work');

      for (const key of ['andra', 'ora', 'fkd']) {
        await page.evaluate(key => portfolioEntry.open(key), key);
        await settle('detail');
        await page.waitForTimeout(180);
        for (let i = 0; i < 3; i++) await page.locator('#next-material').click();
        await page.waitForTimeout(900);
        const detail = await takeState(page);
        check(key + ' rapid material selection ends at the latest material', detail.c.project === key && detail.c.materialIndex === 3 && await page.evaluate(() => portfolioRuntime.materialIndex === 3), detail);
        if (key === 'andra') await capture('detail');
        await page.locator('#studio-back').click(); await settle('work'); await residentSettled();
      }
      const restored = await takeState(page);
      check('project return restores saved camera and resident spot', near(dropped.world, restored.world) && near(dropped.camera, restored.camera, ['x', 'y', 'zoom']), {dropped, restored});

      await page.locator('#about-control').click(); await settle('about');
      await capture('about');
      await page.locator('#process-control').click(); await settle('process');
      await page.locator('#work-toggle').click(); await settle('work');
      await residentSettled();
      check('mode transitions retain one visible owner and release interaction state', await page.evaluate(() => {
        const old = portfolioCharacter.getState(), c = portfolioCompanion.getState();
        return !old.retired && !old.active && document.getElementById('loader-walker').hidden && !c.dragging && c.mode === 'work' && !document.getElementById('companion-pause');
      }));

      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.evaluate(() => portfolioCompanion.pause(false));
      await page.waitForTimeout(500);
      const reduced = await takeState(page);
      check('reduced motion disables autonomous animation frames', !reduced.c.frameScheduled && !reduced.c.life?.frameScheduled && !reduced.c.dragging, reduced.c);
      await page.setViewportSize({width: spec.w < 500 ? spec.w : 1280, height: spec.w < 500 ? 620 : 760});
      await page.evaluate(() => portfolioEntry.open('andra')); await settle('detail');
      const controlGeometry = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
        const c = portfolioCompanion.getState();
        return {state: c, body: rect('#work-companion'), controls: ['.portfolio-nav', '#previous-material', '#next-material', '#material-dots', '#visit-control'].map(rect).filter(Boolean)};
      });
      check('resized detail resident avoids navigation and material controls', !controlGeometry.state.active || controlGeometry.controls.every(rect => !overlap(controlGeometry.body, rect)), controlGeometry);
      await capture('resized');

      // Controlled visibility notification; this checks lifecycle behavior, not
      // an operating-system/background-browser implementation claim.
      const hidden = await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {configurable: true, get: () => true});
        document.dispatchEvent(new Event('visibilitychange'));
        return portfolioCompanion.getState();
      });
      check('hidden document cancels scheduled resident work', !hidden.frameScheduled && !hidden.life?.frameScheduled && !hidden.life?.timerScheduled, hidden);
      await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    } catch (error) {
      checks.push({name: 'harness completed', pass: false, data: String(error.stack || error)});
      await capture('failure').catch(() => {});
    }
    check('no browser errors', errors.length === 0, errors);
    report.push({name: spec.name, checks});
    await browser.close();
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({origin, report}, null, 2));
    console.log(JSON.stringify({name: spec.name, checks: checks.length, failures: checks.filter(check => !check.pass)}));
  }
  if (report.some(run => run.checks.some(check => !check.pass))) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
