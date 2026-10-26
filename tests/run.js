const fs=require('fs'),cp=require('child_process'),path=require('path');
for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort()){
 const r=cp.spawnSync(process.execPath,[path.join(__dirname,f)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
// Integration contract: actual combat consumes world encounters online and offline.
const assert=require('assert');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require('../'+f));
SR.content.install();SR.buildWorldMap();
['core/rng','core/save','core/bag','core/loot','core/progress','core/battle','core/offline'].forEach(f=>require('../'+f));
SR.progress.install();SR.save.save=()=>true;
let checks=0;
for(const v of [0,1,2]){
 const old={v,bag:[{uid:'old',type:'gear',slot:v<2?'head':'crown'}],map:{mapId:'snow',floor:3,bestFloor:4},world:{v:1,cleared:25,selected:'node-22',wave:2,rewards:{3:true}}};
 const s=SR.save.migrate(old);SR.progress.migrate(s);assert.equal(s.v,2);assert.equal(s.bag[0].uid,'old');assert.equal(s.bag[0].slot,'crown');assert.equal(s.world.cleared,25);assert.equal(s.world.wave,2);checks++;
}
SR.save.state=SR.save.create();SR.save.state.flags.awakened=true;
SR.stats={hero:()=>({atk:1e8,def:1e8,hp:1e8})};
let s=SR.save.state;SR.progress.migrate(s);SR.loot.init();
let starts=[];SR.bus.on('battle:wave_start',e=>starts.push(e));
SR.battle.start();SR.battle.tick(50000);SR.battle.stop();
assert(s.world.cleared>0);assert(starts.some(e=>e.waveMax===5));assert(!starts.filter(e=>e.waveMax===5).some(e=>e.enemies.some(x=>x.isBoss)));checks++;
s.world={v:1,cleared:7,selected:'node-7',wave:10,rewards:{}};SR.battle.start();assert(SR.battle.snapshot().enemies[0].isBoss);SR.battle.tick(2000);SR.battle.stop();assert.equal(s.world.cleared,8);assert.equal(s.world.selected,'node-8');assert.equal(s.map.mapId,'forest');assert.equal(s.cur.crystal>=300,true);checks++;
s.world={v:1,cleared:8,selected:'node-0',wave:1,rewards:{1:true}};s.auto={advance:false,challengeBoss:true};SR.battle.start();SR.battle.tick(50000);SR.battle.stop();assert.equal(s.world.selected,'node-0');assert.equal(s.world.cleared,8);checks++;
s.world={v:1,cleared:7,selected:'node-7',wave:9,rewards:{}};s.auto.challengeBoss=false;SR.auto={config:()=>s.auto,reserveFusion:()=>false,receive:e=>SR.bag.add(e),heal:()=>{}};SR.battle.start();SR.battle.tick(40000);SR.battle.stop();assert.equal(s.world.cleared,7);assert(!starts.at(-1).enemies.some(x=>x.isBoss));checks++;
s.auto.challengeBoss=true;s.auto.advance=true;s.hero.classId='integration';s.world={v:1,cleared:0,selected:'node-0',wave:1,rewards:{}};SR.offline.claim(s.t+60000);assert(s.world.cleared>0);assert.equal(s.map.wave,s.world.wave);checks++;
require('../data/skill-tree');require('../data/ring-skills');s.world={v:1,cleared:47,selected:'node-47',wave:1,rewards:{}};s.map.mapId='forest';s.map.floor=1;let preview=SR.offline.calculate(s,s.t+3600000);assert(preview.items.length>0);assert(preview.items.every(i=>i.years>9999&&i.sourceKind));checks++;
function offlinePartition(parts){SR.battle.stop();let a=SR.save.state=SR.save.create();a.flags.awakened=true;a.hero.classId='integration';a.auto={advance:false,challengeBoss:true};s=a;SR.progress.migrate(a);SR.stats.hero=()=>({atk:1,def:1e9,hp:1e9});SR.rng.seed(12);for(const ms of parts)SR.offline.claim(a.t+ms);return {kills:a.stats.kills,world:a.world,hp:SR.battle.snapshot().enemies.map(e=>e.hp)};}
assert.deepEqual(offlinePartition([600000]),offlinePartition(Array(10).fill(60000)));checks++;
console.log('WIRE2 integration: '+checks+' contracts passed');
