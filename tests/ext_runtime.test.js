'use strict';
var assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
var c=vm.createContext({console:console});
function script(p){vm.runInContext(fs.readFileSync(path.join(__dirname,'..',p),'utf8'),c,{filename:p});}
['names.js','core/bus.js','core/rng.js','data/skills.js','data/souls.js','data/pets.js','data/realms.js','data/maps.js','data/ext/progression.js','data/ext/pets.js','data/ext/maps.js','data/ext/install.js'].forEach(script);
var SR=c.SR;SR.content.install();
['core/save.js','core/bag.js','core/loot.js','core/battle.js','systems/rings.js','systems/pets.js','systems/stats.js','systems/awaken.js'].forEach(script);
var s=SR.save.state;s.flags.awakened=true;s.hero.level=60;s.hero.soulId='hammer';s.cur.petSoul=100000;
// Exercise every evolution through the real system and its existing counter contract.
SR.DATA.pets.forEach(function(d){d.evolve.forEach(function(e){var uid='egg-'+d.id+'-'+e.to;s.bag.push({uid:uid,type:'egg',speciesId:d.id});var p=SR.pets.hatch(uid);assert(p);p.seg=10;s.team.pets=[p.uid];var n=e.need.counter;assert(!SR.pets.preview(p.uid).find(function(x){return x.to===e.to;}).ready);SR.pets.count(n.key,n.count);assert(SR.pets.preview(p.uid).find(function(x){return x.to===e.to;}).ready);assert(SR.pets.evolve(p.uid,e.to));assert.strictEqual(p.speciesId,e.to);assert.strictEqual(p.seg,1);assert(SR.stats.pet(p).power>0);s.pets=[];s.team.pets=[];});});
// Actual battle spawning consumes all ten floor tables with valid numeric actors.
['snow','ridge'].forEach(function(id){for(var floor=1;floor<=5;floor++){[1,10].forEach(function(wave){s.map.mapId=id;s.map.floor=floor;s.map.wave=wave;SR.battle.start();var snap=SR.battle.snapshot();assert.strictEqual(snap.enemies.length,wave===10?1:3);snap.enemies.forEach(function(e){assert(Number.isFinite(e.hp)&&e.hp>0);assert(Number.isFinite(e.years)&&e.years>0);});SR.battle.tick(50);SR.battle.stop();});}});
SR.DATA.souls.forEach(function(d){s.hero.soulId=d.id;assert(SR.stats.hero(s).power>0);});
// Both skill references and original single-skill essence shape remain usable.
['white','yellow','purple','black','red'].forEach(function(color,i){var years=[10,100,1000,10000,100000][i],e=SR.loot.essence(years);assert.strictEqual(e.color,color);assert(SR.DATA.skills[e.skillId]);});
console.log('ext_runtime: existing evolution, stats, combat and loot compatibility passed');
