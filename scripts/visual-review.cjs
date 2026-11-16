'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const qa = path.resolve(__dirname, '../qa/visual-review');
fs.mkdirSync(qa, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../site/portfolio-data.json'), 'utf8'));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const reports = [];
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 2560, height: 1440 }]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const nav = detail => page.evaluate(detail => window.dispatchEvent(new CustomEvent('portfolio:navigate', { detail })), detail);
    const settled = () => page.waitForFunction(() => window.portfolioRuntime?.ready && !window.portfolioRuntime.moving, null, { timeout: 25000 });
    const state = () => page.evaluate(() => window.portfolioRuntime);
    await page.goto('http://127.0.0.1:8943/');
    await settled();
    await page.waitForTimeout(1000);
    for (const project of manifest.projects) {
      const before = await state();
      await nav({ key: project.key });
      await settled();
      await page.waitForTimeout(900);
      const report = { viewport, key: project.key, materials: [], errors };
      for (let index = 0; index < project.images.length; index++) {
        await nav({ action: 'material', index });
        await page.waitForTimeout(750);
        const current = await state();
        const overflow = await page.locator('button, a').evaluateAll(nodes => nodes.filter(node => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0 &&
            (rect.x < -1 || rect.right > innerWidth + 1 || rect.y < -1 || rect.bottom > innerHeight + 1) &&
            !node.closest('[data-screen-copy]');
        }).map(node => ({ text: node.textContent.trim().slice(0, 70), rect: node.getBoundingClientRect().toJSON() })));
        const screenshot = index === 0 || index === 3 || project.key === 'despre' ? `${viewport.width}-${project.key}-${index}.png` : null;
        if (screenshot) await page.screenshot({ path: path.join(qa, screenshot) });
        report.materials.push({ index, selected: current.materialIndex, mode: current.materialMode, focusedKey: current.focusedKey, moving: current.moving, camera: current.camera, overflow, screenshot });
      }
      await nav({ action: 'return' });
      await settled();
      const after = await state();
      report.exactReturn = ['x', 'y', 'zoom'].every(key => Math.abs(before.camera[key] - after.camera[key]) < 1e-6);
      report.closed = after.focusedKey === null;
      reports.push(report);
      console.log(JSON.stringify({ width: viewport.width, key: project.key, materialModes: report.materials.map(material => material.mode), selections: report.materials.every(material => material.index === material.selected), overflow: report.materials.some(material => material.overflow.length), exactReturn: report.exactReturn, errors }));
    }
    await page.close();
  }
  fs.writeFileSync(path.join(qa, 'report.json'), JSON.stringify(reports, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
