/* Validate repository landmarks, not the user's checkout directory name. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const relative of ['authoring/projects.json', 'site/entry-flow.js', 'site/_next/static/chunks/1l2px902fb04m.js']) {
  if (!fs.statSync(path.join(root, relative), {throwIfNoEntry: false})?.isFile()) {
    throw new Error(`Portfolio repository landmark missing: ${relative}`);
  }
}
module.exports = root;
