'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root = path.resolve(__dirname, '../../..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'site/portfolio-data.json'), 'utf8'));
const keys = ['andra', 'btb', 'fkd', 'ora', 'bonanza'];
const only = process.argv.slice(2);
const projects = data.projects.filter(p => keys.includes(p.key) && (!only.length || only.includes(p.key)));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = [];
  try {
    for (const project of projects) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'en-US' });
      const page = await context.newPage();
      const errors = [], failedRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      const response = await page.goto(project.externalUrl, { waitUntil: 'load', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].filter(img => {
        const r = img.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && getComputedStyle(img).display !== 'none';
      }).every(img => img.complete), null, { timeout: 15000 });
      // Let the source site's own loader and initial transitions complete naturally.
      await page.waitForTimeout(6000);
      await page.addStyleTag({ content: 'html, body, * { scrollbar-width: none !important; } *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }' });
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('video').forEach(video => video.pause());
        document.getAnimations().forEach(animation => { if (animation.playState === 'running') animation.pause(); });
      });
      await page.waitForTimeout(400);
      const metadata = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        innerWidth, innerHeight, devicePixelRatio, scrollX, scrollY,
        fonts: document.fonts.status,
        bodyClass: document.body.className,
        headings: [...document.querySelectorAll('h1')].map(el => el.innerText),
        visibleImages: [...document.images].map(img => ({ src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, complete: img.complete, bounds: img.getBoundingClientRect().toJSON() })).filter(img => img.bounds.bottom > 0 && img.bounds.top < innerHeight),
        canvases: [...document.querySelectorAll('canvas')].map(canvas => ({ width: canvas.width, height: canvas.height, bounds: canvas.getBoundingClientRect().toJSON() })),
        videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc, paused: v.paused, time: v.currentTime, readyState: v.readyState })),
        loaders: [...document.querySelectorAll('[class*="loader"], [id*="loader"], [class*="preload"]')].map(el => ({ id: el.id, class: el.className, hidden: el.hidden, display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity, rect: el.getBoundingClientRect().toJSON() }))
      }));
      const file = `${project.key}-after-3x.png`;
      await page.screenshot({ path: path.join(__dirname, file), fullPage: false, scale: 'device' });
      // CSS-size reference to compare composition independently of pixel density.
      await page.screenshot({ path: path.join(__dirname, `${project.key}-after-1x.png`), fullPage: false, scale: 'css' });
      report.push({ key: project.key, capturedAt: new Date().toISOString(), sourceUrl: project.externalUrl, status: response.status(), file, viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, reducedMotion: 'reduce', metadata, errors, failedRequests });
      fs.writeFileSync(path.join(__dirname, `${project.key}-capture.json`), JSON.stringify(report.at(-1), null, 2));
      console.log(JSON.stringify({ key: project.key, status: response.status(), heading: metadata.headings, errors, file }));
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(__dirname, 'capture-report.json'), JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
