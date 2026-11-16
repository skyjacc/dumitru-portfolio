'use strict';
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const qa = path.resolve(__dirname, '../qa/about-simple');
fs.mkdirSync(qa, { recursive: true });
const sameCamera = (a,b) => ['x','y','zoom'].every(key => Math.abs(a[key]-b[key]) < 1e-6);
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const report = { errors: [], views: [], otherCases: [], aboutRequests: [] };
 for (const viewport of [{width:390,height:844},{width:320,height:568},{width:1440,height:900}]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => {const url=new URL(request.url());if(url.pathname.startsWith('/assets/about/'))report.aboutRequests.push(url.pathname)});
  const nav = detail => page.evaluate(detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail })), detail);
  const settled = () => page.waitForFunction(() => window.portfolioRuntime?.ready && !window.portfolioRuntime.moving, null, {timeout:25000});
  const state = () => page.evaluate(() => window.portfolioRuntime);
  const controls = () => page.locator('#project-controls button, #visit-control').evaluateAll(nodes => nodes.map(node => ({id:node.id||node.dataset.material,rect:node.getBoundingClientRect().toJSON()})));
  await page.goto('http://127.0.0.1:8943/');
  await settled(); await page.waitForTimeout(3000);
  const before = await state();
  await nav({key:'despre'}); await settled(); await page.waitForTimeout(750);
  const opened = await state(), initialControls = await controls();
  for (let index=0;index<opened.materialCount;index++) {
   await nav({action:'material',index}); await page.waitForTimeout(850);
   const current = await state(), rects = await controls();
   const geometry = current.materialGeometry, front = geometry.boxes.find(box => box.front).box;
   const scale = current.camera.zoom * current.fitScale;
   const peers = geometry.boxes.filter(box => !box.front).map(item => ({index:item.i,gap:Math.abs(item.box.x-front.x)-(item.box.w+front.w)/2}));
   const controlsStable = JSON.stringify(rects.map(item=>[item.id,item.rect.x,item.rect.y,item.rect.width,item.rect.height])) === JSON.stringify(initialControls.map(item=>[item.id,item.rect.x,item.rect.y,item.rect.width,item.rect.height]));
   const screenshot = `${viewport.width}-${viewport.height}-despre-${index}.png`;
   await page.screenshot({path:path.join(qa,screenshot)});
   report.views.push({viewport,index,screenWidth:front.w*scale,screenHeight:front.h*scale,peers,controlsStable,cameraStable:sameCamera(opened.camera,current.camera),selected:current.materialIndex,mode:current.materialMode,screenshot});
  }
  await nav({action:'return'}); await settled();
  const returned = await state();
  report.views.filter(view=>view.viewport.width===viewport.width).forEach(view=>view.exactReturn=sameCamera(opened.returnCamera,returned.camera));
  if (viewport.width===390) {
   for (const [key,index] of [['andra',2],['btb',3],['fkd',3],['ora',3],['bonanza',3]]) {
    const prior = await state();
    await nav({key}); await settled(); await nav({action:'material',index}); await page.waitForTimeout(750);
    const current = await state(), g=current.materialGeometry, front=g.boxes.find(box=>box.front).box, aspect=390/844;
    const expectedWidth=Math.min(g.room.h*aspect,1.6*g.room.halfW);
    await nav({action:'return'});await settled();
    const after=await state();
    report.otherCases.push({key,selected:current.materialIndex,unchangedPortraitFormula:Math.abs(expectedWidth-front.w)<1e-6,exactReturn:sameCamera(current.returnCamera,after.camera)});
   }
  }
  await page.close();
 }
 fs.writeFileSync(path.join(qa,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({errors:[...new Set(report.errors)],views:report.views,otherCases:report.otherCases},null,2));
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
