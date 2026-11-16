/* Current user override: original Home walker; no public pause control. */
const fs = require('node:fs'), path = require('node:path');
let pw; try { pw = require('playwright'); } catch { pw = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'); }
const out = path.join(__dirname, 'home-preservation');
fs.mkdirSync(out, {recursive: true});
const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:8943';
const configs = [
  {name: 'desktop', engine: 'chromium', width: 1440, height: 900},
  {name: 'touch390', engine: 'chromium', width: 390, height: 844, touch: true},
  {name: 'webkit320', engine: 'webkit', width: 320, height: 640, touch: true}
];
const state = page => page.evaluate(() => {
  const visible = id => {const n = document.getElementById(id);if (!n || n.hidden)return false;const c=getComputedStyle(n);return c.display!=='none'&&c.visibility!=='hidden'&&Number(c.opacity)>.05;};
  const c=portfolioCompanion.getState();
  return {entry:portfolioEntry.mode, original:portfolioCharacter.getState(), c:{active:c.active, mode:c.mode, world:c.worldPos, dragging:c.dragging, selected:c.selected, frame:c.frameScheduled, fixture:c.fixture, life:c.life}, oldVisible:visible('loader-walker'), newVisible:visible('work-companion'), fixturesVisible:visible('companion-fixtures'), pause:!!document.getElementById('companion-pause')};
});
(async () => {
  const report=[];
  for (const config of configs) {
    const browser=await pw[config.engine].launch({headless:true,...(config.engine==='chromium'?{channel:'chrome'}:{})});
    const page=await browser.newPage({viewport:{width:config.width,height:config.height},isMobile:!!config.touch,hasTouch:!!config.touch,deviceScaleFactor:config.touch?3:1});
    const checks=[], errors=[];
    const check=(name,pass,data)=>checks.push({name,pass,data});
    const settled=mode=>page.waitForFunction(mode=>portfolioEntry.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:30000});
    const isHome=s=>s.original.active&&!s.original.retired&&s.oldVisible&&!s.newVisible&&!s.fixturesVisible&&!s.c.active&&!s.c.frame&&!s.c.life.running&&!s.c.life.frameScheduled&&!s.c.life.timerScheduled&&!s.c.life.interactionTimerScheduled&&!s.pause;
    page.on('pageerror',e=>errors.push(e.message));
    // A value left by the deleted pause UI must not strand the new controller.
    await page.addInitScript(()=>localStorage.setItem('dumitru-character-paused','true'));
    try {
      await page.goto(origin);
      await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});
      await settled('home');
      await page.waitForFunction(()=>!portfolioCharacter.getState().returning);
      check('Home keeps original drawing, sole input owner and no resident clocks',isHome(await state(page)),await state(page));
      await page.screenshot({path:path.join(out,config.name+'-home.png'),scale:'css'});
      await page.evaluate(()=>{
        window.__ownerOverlaps=0;window.__ownershipSamples=0;
        const shown=id=>{const n=document.getElementById(id),s=getComputedStyle(n);return !n.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>.05;};
        function sample(){__ownershipSamples++;if(shown('loader-walker')&&shown('work-companion'))__ownerOverlaps++;requestAnimationFrame(sample)}sample();
      });
      if (!config.touch) {
        const before=await page.evaluate(()=>portfolioCharacter.getState().x);
        await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');
        const after=await state(page);
        check('Home D input moves only the original walker',after.original.x>before+10&&!after.newVisible&&!after.c.frame,{before,after});
      }
      const rejected=await page.evaluate(()=>portfolioCompanion.play('coffee',{debug:true}));
      await page.setViewportSize({width:config.width,height:config.height-35});await page.waitForTimeout(180);
      check('Home resize and debug scene cannot activate a second figure',rejected===false&&isHome(await state(page)),await state(page));
      await page.setViewportSize({width:config.width,height:config.height});
      for (let visit=0;visit<2;visit++) {
        await page.locator('#work-toggle').click();await settled('work');
        await page.waitForFunction(()=>portfolioCompanion.getState().active&&portfolioCompanion.getState().life.running);
        let s=await state(page);
        check(`Work ${visit+1} suspends original and starts unpaused SVG`,!s.oldVisible&&!s.original.active&&!s.original.retired&&!s.c.life.userPaused&&s.c.active&&!s.pause,s);
        await page.evaluate(()=>portfolioCompanion.pause(true));
        await page.waitForFunction(()=>!portfolioCompanion.getState().frameScheduled);
        const saved=(await state(page)).c.world;
        await page.evaluate(()=>portfolioEntry.open('andra'));await settled('detail');
        check('Detail retains original suspension and no public pause',!(await state(page)).original.active&&!(await state(page)).pause);
        await page.locator('#studio-back').click();await settled('work');
        await page.waitForFunction(()=>!portfolioCompanion.getState().frameScheduled);
        const restored=(await state(page)).c.world;
        check('Project return retains board position',Math.hypot(saved.x-restored.x,saved.y-restored.y)<.05,{saved,restored});
        await page.evaluate(()=>portfolioCompanion.pause(false));
        await page.locator('#home-control').click();await settled('home');
        await page.waitForTimeout(220);
        check(`Return ${visit+1} restores only original Home walker`,isHome(await state(page)),await state(page));
      }
      for (const [selector,mode] of [['#about-control','about'],['#process-control','process']]) {
        await page.locator(selector).click();await settled(mode);
        check(mode+' keeps original suspended',!(await state(page)).oldVisible&&!(await state(page)).original.active);
        await page.locator('#home-control').click();await settled('home');
        check(mode+' return restores original',isHome(await state(page)),await state(page));
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.locator('#work-toggle').click();await settled('work');await page.waitForTimeout(200);
      let s=await state(page);
      check('Reduced motion remains static without public pause UI',s.c.life.reduced&&!s.c.life.frameScheduled&&!s.c.frame&&!s.pause,s);
      await page.locator('#home-control').click();await settled('home');
      check('Reduced Home preserves visible original',isHome(await state(page)),await state(page));
      const samples=await page.evaluate(()=>({overlaps:__ownerOverlaps,samples:__ownershipSamples}));
      check('Transition frames never show both figures',samples.samples>50&&samples.overlaps===0,samples);
      check('No browser errors',errors.length===0,errors);
    } catch(e) { check('Scenario completed',false,{error:e.message,state:await state(page).catch(()=>null)}); }
    report.push({config,checks,errors});await browser.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  for(const r of report)console.log(JSON.stringify({name:r.config.name,passed:r.checks.filter(c=>c.pass).length,total:r.checks.length,failures:r.checks.filter(c=>!c.pass)}));
  if(report.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;
})();
