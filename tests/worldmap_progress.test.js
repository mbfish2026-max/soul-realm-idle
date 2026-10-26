'use strict';
var assert=require('assert');require('../names.js');require('../data/maps.js');require('../data/ext/maps.js');SR.contentParts.maps(SR.DATA);SR.buildWorldMap();require('../core/progress.js');
function fresh(){return {map:{mapId:'forest',floor:1,bestFloor:1},flags:{},cur:{},auto:{advance:true,challengeBoss:true}};}
assert.equal(SR.DATA.worldRegions.length,6);assert.equal(SR.DATA.worldRegions.flatMap(r=>r.nodes).length,48);
var s=fresh();assert.equal(SR.progress.migrate(s).cleared,0);assert(!SR.progress.select('node-2',s));assert(SR.progress.select('node-0',s));
for(var i=0;i<48;i++){var n=SR.progress.frontier(s);assert.equal(n.index,i);assert(SR.progress.select(n.id,s));for(var w=0;w<n.waves;w++)SR.progress.clearWave(s,s.auto);assert.equal(s.world.cleared,i+1);}
assert.equal(s.cur.crystal,6300);assert.equal(s.cur.petSoul,630);var money=s.cur.crystal;for(i=0;i<10;i++)SR.progress.clearWave(s);assert.equal(s.cur.crystal,money);
assert(SR.progress.select('node-0',s));for(i=0;i<5;i++)SR.progress.clearWave(s,{advance:false});assert.equal(s.world.selected,'node-0');assert.equal(s.world.cleared,48);
s=fresh();s.map={mapId:'snow',floor:3,bestFloor:4};var p=SR.progress.migrate(s);assert.equal(p.cleared,25);assert.equal(p.selected,'node-22');assert.deepEqual(SR.progress.migrate(JSON.parse(JSON.stringify(s))),p);
s=fresh();s.world={v:1,cleared:7,selected:'node-7',wave:9,rewards:{}};SR.progress.clearWave(s,{challengeBoss:false});assert.equal(s.world.wave,1);assert.equal(s.world.cleared,7);
s.world.wave=10;assert(SR.progress.clearWave(s,{challengeBoss:false}).blocked);assert.equal(s.world.cleared,7);
s.world.selected='bad';s.world.cleared=999;assert.equal(SR.progress.migrate(s).selected,'node-47');assert.equal(s.world.cleared,48);
var previous=0;SR.DATA.worldRegions.forEach(r=>{assert(r.nodes[0].yearsRange[0]>=previous);previous=r.nodes[0].yearsRange[0];r.nodes.forEach(n=>assert(SR.progress.node(n.id)));});
console.log('world map: 48 nodes, sequential unlock, replay, rewards, migration, boss policy passed');
