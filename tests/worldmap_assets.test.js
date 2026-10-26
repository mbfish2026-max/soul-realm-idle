'use strict';
var fs=require('fs'),assert=require('assert'),manifest=require('../assets/map/manifest.json');
assert.equal(Object.keys(manifest).length,15);
Object.values(manifest).forEach(function(a){var b=fs.readFileSync(a.file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert(b.length<=300000);assert.equal(b.length,a.bytes);});
console.log('world map assets: 15 generated slices, paths and image budgets passed');
