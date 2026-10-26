// 80 hours of repeated offline claims must stay bounded and survive persistence.
const assert=require('assert');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require('../'+f));SR.content.install();
['data/skill-tree','data/ring-skills','data/effects','data/skill-progression','core/rng','core/save','core/bag','core/loot','core/auto','systems/rings','systems/pets','systems/stats','systems/skills','systems/ring-skills','core/battle','core/offline'].forEach(f=>require('../'+f));SR.loot.init();
const s=SR.save.state;s.flags.awakened=true;s.hero.soulId='blade';s.hero.classId='blade';s.hero.level=99;s.map.floor=5;
SR.stats.hero=()=>({atk:100000,def:100000,hp:100000});SR.rng.seed(123);
let persisted='';global.localStorage={setItem(k,v){assert(v.length<500000,'bounded save must fit conservative quota');persisted=v;},getItem(){return persisted;}};
let capacityEvents=0;SR.bus.on('bag:capacity',()=>capacityEvents++);
for(let i=0;i<7;i++){let now=s.t+12*3600000;SR.offline.claim(now);assert(SR.save.save());assert(s.store.length<=SR.bag.storeCap);}
assert(capacityEvents>0);const before=JSON.parse(SR.save.export());SR.save.load();for(const key of ['hero','bag','store','cur'])assert.deepEqual(SR.save.state[key],before[key]);
let kills=SR.save.state.stats.kills;SR.battle.start();SR.battle.tick(10000);assert.equal(SR.save.state.stats.kills,kills);assert.equal(SR.battle.snapshot().running,false);
let state=SR.save.state;state.store.splice(0,100);SR.battle.start();SR.battle.tick(10000);assert(state.stats.kills>kills,'resume after freeing space');SR.battle.stop();
console.log('core_capacity: 84h offline, bounded save/reload, capacity pause and resume passed');
