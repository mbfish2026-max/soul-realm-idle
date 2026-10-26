/* Read-only multi-pet fusion probe; no production data or reports are written.
 * node tools/review/review4.js
 * Only the durable, low-damage enemy is a fixture; skills/pets/stats are real.
 */
const assert = require('assert');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require('../../'+f));
SR.content.install();
['data/skill-tree','data/ring-skills','data/effects','data/skill-progression','core/rng','core/save','core/bag','core/auto','systems/rings','systems/pets','systems/stats','systems/skills','systems/ring-skills','core/battle'].forEach(f=>require('../../'+f));
const S=SR,s=S.save.state;
s.flags.awakened=true;Object.assign(s.hero,{soulId:'blade',classId:'blade',level:50});
s.pets=[{uid:'first',speciesId:'tiger',grade:0,seg:1,step:1,bond:30,skills:[]},{uid:'second',speciesId:'fox',grade:0,seg:1,step:1,bond:100,skills:[]}];
s.auto=S.auto.defaults();s.auto.enabled=false;
S.DATA.maps.push({id:'review-arena',floors:1,waves:10,monsters:[{kind:'reed',hp:1e9,atk:1,yearsRange:[10,10],weight:1}],boss:{kind:'lord',hp:1e9,atk:1,yearsRange:[10,10]}});
s.map.mapId='review-arena';s.team.pets=['first','second'];
S.battle.start();S.battle.tick(60000);const blocked=S.battle.fusion();S.battle.stop();
s.team.pets.reverse();S.battle.start();S.battle.tick(60000);const reordered=S.battle.fusion();S.battle.stop();
assert.equal(blocked,false);assert.equal(reordered,true);
console.log(JSON.stringify({firstSpecies:'tiger',firstBond:30,firstRequiredBond:S.DATA.fusionSkills.find(f=>f.classId==='blade'&&f.role==='shield').bond,secondSpecies:'fox',secondBond:100,originalOrderFusion:blocked,reversedOrderFusion:reordered}));
