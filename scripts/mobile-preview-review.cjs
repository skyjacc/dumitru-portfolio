'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const qa = path.resolve(__dirname, '../qa/mobile-preview-review');
fs.mkdirSync(qa, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../site/portfolio-data.json'), 'utf8'));
(async () => {
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const reports = [];
 for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const nav = detail => page.evaluate(detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail })), detail);
  const settled = () => page.waitForFunction(() => window.portfolioRuntime?.ready && !window.portfolioRuntime.moving, null, { timeout: 25000 });
  const state = () => page.evaluate(() => window.portfolioRuntime);
  await page.goto('http://127.0.0.1:8943/');
  await settled();
  await page.waitForTimeout(3000);
  for (const project of manifest.projects.filter(project => project.portfolioCase)) {
   const before = await state();
   const index = project.images.findIndex(url => url.endsWith('mobile-preview.svg'));
   const dimensions = await page.evaluate(async url => {
    const image = new Image(); image.src = url; await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight, complete: image.complete };
   }, project.images[index]);
   await nav({ key: project.key });
   await settled();
   await nav({ action: 'material', index });
   await page.waitForTimeout(1200);
   const selected = await state();
   const screenshot = `${viewport.width}-${project.key}-mobile.png`;
   await page.screenshot({ path: path.join(qa, screenshot) });
   await nav({ action: 'return' });
   await settled();
   const after = await state();
   const report = { viewport, key: project.key, selectedIndex: selected.materialIndex, expectedIndex: index, mode: selected.materialMode, dimensions, before: before.camera, after: after.camera, exactReturn: ['x', 'y', 'zoom'].every(key => Math.abs(before.camera[key] - after.camera[key]) < 1e-6), screenshot, errors: [...errors] };
   reports.push(report);
   console.log(JSON.stringify(report));
  }
  await page.close();
 }
 fs.writeFileSync(path.join(qa, 'report.json'), JSON.stringify(reports, null, 2));
 await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
