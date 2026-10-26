const assert=require('assert');require('../names');require('../core/bus');require('../data/souls');require('../data/pets');require('../core/save');require('../systems/rings');require('../systems/pets');require('../systems/stats');
const gear={uid:'old',type:'gear',slot:'head',stats:{atk:10,def:2,hp:30}};
const s=SR.save.migrate({v:1,hero:{bones:{head:gear}},bag:[{...gear,uid:'bag',slot:'rleg'}]});
assert.equal(s.v,2);assert.equal(s.hero.bones.crown.slot,'crown');assert.equal(s.bag[0].slot,'boots');
const a=SR.stats.hero(s);s.hero.bones={};const b=SR.stats.hero(s);assert.equal(a.atk-b.atk,10);assert.equal(a.hp-b.hp,30);assert.equal(a.def-b.def,2);console.log('sys_equipment passed');
require('../core/rng');require('../core/bag');require('../features/gear/data');require('../features/gear/gear');require('../assets/manifest');require('../assets/ui2/manifest');require('../assets/scene/manifest');require('../assets/frames/manifest');SR.ui={show:function(){}};global.Image=class{};require('../main');
SR.save.state=s;
for(const [i,slot] of SR.equipment.slots.entries()){
 const e={uid:'gear-'+i,type:'gear',slot,stats:{atk:1,def:1,hp:10}};s.bag.push(e);SR.bus.emit('gear:equip',{uid:e.uid});assert.equal(s.hero.bones[slot],e);
}
assert.equal(Object.keys(s.hero.bones).length,10);
for(const slot of SR.equipment.slots){SR.bus.emit('gear:unequip',{slot});assert(!s.hero.bones[slot]);}
assert.equal(SR.stats.hero(s).atk,b.atk);console.log('equipment ten-slot equip/unequip passed');
