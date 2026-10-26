'use strict';
var assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
function load(){var c=vm.createContext({});['names.js','data/skills.js','data/souls.js','data/pets.js','data/realms.js','data/maps.js','data/ext/progression.js','data/ext/pets.js','data/ext/maps.js','data/ext/install.js'].forEach(function(p){vm.runInContext(fs.readFileSync(path.join(__dirname,'..',p),'utf8'),c,{filename:p});});return c.SR;}
var SR=load(),D=SR.DATA,original=D.souls[0];
assert.strictEqual(D.souls.length,3);SR.content.install();
assert.strictEqual(D.souls[0],original);
function unique(rows){assert.strictEqual(new Set(rows.map(function(x){return x.id;})).size,rows.length);}
function stats(s){['atk','def','hp','spd'].forEach(function(k){assert(Number.isFinite(s[k])&&s[k]>0,k);});}
function skill(id){assert(D.skills[id],id);}
function increasing(rows,get){rows.forEach(function(r,i){if(i)assert(get(r)>=get(rows[i-1]),'nonmonotonic '+i);});}
function label(n){assert(typeof n==='string'&&n.length>0);assert(!/模拟|测试|demo|敬请期待|待接入|placeholder/i.test(n));}
assert.strictEqual(D.souls.length,6);unique(D.souls);
D.souls.forEach(function(s){label(s.name);assert(SR.NAMES.veins[s.vein]);stats(s.baseStats);s.skills.forEach(skill);assert.strictEqual(s.branches.length,3);unique(s.branches);s.branches.forEach(function(b){label(b.name);assert.strictEqual(b.nodes.length,3);increasing(b.nodes,function(n){return n.level;});increasing(b.nodes,function(n){return n.cost;});b.nodes.forEach(function(n,i){assert(n.level>0&&n.cost>0);Object.keys(n.effects).forEach(function(k){assert(n.effects[k]>0&&n.effects[k]<1);if(i)assert(n.effects[k]>b.nodes[i-1].effects[k]);});});});});
assert.strictEqual(D.realms.length,10);unique(D.realms);
increasing(D.realms,function(r){return r.expToNext;});increasing(D.realms,function(r){return r.petSlots;});
D.realms.forEach(function(r,i){label(r.name);assert.strictEqual(r.minLevel,i*10+1);assert.strictEqual(r.maxLevel,(i+1)*10);assert.strictEqual(r.ringSlots,Math.min(9,i));assert(r.contractSlots>r.petSlots);if(i===9)return assert.strictEqual(r.trial,null);var t=r.trial;assert.strictEqual(t.level,r.maxLevel);assert.strictEqual(t.requiredRings,i+1);assert(t.requiredRings<=9);boss(t.boss);if(i)assert(t.boss.hp>D.realms[i-1].trial.boss.hp);});
assert.strictEqual(D.ringTiers.length,5);unique(D.ringTiers);
D.ringTiers.forEach(function(t,i){label(t.name);assert.strictEqual(t.color,['white','yellow','purple','black','red'][i]);assert(t.minYears<=t.maxYears);if(i)assert.strictEqual(t.minYears,D.ringTiers[i-1].maxYears+1);assert.strictEqual(t.skillCount,i===4?2:1);assert(t.skillIds.length>=t.skillCount);t.skillIds.forEach(skill);t.affixIds.forEach(function(id){var a=D.ringAffixes[id];assert(a&&a.min>0&&a.max>=a.min);label(a.name);});});
assert.strictEqual(D.pets.length,30);unique(D.pets);assert.strictEqual(D.petGrades.length,9);
assert.strictEqual(new Set(D.pets.map(function(p){return p.grade;})).size,9);
increasing(D.petGrades,function(g){return g.growth;});increasing(D.petGrades,function(g){return g.ringifyYears;});
var splits=0;
D.pets.forEach(function(p){label(p.name);assert(SR.NAMES.sources[p.source]);assert(SR.NAMES.speciesKinds[p.species]);assert(SR.NAMES.veins[p.vein]);assert(p.grade>=0&&p.grade<=8);assert.strictEqual(p.gradeName,SR.NAMES.petGrades[p.grade]);stats(p.baseStats);assert.strictEqual(p.activeSkills.length,2);assert.strictEqual(p.passiveSkills.length,2);p.skills.forEach(skill);p.passiveSkills.forEach(function(id){assert(D.ringAffixes[id]);});if(p.evolve.length>=2)splits++;p.evolve.forEach(function(e){var t=D.pets.find(function(x){return x.id===e.to;});assert(t,e.to);assert(t.grade>p.grade);assert.strictEqual(e.need.seg,10);assert(['kills','battles'].includes(e.need.counter.key));assert(e.need.counter.count>0);assert.strictEqual(e.need.mat.key,'petSoul');assert(e.need.mat.count>0);['atk','def','hp'].forEach(function(k){assert(t.baseStats[k]>=p.baseStats[k]);});});});assert(splits>=6);
// Strict grade increase on every edge also proves the evolution graph has no cycles.
assert.strictEqual(D.resonances.length,12);unique(D.resonances);
D.resonances.forEach(function(r){label(r.name);skill(r.skillId);assert(r.bond===100&&r.cd>0&&r.mult>0);assert.strictEqual(r.veins.length,2);r.veins.forEach(function(v){assert(SR.NAMES.veins[v]);});if(r.type==='heroPet'){var s=D.souls.find(function(s){return s.id===r.soulId;});assert(s&&s.vein===r.veins[0]);assert(D.pets.some(function(p){return p.vein===r.veins[1];}));}else{assert.strictEqual(r.type,'petPet');assert.strictEqual(r.petIds.length,2);r.petIds.forEach(function(id,i){assert(D.pets.some(function(p){return p.id===id&&p.vein===r.veins[i];}));});}});
function boss(b){label(b.name);assert(b.hp>0&&b.atk>0&&b.def>=0);assert(b.yearsRange[0]<=b.yearsRange[1]);b.skills.forEach(skill);assert.strictEqual(b.phases.length,3);b.phases.forEach(function(p,i){assert.strictEqual(p.phase,i+1);assert.strictEqual(p.hpRatio,[1,0.66,0.33][i]);skill(p.skillId);assert(p.delayMs>0);if(i)assert(p.mult>b.phases[i-1].mult);});}
assert.strictEqual(D.maps.length,3);unique(D.maps);
D.maps.slice(1).forEach(function(m,i){label(m.name);assert(D.maps.some(function(x){return x.id===m.unlock.mapId;}));assert.strictEqual(m.floors,5);assert.strictEqual(m.waves,10);assert.strictEqual(m.floorTables.length,5);assert(m.recPower>D.maps[i].floorTables[4].recPower);m.eggPool.forEach(function(id){assert(D.pets.some(function(p){return p.id===id;}));});increasing(m.floorTables,function(t){return t.recPower;});m.floorTables.forEach(function(t,j){assert.strictEqual(t.floor,j+1);boss(t.boss);t.monsters.forEach(function(e,k){label(e.name);assert(e.weight>0&&e.hp>0&&e.atk>0);assert(e.yearsRange[0]<=e.yearsRange[1]);assert(SR.NAMES.veins[e.vein]);if(j){var prev=m.floorTables[j-1].monsters[k];assert(e.hp>prev.hp&&e.atk>=prev.atk&&e.yearsRange[0]>prev.yearsRange[0]);}assert(t.boss.hp>e.hp);});});});
var snapshot=JSON.stringify(D);SR.content.install();assert.strictEqual(JSON.stringify(D),snapshot);
// Ordinary scripts may be evaluated again without duplicating installed rows.
['progression','pets','maps','install'].forEach(function(p){vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/ext/'+p+'.js'),'utf8'),{SR:SR});});SR.content.install();assert.strictEqual(JSON.stringify(D),snapshot);
Object.keys(D.skills).forEach(function(id){var s=D.skills[id];label(s.name);assert(s.cd>0&&s.mult>0&&SR.NAMES.veins[s.vein]);});
console.log('ext_content: all content, references, progression and installation checks passed');
