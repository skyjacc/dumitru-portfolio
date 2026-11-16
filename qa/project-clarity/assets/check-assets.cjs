'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root = path.resolve(__dirname, '../../..');
const keys = ['andra', 'btb', 'fkd', 'ora', 'bonanza'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
(async () => {
  const adapter = fs.readFileSync(path.join(root, 'scripts/adapt-data.cjs'), 'utf8');
  const fn = adapter.slice(adapter.indexOf('const materialImage ='), adapter.indexOf('\nconst caseProjects ='));
  assert(fn.startsWith('const materialImage =') && fn.length < 2500);
  const fixture = path.join(__dirname, 'adapter-fixture');
  const folder = path.join(fixture, 'assets/projects/test');
  fs.mkdirSync(folder, { recursive: true });
  const image = fs.readFileSync(path.join(__dirname, 'fkd-before.webp'));
  fs.writeFileSync(path.join(folder, 'mobile.webp'), image);
  const target = path.join(folder, 'mobile-preview.svg');
  const run = aboutOnly => vm.runInNewContext(`${fn}\nmaterialImage({ id: 'test' }, { id: 'mobile', src: 'assets/projects/test/mobile.webp', alt: 'Test mobile' });`, { fs, path, site: fixture, aboutOnly, xml: String });
  const retina = fs.readFileSync(path.join(root, 'site/assets/projects/fkd/mobile-preview.svg'));
  fs.writeFileSync(target, retina);
  run(false);
  assert.equal(hash(fs.readFileSync(target)), hash(retina), 'Retina preview replaced by adapter');
  fs.writeFileSync(target, '<svg>legacy</svg>');
  run(false);
  assert(fs.readFileSync(target, 'utf8').includes('width="390" height="844"'), 'Legacy fallback missing');
  const legacyHash = hash(fs.readFileSync(target));
  run(true);
  assert.equal(hash(fs.readFileSync(target)), legacyHash, 'About-only modified preview');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = [];
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8943/');
    for (const key of keys) {
      const info = await page.evaluate(async key => {
        const image = new Image();
        image.src = `/assets/projects/${key}/mobile-preview.svg?retina-clarity=1`;
        await image.decode();
        return { key, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete };
      }, key);
      assert.equal(info.naturalWidth, 1170);
      assert.equal(info.naturalHeight, 2532);
      report.push(info);
    }
  } finally { await browser.close(); }
  const result = { browserDecode: report, guard: { retinaPreserved: true, legacyFallback: true, aboutOnlyPreserved: true } };
  fs.writeFileSync(path.join(__dirname, 'check-assets.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
