const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const pw = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin = process.env.ORIGIN || 'http://127.0.0.1:8943';
const out = process.env.OUT || __dirname;
fs.mkdirSync(out,{recursive:true});

async function run(engine, mobile) {
  const browser = await pw[engine].launch({headless:true});
  const context = await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce'});
  const page = await context.newPage();
  const r = {engine, origin, mobile, checks:[], states:[], errors:[]};
  const save = () => fs.writeFileSync(path.join(out,engine+'-results.json'),JSON.stringify(r,null,2));
  const check = (name,pass,data) => {r.checks.push({name,pass:!!pass,data});save();};
  const settled = mode => page.waitForFunction(mode=>window.portfolioEntry?.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime.moving),mode,{timeout:45000});
  const click = selector => mobile?page.locator(selector).tap():page.locator(selector).click();
  const state = async label => {
    const s=await page.evaluate(()=>({mode:portfolioEntry.mode,pending:portfolioEntry.pending,phone:portfolioAbout.getState(),key:portfolioRuntime.focusedKey,focus:document.activeElement.id,selectionStart:document.activeElement.selectionStart,selectionEnd:document.activeElement.selectionEnd,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    r.states.push({label,...s});save();return s;
  };
  const cdp = engine==='chromium'?await page.context().newCDPSession(page):null;
  const landmark = async label => {
    if(!cdp)return;
    const ax = await cdp.send('Accessibility.getFullAXTree');
    const mains=ax.nodes.filter(n=>!n.ignored&&n.role?.value==='main').map(n=>({name:n.name?.value,backendDOMNodeId:n.backendDOMNodeId}));
    check('exactly one exposed main: '+label,mains.length===1,mains);
  };
  page.on('pageerror',e=>r.errors.push(String(e)));
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new DOMException('Test denial','NotAllowedError'))}}));
  try {
    await page.goto(origin,{waitUntil:'commit'});
    await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete',null,{timeout:45000});await settled('home');
    const served=await(await page.request.get(origin+'/entry-flow.js')).body();r.entrySha256=crypto.createHash('sha256').update(served).digest('hex');
    await landmark('Home');
    await click('#nav-contact');await settled('about');await landmark('Contact');
    await click('.about-copy-email');await page.waitForFunction(()=>document.activeElement.id==='about-email-address');
    check('copy denial selects fallback',await page.locator('#about-email-address').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
    // WebKit's Home binding in a single-line input differs from Chromium. Use
    // an isolated native control as the oracle, not a forced cross-engine caret.
    const nativePage=await page.context().newPage();
    await nativePage.setContent('<!doctype html><title>Native Home reference</title><input readonly>');
    await nativePage.locator('input').evaluate((e,value)=>{e.value=value;e.focus();e.setSelectionRange(value.length,value.length)},await page.locator('#about-email-address').inputValue());
    await nativePage.keyboard.press('Home');
    r.nativeReadonlyHome=await nativePage.locator('input').evaluate(e=>({start:e.selectionStart,end:e.selectionEnd}));await nativePage.close();
    await page.evaluate(()=>{window.__qaHomeEvents=[];window.addEventListener('keydown',event=>{if(event.key==='Home')window.__qaHomeEvents.push({target:event.target.id,prevented:event.defaultPrevented});});});
    await page.locator('#about-email-address').evaluate(e=>{e.focus();e.setSelectionRange(e.value.length,e.value.length)});
    await page.keyboard.press('Home');await page.waitForTimeout(150);
    let s=await state('email-home');
    check('Home in email keeps Contact/focus and native caret behavior',s.mode==='about'&&s.phone.view==='contact'&&s.focus==='about-email-address'&&s.selectionStart===r.nativeReadonlyHome.start&&s.selectionEnd===r.nativeReadonlyHome.end,{actual:s,native:r.nativeReadonlyHome});
    const keyEvent=await page.evaluate(()=>window.__qaHomeEvents.at(-1));
    check('email Home propagates without preventDefault',keyEvent?.target==='about-email-address'&&keyEvent.prevented===false,keyEvent);
    await page.screenshot({path:path.join(out,engine+'-email-home.png')});

    // Ephemeral probes exercise the global guard with native control types. They
    // exist only in this test page and are removed before navigation/screenshots.
    for(const kind of ['textarea','contenteditable']) {
      await page.evaluate(kind=>{
        const host=document.querySelector('.about-contact-content');const el=document.createElement(kind==='textarea'?'textarea':'div');
        el.id='qa-native-editor';el.style.cssText='position:fixed;left:12px;top:120px;z-index:99999;width:240px;min-height:60px;background:white;color:black';
        if(kind==='textarea')el.value='First line\nSecond line';else {el.contentEditable='true';el.textContent='Editable text';}
        host.append(el);el.focus();if(kind==='textarea')el.setSelectionRange(el.value.length,el.value.length);else {const selection=getSelection();selection.selectAllChildren(el);selection.collapseToEnd();}
      },kind);
      await page.keyboard.press('Home');await page.waitForTimeout(100);
      const native=await page.evaluate(()=>{const e=document.querySelector('#qa-native-editor');return{mode:portfolioEntry.mode,view:portfolioAbout.getState().view,focused:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,anchor:getSelection().anchorOffset,focus:getSelection().focusOffset}});
      check('Home native '+kind,native.mode==='about'&&native.view==='contact'&&native.focused&&(kind==='textarea'?native.start===11&&native.end===11:native.anchor===0&&native.focus===0),native);
      await page.evaluate(()=>document.querySelector('#qa-native-editor').remove());
    }
    await page.locator('#nav-contact').focus();await page.keyboard.press('Home');await settled('home');
    check('Home outside editor retains global return',(await state('global-home')).mode==='home');await landmark('Home after Contact');

    await click('#about-control');await settled('about');await landmark('About');
    await click('.about-photo-grid button[data-photo="0"]');await page.waitForFunction(()=>portfolioAbout.getState().view==='photo');
    await click('.about-photo-next');await page.waitForFunction(()=>portfolioAbout.getState().photo===1);
    check('photo navigation remains sequential',await page.evaluate(()=>portfolioAbout.getState().photo===1));
    await page.keyboard.press('Escape');await page.waitForFunction(()=>portfolioAbout.getState().view==='profile');
    await page.screenshot({path:path.join(out,engine+'-about.png')});
    await click('#process-control');await settled('process');await landmark('Process');
    await page.screenshot({path:path.join(out,engine+'-process.png')});
    await click('#work-toggle');await settled('work');await landmark('Work');
    await page.screenshot({path:path.join(out,engine+'-work.png')});
    await page.evaluate(()=>portfolioEntry.open('andra'));await settled('detail');await landmark('Detail ANDRA');
    await click('#next-material');await page.waitForFunction(()=>portfolioRuntime.materialIndex===1);
    check('material next remains sequential',await page.evaluate(()=>portfolioRuntime.materialIndex===1));
    await page.screenshot({path:path.join(out,engine+'-detail.png')});
    await click('#studio-back');await settled('work');await landmark('Work after Detail');
    await click('#about-control');await settled('about');check('Work to About remains profile',await page.evaluate(()=>portfolioAbout.getState().view==='profile'));
    await click('#about-control');await settled('home');await landmark('Home after About toggle');
    check('no document horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('no JavaScript page errors',r.errors.length===0,r.errors);
  } catch(e) {r.failure=String(e.stack||e);save();throw e;}
  finally {save();await browser.close();}
  console.log(JSON.stringify({engine,pass:r.checks.filter(c=>c.pass).length,fail:r.checks.filter(c=>!c.pass),errors:r.errors}));
  return r;
}
(async()=>{const results=[];for(const cfg of [['chromium',false],['webkit',true]])results.push(await run(...cfg));if(results.some(r=>r.checks.some(c=>!c.pass)))process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1});
