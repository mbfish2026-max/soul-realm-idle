const assert=require('assert');
['names','core/bus','data/maps','core/rng','core/save','core/bag','core/loot','core/battle','core/offline','core/idle'].forEach(f=>require('../'+f));
(async()=>{
 const interval=global.setInterval,clear=global.clearInterval,now=Date.now,claim=SR.offline.claimAsync;
 let callback,time=1000000,finish,fail,claims=0,starts=0,progress=[];
 global.setInterval=f=>{callback=f;return 1;};global.clearInterval=()=>{};Date.now=()=>time;
 SR.bus.on('offline:status',p=>progress.push(p));
 SR.offline.claimAsync=(end,onProgress)=>{claims++;onProgress(.5);return new Promise((resolve,reject)=>{finish=()=>{SR.save.state.t=end;resolve({seconds:60});};fail=reject;});};
 const start=SR.battle.start;SR.battle.start=()=>{starts++;start();};
 try{
  const pending=SR.idle.start();SR.save.state.flags.awakened=true;
  SR.bus.emit('hero:changed',{});callback();SR.idle.start();
  assert.equal(claims,1);assert.equal(starts,0);assert(SR.idle.settling());
  SR.idle.visibility(true,time);finish();await pending;await Promise.resolve();
  assert.equal(starts,0,'hidden completion must not resume battle');assert(!SR.idle.settling());
  time+=12000;const resumed=SR.idle.visibility(false,time);
  SR.idle.visibility(false,time);callback();assert.equal(claims,2);
  finish();await resumed;await Promise.resolve();assert.equal(starts,1);
  assert(progress.some(p=>p.progress===.5));assert.equal(progress.at(-1).claiming,false);
  time+=10000;callback();assert(SR.idle.settling());fail(new Error('test failure'));await Promise.resolve();await Promise.resolve();
  assert(!SR.idle.settling());assert.equal(starts,1);assert(progress.at(-1).error);
  // A later visible event retries from the persisted cursor after failure.
  const retry=SR.idle.visibility(false,time);finish();await retry;await Promise.resolve();assert.equal(starts,2);
  time+=10000;callback();SR.idle.stop();finish();await Promise.resolve();await Promise.resolve();
  assert.equal(starts,2,'stop during a claim must not restart battle');
 }finally{SR.idle.stop();global.setInterval=interval;global.clearInterval=clear;Date.now=now;SR.offline.claimAsync=claim;SR.battle.start=start;}
 console.log('core_idle_async: startup, visibility, single claim, progress, error recovery and stop passed');
})().catch(e=>{console.error(e);process.exit(1);});
