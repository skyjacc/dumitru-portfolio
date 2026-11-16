const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');const path=require('path');
const phase=process.argv[2]||'before';
const reference=phase==='reference',touch=phase.includes('touch'),reduced=phase.includes('reduced');
const dirs=['E','SE','S','SW','W','NW','N','NE'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const results={phase,errors:[],states:[]};
 try{
  const page=await browser.newPage({viewport:touch?{width:320,height:740}:{width:1440,height:900},deviceScaleFactor:4,isMobile:touch,hasTouch:touch,reducedMotion:reduced?'reduce':'no-preference'});
  page.on('pageerror',e=>results.errors.push(e.message));
  await page.goto(reference?'https://webdesign.kernjosh.com/':'http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});
  if(reference)await page.waitForFunction(()=>document.body.classList.contains('is-loaded'));
  else await page.waitForFunction(()=>window.portfolioNav&&!document.getElementById('studio-loader'));
  const selector=reference?'.nav-pill__icon--eyes':'.studio-eyes';
  const icon=page.locator(selector),box=await icon.boundingBox();const cx=box.x+box.width/2,cy=box.y+box.height/2;
  const shots=[];
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4;await page.mouse.move(cx+32*Math.cos(angle),cy+32*Math.sin(angle));await page.waitForTimeout(230);
   const state=await page.evaluate(selector=>[...document.querySelector(selector).querySelectorAll('span,img')].map(el=>({cls:el.className,rect:el.getBoundingClientRect().toJSON(),width:getComputedStyle(el).width,height:getComputedStyle(el).height,transform:getComputedStyle(el).transform,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight})),selector);
   results.states.push({direction:dirs[i],state,nav:reference?null:await page.evaluate(()=>portfolioNav.getState())});
   const file=path.join(__dirname,`${phase}-${dirs[i]}.png`);await page.screenshot({path:file,clip:{x:box.x-9,y:box.y-9,width:box.width+18,height:box.height+18}});shots.push({title:dirs[i],file});
  }
  const sheet=await browser.newPage({viewport:{width:800,height:520}});
  await sheet.setContent(`<body style="margin:0;background:#111;color:#eee;font:16px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px">${shots.map(s=>`<figure style="margin:0;text-align:center"><figcaption>${s.title}</figcaption><img style="width:176px;height:184px;object-fit:contain" src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}"></figure>`).join('')}</body>`);await sheet.screenshot({path:path.join(__dirname,`${phase}-eight-directions.png`)});
  await sheet.close();
  if(!reference){
   await page.mouse.move(cx,cy);await page.waitForTimeout(200);results.center=await page.evaluate(()=>portfolioNav.getState());
   await page.mouse.move(0,700);await page.waitForTimeout(200);results.far=await page.evaluate(()=>portfolioNav.getState());
   await page.mouse.move(-10,-10);await page.waitForTimeout(200);results.leave=await page.evaluate(()=>portfolioNav.getState());
   await page.mouse.move(0,700);await page.waitForTimeout(200);await page.evaluate(()=>dispatchEvent(new Event('blur')));await page.waitForTimeout(200);results.blur=await page.evaluate(()=>portfolioNav.getState());
  }
  await page.close();
 }finally{await browser.close();fs.writeFileSync(path.join(__dirname,`${phase}-metrics.json`),JSON.stringify(results,null,2));}
 console.log(JSON.stringify(results.states[0],null,2));
})().catch(e=>{console.error(e);process.exit(1)});
