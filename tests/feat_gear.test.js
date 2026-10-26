'use strict';
const assert=require('assert');
['../names.js','../core/bus.js','../core/rng.js','../core/save.js','../core/bag.js','../features/gear/data.js','../features/gear/gear.js'].forEach(require);
const S=globalThis.SR,G=S.gear,D=S.GEAR_DATA;
function fresh(){S.save.state=S.save.create();S.save.state.hero.level=100;S.save.state.cur.crystal=1e9;return S.save.state;}
let s=fresh();assert.equal(D.slots.length,10);assert.equal(D.setSlots.length,8);
let slots=new Set();for(let i=0;i<5000;i++){let it=G.roll(100);slots.add(it.slot);assert(G.valid(it));assert.equal(it.affixes.length,it.quality+1);assert.equal(new Set(it.affixes.map(x=>x.key)).size,it.affixes.length);if(['weapon','jade'].includes(it.slot))assert.equal(it.setId,null);}assert.equal(slots.size,10);
assert.throws(()=>G.roll(100,()=>1));
let it=G.roll(100,()=>0.999);s.bag.push(it);assert(G.equip(it.uid));assert.equal(s.hero.bones[it.slot],it);assert(G.enhance(it.uid));let old=G.itemBonus(it);assert(old.atk>it.stats.atk);assert(G.lock(it.uid));assert(!G.unequip(it.slot));assert(!G.enhance(it.uid));G.lock(it.uid);assert(G.unequip(it.slot));
assert(G.lockAffix(it.uid,2));let kept={...it.affixes[2]};assert(G.reforge(it.uid,()=>0));assert.deepEqual(it.affixes[2],kept);assert.equal(new Set(it.affixes.map(a=>a.key)).size,5);assert(!G.lockAffix(it.uid,99));assert(G.move(it.uid,'store'));G.lock(it.uid);assert.equal(G.dismantle([it.uid]).count,0);G.lock(it.uid);assert.equal(G.dismantle([it.uid,it.uid]).count,1);
for(let l of [1,10,30,60,100])for(let id of Object.keys(D.sets)){
 s=fresh();s.hero.rings=Array(9).fill({});s.hero.soulId='blade';s.team.pets=['a','b','c'];
 D.slots.forEach(slot=>{s.hero.bones[slot]={uid:slot,type:'gear',slot,quality:4,level:l,enhance:10,stats:{atk:(l+2)*2.6,def:(1+l*.6)*2.6,hp:(15+l*6)*2.6},affixes:D.affixes.map(a=>({key:a.key,value:100000})),setId:id};});
 assert.equal(G.setCounts(s)[id],8);assert(G.power(G.statBonus(s))<=G.power(G.baseline(l))*1.8+1e-6);
 assert.deepEqual(Object.keys(D.sets[id]),['2','4','6','8']);
}
s=fresh();let legacy={uid:'old',type:'gear',slot:'head',quality:2,stats:{atk:10},locked:true};s.hero.bones.head=legacy;s.hero.bones.crown={uid:'new',type:'gear',slot:'crown'};s.bag.push({uid:'bag',type:'gear',slot:'rleg'});G.migrate(s);assert.equal(s.store[0],legacy);assert.equal(legacy.slot,'crown');assert.equal(s.bag[0].slot,'boots');G.migrate(s);assert.equal(s.store.length,1);assert(!G.valid({type:'gear',slot:'external'}));
s=fresh();it=G.roll(1,()=>0);s.bag.push(it);s.cur.crystal=0;let before=JSON.stringify(it);assert(!G.reforge(it.uid));assert.equal(JSON.stringify(it),before);assert(G.equip(it.uid));s.bagCap=0;assert(!G.unequip(it.slot));
console.log('feat_gear: ten slots, eight-piece sets, cap, migration and inventory passed');
require('../ui/tabs.js');require('../ui/bag.js');require('../features/gear/ui.js');
assert(G.install());assert(G.install());let html=S.ui.gear(s);D.slots.forEach(k=>assert(html.includes(D.slotNames[k])));assert(!html.includes('终局解锁'));assert(!html.includes('/6'));assert(html.includes('/8'));assert(!html.includes('undefined'));assert(S.ui.warehouse(s).includes('data-gear-filter'));
