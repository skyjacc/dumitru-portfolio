/* Read-only numerical probes used by completeness findings C5-C7.
 * SVG DOM methods are stubbed; poseFor/solve/render math is the actual runtime.
 * Run from any cwd: node qa/full-audit-2026-11-17/completeness/character-continuity.cjs
 * No browser, scheduler execution, visual or full-site certification.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
class ElementStub {
  constructor() { this.style = {}; this.children = []; this.attributes = {}; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key]; }
  removeAttribute(key) { delete this.attributes[key]; }
  append(element) { this.children.push(element); element.parent = this; }
  replaceChildren(...elements) { this.children = elements; }
  get firstChild() { return this.children[0]; }
  get lastChild() { return this.children.at(-1); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(e => e !== this); }
}
const context = {window: {}, document: {createElementNS: () => new ElementStub()}, console};
vm.createContext(context);
for (const module of ['rig', 'life']) {
  vm.runInContext(fs.readFileSync(path.join(root, `site/studio-character-${module}.js`), 'utf8'), context);
}
const Rig = context.window.StudioCharacterRig;
const Life = context.window.StudioCharacterLife;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const newRig = () => Rig.create(new ElementStub(), {fixtureHost: new ElementStub()});
const excluded = ['work', 'game', 'coffee', 'pushups', 'peek', 'controller'];
const scan = [];

// Same dense probe previously executed inline: finite sequential phases,
// 1001 samples per phase, 3 variants, repeats=4, stable scene token.
for (const action of Object.keys(Life.activities)) {
  if (excluded.includes(action)) continue;
  for (let variant = 0; variant < 3; variant++) {
    const rig = newRig();
    let previous = rig.metrics(), maximum = 0, where = null, joint = null;
    for (const phase of ['prepare', 'perform', 'finish']) {
      for (let n = 0; n <= 1000; n++) {
        const current = rig.render({action, phase, progress: n / 1000,
          elapsed: n / 1000 * (phase === 'perform' ? 7000 : 900), variant, repeats: 4, token: 1});
        for (const key of Object.keys(current.joints)) {
          const delta = distance(current.joints[key], previous.joints[key]);
          if (delta > maximum) { maximum = delta; where = {phase, n, progress: n / 1000}; joint = key; }
        }
        previous = current;
      }
    }
    scan.push({action, variant, max: maximum, joint, where});
    rig.destroy();
  }
}

// Same ordinary-frame stretch reproduction already executed inline.
const stretchFrames = [];
for (const fps of [30, 60]) {
  const rig = newRig(), jumps = [];
  let previous = rig.metrics();
  for (let n = 0; n <= fps; n++) {
    const current = rig.render({action: 'stretch', phase: 'prepare', progress: n / fps,
      elapsed: 1000 * n / fps, variant: 0, token: 1});
    const delta = distance(previous.joints.rightHand, current.joints.rightHand);
    if (delta > 10) jumps.push({from: (n - 1) / fps, to: n / fps, delta,
      previous: previous.joints.rightHand, next: current.joints.rightHand});
    previous = current;
  }
  stretchFrames.push({fps, prepareDurationMs: 1000, jumps});
  rig.destroy();
}

// Same explicit sit/flower boundary probes already executed inline.
const phaseEdges = [];
for (const [action, variant] of [['sit', 1], ['carryFlower', 0]]) {
  const rig = newRig();
  let previous = rig.metrics();
  for (const phase of ['prepare', 'perform', 'finish', 'idle']) {
    const input = {action: phase === 'idle' ? 'idle' : action,
      phase: phase === 'idle' ? 'perform' : phase, progress: 0, elapsed: 0, variant, token: 1};
    let current = rig.render(input);
    const joint = Object.keys(current.joints).sort((a, b) =>
      distance(previous.joints[b], current.joints[b]) - distance(previous.joints[a], current.joints[a]))[0];
    phaseEdges.push({action, variant, phase, joint, delta: distance(previous.joints[joint], current.joints[joint]),
      previous: previous.joints[joint], next: current.joints[joint]});
    for (let n = 1; n <= 100; n++) current = rig.render({...input, progress: n / 100, elapsed: n * 70});
    previous = current;
  }
  rig.destroy();
}
const report = {
  generatedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(),
  scope: 'Actual rig.render in Node vm with SVG DOM stubs; no browser or full scheduler run.',
  scheduleActionCount: Object.keys(Life.activities).length,
  missingRigActions: Object.values(Life.activities).filter(a => !Rig.actions.includes(a.action)).map(a => a.action),
  scanConfig: {excluded, activities: scan.length / 3, variants: [0, 1, 2],
    samplesPerPhase: 1001, phases: ['prepare', 'perform', 'finish'], repeats: 4,
    performDurationMs: 7000, prepareFinishDurationMs: 900},
  scan: scan.sort((a, b) => b.max - a.max),
  stretchFrames,
  phaseEdges
};
const output = path.join(__dirname, 'character-continuity-results.json');
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({output, commit: report.commit, missingRigActions: report.missingRigActions,
  largest: report.scan.slice(0, 5), stretchFrames, phaseEdges}, null, 2));
