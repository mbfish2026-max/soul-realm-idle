const assert=require('assert');require('../names');require('../core/bus');require('../data/souls');require('../data/pets');require('../core/save');require('../systems/rings');require('../systems/pets');require('../systems/stats');
const gear={uid:'old',type:'gear',slot:'head',stats:{atk:10,def:2,hp:30}};
const s=SR.save.migrate({v:1,hero:{bones:{head:gear}},bag:[{...gear,uid:'bag',slot:'rleg'}]});
assert.equal(s.v,2);assert.equal(s.hero.bones.crown.slot,'crown');assert.equal(s.bag[0].slot,'boots');
const a=SR.stats.hero(s);s.hero.bones={};const b=SR.stats.hero(s);assert.equal(a.atk-b.atk,10);assert.equal(a.hp-b.hp,30);assert.equal(a.def-b.def,2);console.log('sys_equipment passed');
