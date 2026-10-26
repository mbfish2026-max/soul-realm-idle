'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const specs = JSON.parse(fs.readFileSync(path.join(root, 'tools/m/specs.json')));
function dimensions(b) {
  assert.strictEqual(b.toString('ascii', 0, 4), 'RIFF');
  assert.strictEqual(b.toString('ascii', 8, 12), 'WEBP');
  for (let p = 12; p + 8 <= b.length;) {
    const type = b.toString('ascii', p, p + 4), size = b.readUInt32LE(p + 4), d = p + 8;
    if (type === 'VP8X') return [1 + b.readUIntLE(d + 4, 3), 1 + b.readUIntLE(d + 7, 3)];
    if (type === 'VP8 ') return [b.readUInt16LE(d + 6) & 16383, b.readUInt16LE(d + 8) & 16383];
    if (type === 'VP8L') { const v = b.readUInt32LE(d + 1); return [(v & 16383) + 1, ((v >>> 14) & 16383) + 1]; }
    p = d + size + size % 2;
  }
  throw Error('Missing dimensions');
}
const ctx = { SR: { ASSETS: { retained: { file: 'sentinel' } } } };
vm.createContext(ctx);
for (const group of ['scene', 'fx']) {
  const base = path.join(root, 'assets', group);
  const manifest = JSON.parse(fs.readFileSync(path.join(base, 'manifest.json')));
  const expected = specs.filter(s => s.group === group);
  assert.deepStrictEqual(Object.keys(manifest).sort(), expected.map(s => s.key).sort());
  const js = fs.readFileSync(path.join(base, 'manifest.js'), 'utf8');
  vm.runInContext(js, ctx); vm.runInContext(js, ctx);
  assert.strictEqual(ctx.SR.ASSETS.retained.file, 'sentinel');
  for (const s of expected) {
    const a = manifest[s.key];
    assert(/^(bg|fx)_[a-z][a-z0-9_]*$/.test(s.key));
    assert.strictEqual(a.file, 'assets/' + group + '/' + s.key + '.webp');
    const b = fs.readFileSync(path.join(root, a.file));
    assert.deepStrictEqual(dimensions(b), [s.w, s.h], s.key);
    assert(b.length <= (s.frames > 1 ? 1000000 : 300000), s.key + ' size');
    assert.strictEqual(JSON.stringify(ctx.SR.ASSETS[s.key]), JSON.stringify(a));
    if (s.frames) {
      assert.strictEqual(a.w, a.fw * a.frames);
      assert.strictEqual(a.h, a.fh); assert.strictEqual(a.loop, false);
      assert(a.fps > 0 && Number.isInteger(a.frames));
    }
  }
}
assert.strictEqual(Object.keys(ctx.SR.ASSETS).length, specs.length + 1);
console.log('assets_m: ' + specs.length + ' assets, dimensions, budgets and merge passed');
