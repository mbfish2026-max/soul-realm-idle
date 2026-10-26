const assert=require('assert');
require('../core/bus');require('../core/save');require('../core/bag');
let s=SR.save.migrate({v:1,hero:{bones:{rarm:{uid:'arm',locked:true,setId:'bamboo',affixes:[{key:'fierce',value:2}]}}},bag:[{type:'gear',slot:'rarm',uid:'bag'}]});
assert.equal(s.hero.bones.belt.uid,'arm');assert(s.hero.bones.belt.locked);assert.equal(s.bag[0].slot,'belt');
SR.save.state=s;global.localStorage={setItem(){let e=Error('full');e.name='QuotaExceededError';throw e;}};
let failures=0;SR.bus.on('save:failed',()=>failures++);assert.equal(SR.save.save(),false);assert(SR.save.status.failed);assert.equal(failures,1);assert.equal(JSON.parse(SR.save.export()).hero.bones.belt.uid,'arm');
delete global.localStorage;assert(SR.save.save());assert.equal(SR.save.status.failed,false);
s.store=Array.from({length:991},(_,i)=>({uid:'s'+i,locked:true}));assert(SR.bag.full());assert.equal(SR.bag.capacityStatus().capacity,1000);assert.equal(s.store.length,991);
console.log('core_fix_review OK');
