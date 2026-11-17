/* Independent browser regression: final CSS/native geometry and photo semantics. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pw=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const origin=process.env.REVIEW_ORIGIN||'http://127.0.0.1:8943',out=path.join(__dirname,process.env.REVIEW_PUBLIC?'public':'local');fs.mkdirSync(out,{recursive:true});
const configs=[['desktop',1440,900,'en'],['desktop2k',2560,1440,'ro'],['mobile390',390,844,'en'],['mobile320',320,568,'ru'],['landscape',844,390,'ru'],['landscape667',667,375,'en']];
(async()=>{const browser=await pw[process.env.REVIEW_ENGINE||'webkit'].launch({headless:true});const results=[];
try{for(const [name,width,height,lang] of configs){if(process.env.REVIEW_SIZE&&process.env.REVIEW_SIZE!==name)continue;
 const mobile=width<1000,ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile});
 await ctx.addInitScript(locale=>localStorage.setItem('portfolio.locale',locale),lang);const p=await ctx.newPage(),errors=[],states=[];p.on('pageerror',e=>errors.push(e.message));
 const settle=mode=>p.waitForFunction(mode=>portfolioEntry?.mode===mode&&!portfolioEntry.pending&&(!['work','detail'].includes(mode)||!portfolioRuntime?.moving),mode,{timeout:35000});
 const snap=async label=>{await p.waitForTimeout(650);await p.screenshot({path:path.join(out,`${name}-${label}.png`),scale:'css'});const s=await p.evaluate(()=>({mode:portfolioEntry.mode,front:portfolioWorkGeometry?.()?.front,safe:window.portfolioSafeArea,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,heading:document.querySelector('#selected-project-heading')?.textContent,photos:[...document.querySelectorAll('.about-photo-grid img')].map(i=>i.alt)}));s.label=label;states.push(s);assert(s.scrollWidth<=s.viewport,'horizontal overflow');return s};
 try{await p.goto(origin,{waitUntil:'commit',timeout:60000});await p.waitForFunction(()=>window.portfolioEntry?.ready,null,{timeout:45000});await settle('home');await snap('home');
  await p.locator('#process-control').click();await settle('process');await snap('process');
  await p.locator('#about-control').click();await settle('about');await snap('about');
  await p.locator('#nav-contact').click();await settle('about');await snap('contact');
  await p.locator('#work-toggle').click();await settle('work');await snap('work');
  for(const key of ['andra','btb','fkd','ora','bonanza']){await p.evaluate(key=>portfolioEntry.open(key),key);await settle('detail');const s=await snap(key);assert(s.front?.drawn,key+' front drawn');assert(s.front.top>=48&&s.front.bottom<=height-44,key+' front inside reserved screen');if(width>height&&height<=520)assert(s.front.height>=(width<700?120:150),key+' readable short-landscape image (including wrapped caption)');
   if(key==='andra'){await p.locator('[data-material="2"]').click();await p.waitForFunction(()=>portfolioRuntime.materialIndex===2&&!portfolioRuntime.moving);await snap('andra-mobile');}
   await p.locator('#work-toggle').click();await settle('work');
  }
  assert.equal(errors.length,0,errors.join('\n'));
 }catch(e){await p.screenshot({path:path.join(out,`${name}-failure.png`),scale:'css'}).catch(()=>{});results.push({name,errors,error:e.stack,states});throw e}
 results.push({name,errors,states});fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(results.at(-1),null,2));console.log(name+': '+states.length+' states pass');await ctx.close();
}}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
