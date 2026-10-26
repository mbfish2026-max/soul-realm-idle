const assert=require('assert');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require('../'+f));SR.content.install();
['core/rng','core/save','core/bag','systems/pets','core/battle'].forEach(f=>require('../'+f));
const s=SR.save.state=SR.save.create();s.hero.soulId='blade';
s.pets=Array.from({length:4},(_,i)=>({uid:'pet'+i,speciesId:'fox',grade:0,seg:1,step:1,bond:0}));
for(const [level,slots] of [[1,1],[19,1],[20,2],[49,2],[50,3],[99,3]]){
 s.hero.level=level;s.team.pets=[];assert.equal(SR.pets.slots(),slots);
 s.pets.forEach((p,i)=>assert.equal(SR.pets.deploy(p.uid),i<slots));
 SR.battle.stop();SR.battle.start();assert.equal(SR.battle.snapshot().pets.length,slots);
 assert(SR.pets.deploy('pet0'));assert(SR.pets.deploy('pet3'));SR.battle.stop();
}
console.log('sys_pet_slots: level boundaries, capacity and battle actors passed');
