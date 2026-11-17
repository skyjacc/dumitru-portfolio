/* Reproduce the independently reported defects without modifying the working rig. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const root = path.resolve(__dirname, '../../..');
const revision = process.argv[2] || '7488e15758b8ef0e152347e94d9497de70ac25d3';
(async () => {
  const source = revision === 'current' ? fs.readFileSync(path.join(root, 'site/studio-character-rig.js'), 'utf8') : cp.execFileSync('git', ['show', revision + ':site/studio-character-rig.js'], {cwd: root, encoding: 'utf8'});
  const browser = await chromium.launch({channel:'chrome', headless:true});
  const page = await browser.newPage();
  await page.setContent('<div id="body"></div><div id="props"></div>');
  await page.addScriptTag({content:source});
  const report = await page.evaluate(() => {
    const rig = StudioCharacterRig.create(document.getElementById('body'), {fixtureHost:document.getElementById('props')});
    const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
    const cases = [
      ['work',1,'elapsed',2400], ['work',2,'elapsed',2400], ['game',0,'elapsed',3900],
      ['peek',0,'progress',.5], ['peek',0,'progress',.8], ['controller',0,'progress',.72], ['controller',0,'progress',.83]
    ];
    const thresholds = cases.map(([action,variant,key,boundary]) => {
      const epsilon = key === 'elapsed' ? .001 : .000001;
      const input = {action,variant,phase:'perform',progress:.5,elapsed:3000,repeats:4,facing:1};
      const a = rig.render({...input,[key]:boundary-epsilon}), b = rig.render({...input,[key]:boundary+epsilon});
      const delta = Object.fromEntries(Object.keys(a.joints).map(k=>[k,distance(a.joints[k],b.joints[k])]));
      return {action,variant,key,boundary,max:Math.max(...Object.values(delta)),delta};
    });
    const feet = [.65,.75,.85,.95,1].map(progress => { const state=rig.render({action:'pushups',phase:'prepare',progress,elapsed:progress*3000});return{progress,left:state.joints.leftFoot,right:state.joints.rightFoot,contacts:state.contacts.map(c=>c.kind)}; });
    rig.destroy();return{thresholds,feet};
  });
  await browser.close();
  fs.writeFileSync(path.join(__dirname, revision === 'current' ? 'current-thresholds.json':'baseline.json'), JSON.stringify({revision,...report},null,2));
  console.log(JSON.stringify({revision,thresholds:report.thresholds.map(({delta,...rest})=>rest),feet:report.feet}));
})().catch(error=>{console.error(error);process.exitCode=1});
