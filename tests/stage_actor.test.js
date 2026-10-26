const assert=require('assert');require('../stage/actor.js');
let pending=new Map(),id=0;
const a=SR.actor.create({schedule:(fn,ms)=>{pending.set(++id,{fn,ms});return id;},cancel:key=>pending.delete(key)});
assert.equal(a.state,'idle');
for(const state of ['move','attack','skill','hit','fusion']){assert(a.set(state));assert.equal(a.state,state);const timer=[...pending.values()][0];assert.equal(timer.ms,SR.actor.DUR[state]);pending.clear();timer.fn();assert.equal(a.state,'idle');}
a.set('attack');a.set('hit');assert.equal(pending.size,1);a.set('die');assert.equal(pending.size,0);assert.equal(a.set('hit'),false);assert.equal(a.state,'die');a.set('idle',true);a.set('win');assert.equal(pending.size,0);assert.equal(a.set('attack'),false);a.set('idle',true);assert.equal(a.set('unknown'),false);a.destroy();assert.equal(a.set('attack'),false);
console.log('stage_actor: passed');
