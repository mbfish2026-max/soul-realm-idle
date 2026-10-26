const assert=require('assert'),cp=require('child_process'),path=require('path');
const script=path.resolve(__dirname,'../tools/sim/skills.js');
function run(){const r=cp.spawnSync(process.execPath,[script,'--class=blade','--investment=high','--mode=online','--hours=0.05'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.trim());}
let a=run(),b=run();assert.deepEqual(a,b,'seeded natural collection is reproducible');assert(!a.complete);assert(a.level<40);assert(a.gear<=10);assert(a.clears>0);assert(a.rings<=Math.floor(a.level/10));assert(a.pets.every(p=>p.seg<=10));
const rejected=cp.spawnSync(process.execPath,[script,'--class=blade','--investment=high','--mode=online','--hours=0.05','--assert-target=true'],{encoding:'utf8'});assert.equal(rejected.status,1,'acceptance mode must reject incomplete/out-of-target runs');
console.log('core_sim_continuous: deterministic collection and non-passing acceptance guard passed');
