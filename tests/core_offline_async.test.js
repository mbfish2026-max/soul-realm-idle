const assert=require('assert');
require('../names');require('../core/bus');require('../data/maps');require('../core/rng');require('../core/save');require('../core/bag');require('../core/loot');require('../core/offline');
(async()=>{
 SR.save.state.t=Date.now()-180000;let now=Date.now(),rewards=0,progress=[],yielded=false;
 SR.bus.on('offline:reward',()=>rewards++);setTimeout(()=>{yielded=true;},0);
 let result=await SR.offline.claimAsync(now,p=>progress.push(p));
 assert(yielded,'chunks yield to browser event loop');assert(progress.length>=3);assert.equal(progress.at(-1),1);assert.equal(rewards,1,'one final reward, not one modal/save per chunk');assert(result.seconds>=180);assert.equal(SR.offline.claim(now).seconds,0);
 console.log('core_offline_async: yielding, progress, one reward and cursor passed');
})().catch(e=>{console.error(e);process.exit(1);});
