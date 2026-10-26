const assert=require('assert');require('../names');require('../core/bus');require('../core/save');require('../core/bag');require('../features/gear/data');require('../features/gear/gear');
const S=SR,B=S.bag;S.save.state=S.save.create();const s=S.save.state;
s.bagCap=4;s.bag=[{uid:'item-2',type:'gear',quality:1,level:20,slot:'crown'},{uid:'item-10',type:'essence',years:1000,locked:true},{uid:'old',type:'egg',grade:0},{uid:'mat',type:'mat',count:999}];
assert.deepEqual(B.slots(),{used:4,total:4,free:0,full:true});assert.equal(B.query('bag','gear').length,1);assert.equal(B.query('bag','mat')[0].count,999);assert.equal(B.query('bag','all','quality')[0].uid,'item-10');assert.equal(B.query('bag','all','level')[0].uid,'item-10');assert.deepEqual(B.query('bag','all','type').map(e=>e.type),['gear','essence','egg','mat']);
assert.equal(B.query('bag','gear','new')[0].uid,'item-2');s.store=[{uid:'item-3',type:'mat'},{uid:'item-12',type:'mat'}];assert.equal(B.query('store','all','new')[0].uid,'item-12');
const before=s.bag.slice();B.query('bag','all','quality');assert.deepEqual(s.bag,before);B.sort('bag','quality');const sorted=JSON.stringify(s.bag);B.sort('bag','quality');assert.equal(JSON.stringify(s.bag),sorted);
assert(!B.selectable('bag').some(e=>e.locked));let r=B.batch(['item-10','old','old','missing'],'sell');assert.equal(r.count,1);assert(s.bag.some(e=>e.locked));assert.equal(B.batch(['mat'],'dismantle').count,0);
r=B.batch(['item-2'],'dismantle');assert.equal(r.count,1);assert.equal(r.crystal,SR.gear.value(before[0]));assert.equal(B.slots().used,2);assert.equal(B.batch(['item-10'],'sell').count,0);
// Existing saves round-trip with no schema changes; stack counts remain one cell.
S.save.state=S.save.migrate(JSON.parse(JSON.stringify(s)));assert.equal(B.slots().used,2);assert(S.save.state.bag.find(e=>e.uid==='mat').count===999);assert(S.save.state.bag.find(e=>e.uid==='item-10').locked);
console.log('core_bag_grid OK');
