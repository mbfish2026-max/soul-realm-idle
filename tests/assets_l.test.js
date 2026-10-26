'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/frames/manifest.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(root, 'tools/l/sources.json'), 'utf8'));
const sentinel = {file:'preserved.webp'}, context = {SR:{ASSETS:{sentinel}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/frames/manifest.js'),'utf8'),context);
assert.strictEqual(context.SR.ASSETS.sentinel, sentinel, 'preserves existing manifest');
for (const [key, a] of Object.entries(manifest)) {
  assert(/^(hero|pet_fox|mob_ink_wolf|mob_bamboo_snake|mob_stone_turtle|boss_cinder_stag)_(idle|move|attack|skill|hit|fusion|win|die|phase)(_1x)?$/.test(key),key);
  assert.strictEqual(JSON.stringify(context.SR.ASSETS[key]),JSON.stringify(a));
  assert(a.file.startsWith('assets/frames/') && !a.file.includes('..'));
  const b = fs.readFileSync(path.join(root,a.file));
  assert(b.length <= 1000000, key+' size');
  assert.strictEqual(b.toString('ascii',0,4),'RIFF');
  assert.strictEqual(b.toString('ascii',8,12),'WEBP');
  assert.strictEqual(b.toString('ascii',12,16),'VP8X');
  assert(b[20] & 16, key+' alpha');
  assert.deepStrictEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],[a.w,a.h],key+' dimensions');
  assert.strictEqual(a.w,a.frames*a.fw); assert.strictEqual(a.h,a.fh);
  assert.deepStrictEqual(a.anchor,{x:.5,y:.96});
  assert(a.fps>0 && a.fps<=12); assert.strictEqual(a.loop,key.replace(/_1x$/,'').endsWith('_idle'));
}
for(const s of sources) {
  const a=manifest[s.key], low=manifest[s.key+'_1x'];
  assert(a && low,s.key); assert.strictEqual(a.frames,s.frames);
  assert.deepStrictEqual([a.fw,a.fh],[s.fw,s.fh]);
  assert.deepStrictEqual([low.fw,low.fh],[s.fw/2,s.fh/2]);
}
assert.strictEqual(Object.keys(manifest).length,sources.length*2);
console.log('assets_l: '+sources.length+' actions / '+Object.keys(manifest).length+' sheets passed');
