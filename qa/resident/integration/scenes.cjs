/* Connected-scene checks; invoke after the coordinator build is settled. */
const fs = require('node:fs'), path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch (_) { playwright = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'); }
const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:8943', out = path.join(__dirname, 'scenes');
fs.mkdirSync(out, {recursive: true});
const near = (a, b, keys = ['x', 'y', 'scale']) => !!a && !!b && keys.every(key => Math.abs(a[key] - b[key]) < .08);

(async () => {
  const browser = await playwright.chromium.launch({headless: true, channel: 'chrome'});
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
  const checks = [], errors = [];
  const check = (name, pass, data) => checks.push({name, pass, data});
  const state = () => page.evaluate(() => portfolioCompanion.getState());
  const point = () => page.evaluate(() => {
    const node = document.querySelector('.resident-hit[data-resident-hit="body"]');
    const p = node.getPointAtLength(node.getTotalLength() * .4).matrixTransform(node.getScreenCTM());
    return {x: p.x, y: p.y};
  });
  const settle = mode => page.waitForFunction(mode => portfolioEntry.mode === mode && !portfolioEntry.pending && !portfolioRuntime.moving, mode, {timeout: 25000});
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(origin + '/');
    await page.waitForFunction(() => portfolioLoader.getState().phase === 'complete' && portfolioCharacter.getState().retired, null, {timeout: 45000});
    await page.locator('#work-toggle').click(); await settle('work');
    await page.waitForTimeout(1900);
    for (const action of ['work', 'coffee', 'sword', 'pushups']) {
      await page.evaluate(action => { portfolioCompanion.seed(42); portfolioCompanion.pause(false); void portfolioCompanion.play(action, {variant: 0}); }, action);
      await page.waitForFunction(action => {
        const c = portfolioCompanion.getState();
        return c.life.activity === action && c.life.phase === 'perform' && c.rig.action === action;
      }, action, {timeout: 15000});
      if (action === 'coffee') await page.waitForTimeout(1700);
      const before = await state(), grab = await point();
      const camera = await page.evaluate(() => ({...portfolioRuntime.camera}));
      await page.screenshot({path: path.join(out, action + '-before.png')});
      await page.mouse.move(grab.x, grab.y); await page.mouse.down();
      await page.mouse.move(grab.x + 50, grab.y - 24, {steps: 8});
      const held = await state();
      const heldCamera = await page.evaluate(() => ({...portfolioRuntime.camera}));
      check(action + ': grabbing interrupts the scene immediately', held.dragging && held.rig.action === 'lift' && held.life.activity === null, held);
      check(action + ': camera remains independent', near(camera, heldCamera, ['x', 'y', 'zoom']), {camera, heldCamera});
      if (before.fixture) check(action + ': surface furniture stays at its original anchor', held.fixture && near(before.fixture.position, held.fixture.position), {before: before.fixture, held: held.fixture});
      if (before.rig.handProp) check(action + ': held prop remains attached during lift', held.rig.handProp?.kind === before.rig.handProp.kind, {before: before.rig.handProp, held: held.rig.handProp});
      await page.screenshot({path: path.join(out, action + '-lift.png')});
      await page.mouse.up(); await page.waitForTimeout(650);
      check(action + ': drop leaves neither drag nor accidental project open', !(await state()).dragging && await page.evaluate(() => portfolioEntry.mode === 'work' && !portfolioRuntime.focusedKey));
    }
    await page.evaluate(() => portfolioEntry.open('andra')); await settle('detail');
    await page.waitForFunction(() => !portfolioCompanion.getState().life.pauseReasons.length, null, {timeout: 12000});
    await page.evaluate(() => { void portfolioCompanion.play('peek', {variant: 0, debug: true}); });
    await page.waitForFunction(() => portfolioCompanion.getState().life.activity === 'peek' && portfolioCompanion.getState().life.phase === 'perform', null, {timeout: 15000});
    await page.waitForTimeout(1500);
    const peek = await page.evaluate(() => {
      const c = portfolioCompanion.getState(), front = portfolioWorkGeometry().front;
      const body = document.querySelector('.resident-body'), grip = document.querySelector('.resident-grip');
      return {c, front, mask: body?.getAttribute('mask'), clip: body?.getAttribute('clip-path'), style: body?.getAttribute('style'), gripVisible: !!grip?.getClientRects().length, decorative: document.getElementById('work-companion').dataset.interactive !== 'true'};
    });
    check('ANDRA peek uses actual drawn contour and a body mask', peek.front?.drawn && Number.isFinite(peek.front.radius) && !!(peek.mask || peek.clip || /clip|mask/.test(peek.style || '')), peek);
    check('ANDRA peek keeps the material interaction surface decorative', peek.decorative && peek.gripVisible, peek);
    await page.screenshot({path: path.join(out, 'andra-peek.png')});
    await page.locator('#next-material').click(); await page.locator('#next-material').click(); await page.locator('#next-material').click();
    await page.waitForTimeout(1000);
    const afterMaterials = await state();
    check('rapid material change invalidates previous peek target', afterMaterials.materialIndex === 3 && afterMaterials.life.target?.index !== 0, afterMaterials);
  } catch (error) {
    checks.push({name: 'scene harness completed', pass: false, data: {error: String(error.stack || error), state: await state().catch(() => null)}});
    await page.screenshot({path: path.join(out, 'failure.png')}).catch(() => {});
  }
  check('no browser errors', errors.length === 0, errors);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({origin, checks}, null, 2));
  console.log(JSON.stringify({checks: checks.length, failures: checks.filter(check => !check.pass)}, null, 2));
  await browser.close();
  if (checks.some(check => !check.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
