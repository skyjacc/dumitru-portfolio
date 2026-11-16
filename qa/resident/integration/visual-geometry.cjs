/* Real rendered bounds, not snapshots of intended CSS dimensions. */
const fs = require('node:fs'), path = require('node:path'), crypto=require('node:crypto');
let pw; try { pw = require('playwright'); } catch (_) { pw = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright'); }
const out = path.join(__dirname, 'visual-geometry'); fs.mkdirSync(out, {recursive: true});
const intersects = (a,b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
(async () => {
  const browser = await pw.chromium.launch({headless: true, channel: 'chrome'}), checks = [];
  const sourceHashes=()=>Object.fromEntries(['site/studio-companion.js','site/studio-character-rig.js','site/studio-companion.css','site/entry-flow.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../..',file))).digest('hex')]));
  const startedSources=sourceHashes();
  const add = (name, pass, data) => {checks.push({name,pass,data}); fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({startedSources,checks},null,2)); if (!pass) console.log('FAIL '+name);};
  for (const size of [{w:1440,h:900},{w:390,h:844},{w:320,h:568},{w:844,h:390}]) {
    const page = await browser.newPage({viewport:{width:size.w,height:size.h},deviceScaleFactor:1,hasTouch:size.w<900});
    const tag = `${size.w}x${size.h}`;
    const settle = mode => page.waitForFunction(mode => portfolioEntry.mode === mode && !portfolioEntry.pending && !portfolioRuntime.moving, mode, {timeout:25000});
    const snapshot = () => page.evaluate(() => {
      const c=portfolioCompanion.getState(),p=c.position,b=c.rig?.bounds;
      const rect=selector => {const n=document.querySelector(selector); if (!n || !n.getClientRects().length || n.hidden || getComputedStyle(n).visibility==='hidden') return null; return n.getBoundingClientRect().toJSON();};
      return {c,body:p&&b?{left:p.x+(b.left-60)*p.scale,right:p.x+(b.right-60)*p.scale,top:p.y+(b.top-100)*p.scale,bottom:p.y+(b.bottom-100)*p.scale}:null,front:portfolioWorkGeometry()?.front,pause:rect('#companion-pause'),protected:['#home-control','#language-toggle','.portfolio-nav','#material-dots','#previous-material','#next-material','#visit-control'].map(selector=>({selector,rect:rect(selector)})).filter(a=>a.rect)};
    });
    try {
      await page.goto('http://127.0.0.1:8943/');
      await page.waitForFunction(()=>portfolioLoader.getState().phase==='complete'&&portfolioCharacter.getState().retired,null,{timeout:45000});
      for (const fontSize of ['100%','125%','150%','200%']) {
        await page.evaluate(fontSize=>document.documentElement.style.fontSize=fontSize,fontSize);
        const s=await snapshot();
        add(`${tag} ${fontSize} pause has clear header placement`,s.protected.filter(x=>x.selector!=='#material-dots').every(x=>!intersects(s.pause,x.rect)),s);
      }
      await page.evaluate(()=>document.documentElement.style.fontSize='');
      await page.locator('#work-toggle').click(); await settle('work');
      for(const staticMode of ['paused','reduced']) {
        if(staticMode==='paused') await page.evaluate(()=>portfolioCompanion.pause(true));
        else {await page.emulateMedia({reducedMotion:'reduce'}); await page.evaluate(()=>portfolioCompanion.pause(false));}
        for(const key of ['andra','ora','fkd','bonanza','btb']) {
          await page.evaluate(key=>portfolioEntry.open(key),key); await settle('detail');
          for(let index=0;index<4;index++) {
            if(index) await page.locator('#next-material').click();
            else await page.locator('#material-dots [data-material="0"]').click();
            // Native camera 'moving' does not include the separate material spring.
            await page.waitForFunction(index=>{
              const c=portfolioCompanion.getState(),f=portfolioWorkGeometry()?.front;
              if(portfolioRuntime.moving||portfolioEntry.pending||c.frameScheduled||c.materialIndex!==index||f?.index!==index){window.__residentGeometryStable=null;return false;}
              const signature=[f.left,f.top,f.right,f.bottom,f.radius],old=window.__residentGeometryStable;
              if(!old||old.key!==f.key||old.index!==index||signature.some((v,n)=>Math.abs(v-old.signature[n])>.02)){window.__residentGeometryStable={key:f.key,index,signature,time:performance.now()};return false;}
              return performance.now()-old.time>300;
            },index,{timeout:14000});
            const s=await snapshot();
            add(`${tag} ${staticMode} ${key}:${index} resident avoids front and controls`,!s.c.active || (!intersects(s.body,s.front)&&s.protected.every(x=>!intersects(s.body,x.rect))),s);
            add(`${tag} ${staticMode} ${key}:${index} pause avoids controls`,s.protected.every(x=>!intersects(s.pause,x.rect)),{pause:s.pause,protected:s.protected});
            if(key==='andra'&&index===3&&staticMode==='paused') await page.screenshot({path:path.join(out,tag+'-detail.png')});
          }
          await page.locator('#studio-back').click(); await settle('work');
        }
      }
      if(size.w===1440) {
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.waitForFunction(()=>!portfolioCompanion.getState().life.reduced);
        await page.evaluate(()=>{portfolioCompanion.seed(42);portfolioCompanion.pause(false);portfolioEntry.open('andra');}); await settle('detail');
        await page.waitForFunction(()=>!portfolioCompanion.getState().life.pauseReasons.length,null,{timeout:10000});
        await page.evaluate(()=>{void portfolioCompanion.play('peek',{variant:0,debug:true});});
        await page.waitForFunction(()=>{const s=portfolioCompanion.getState();return s.life.activity==='peek'&&s.life.phase==='perform'&&s.life.phaseElapsed>3200;},null,{timeout:16000});
        const s=await page.evaluate(()=>{
          const c=portfolioCompanion.getState(),p=c.position,h=c.rig.head,front=portfolioWorkGeometry().front;
          const head={x:p.x+(h.x-60)*p.scale,y:p.y+(h.y-100)*p.scale};
          return {c,front,head,clip:document.querySelector('.resident-body').style.clipPath,grip:document.querySelector('.resident-grip path')?.getAttribute('d')};
        });
        add('desktop midpoint peek exposes its head beyond the real card edge',!!s.clip && (s.head.x<s.front.left || s.head.x>s.front.right),s);
        await page.screenshot({path:path.join(out,'peek-midpoint.png')});
      }
    } catch(error) {add(tag+' harness completes',false,{error:String(error.stack||error),state:await snapshot().catch(()=>null)}); await page.screenshot({path:path.join(out,tag+'-failure.png')}).catch(()=>{});}
    await page.close();
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks},null,2));
  }
  await browser.close();
  const finishedSources=sourceHashes();
  add('application sources stayed unchanged during this run',JSON.stringify(startedSources)===JSON.stringify(finishedSources),{startedSources,finishedSources});
  console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass).map(c=>({name:c.name,error:c.data?.error,body:c.data?.body,front:c.data?.front,hiddenReason:c.data?.c?.hiddenReason}))},null,2));
  if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
