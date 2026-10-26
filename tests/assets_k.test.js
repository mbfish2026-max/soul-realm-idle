'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/ui2/manifest.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'tools/k/catalog.json'), 'utf8'));
function dimensions(b) {
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 12), 'WEBP');
  for (let p = 12; p + 8 <= b.length;) {
    const kind = b.toString('ascii', p, p + 4), len = b.readUInt32LE(p + 4), d = p + 8;
    if (kind === 'VP8X') return [1 + b.readUIntLE(d + 4, 3), 1 + b.readUIntLE(d + 7, 3)];
    if (kind === 'VP8 ') return [b.readUInt16LE(d + 6) & 16383, b.readUInt16LE(d + 8) & 16383];
    if (kind === 'VP8L') { const n = b.readUInt32LE(d + 1); return [(n & 16383) + 1, ((n >>> 14) & 16383) + 1]; }
    p = d + len + (len % 2);
  }
  throw Error('Missing dimensions');
}
const qa = JSON.parse(fs.readFileSync(path.join(root, 'tools/k/qa.json'), 'utf8'));
assert.equal(qa.length, 74);
assert.equal(Object.keys(manifest).length, 74);
assert.deepEqual(Object.keys(manifest).sort(), catalog.map(a => a.key).sort());
for (const a of catalog) {
  const m = manifest[a.key];
  assert(/^ui2_[a-z][a-z0-9_]*$/.test(a.key));
  assert.equal(m.file, 'assets/ui2/' + a.key + '.webp');
  assert.equal(m.source, 'image_gen');
  const b = fs.readFileSync(path.join(root, m.file));
  assert(b.length <= 300000, a.key + ' over budget');
  const verified = qa.find(x => x.key === a.key);
  assert(verified, a.key + ' missing decode QA');
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'), verified.sha256);
  assert.equal(verified.alpha[0], 0);
  assert(verified.alpha[1] > 0);
  if (a.key === 'ui2_skill_cooldown') assert(verified.alpha[1] <= 141);
  assert.deepEqual(dimensions(b), [a.w, a.h], a.key);
  assert.deepEqual([m.w, m.h], [a.w, a.h]);
  if (a.slice) {
    assert.deepEqual(m.slice, a.slice);
    assert(m.slice[0] + m.slice[2] < m.h);
    assert(m.slice[1] + m.slice[3] < m.w);
  }
}
const script = fs.readFileSync(path.join(root, 'assets/ui2/manifest.js'), 'utf8');
for (const browser of [true, false]) {
  const initial = {existing: {file: 'preserve.webp'}};
  const context = browser ? {window: {SR: {ASSETS: initial}}} : {SR: {ASSETS: initial}};
  vm.createContext(context); vm.runInContext(script, context);
  const assets = browser ? context.window.SR.ASSETS : context.SR.ASSETS;
  assert.strictEqual(assets, initial);
  assert.equal(assets.existing.file, 'preserve.webp');
  const added = Object.fromEntries(Object.entries(assets).filter(([k]) => k !== 'existing'));
  assert.equal(JSON.stringify(added), JSON.stringify(manifest));
  vm.runInContext(script, context);
  assert.equal(Object.keys(assets).length, 75);
}
const empty = {}; vm.createContext(empty); vm.runInContext(script, empty);
assert.equal(JSON.stringify(empty.SR.ASSETS), JSON.stringify(manifest));
console.log('assets_k: 74 image assets, dimensions, budgets, slices and additive registration passed');
