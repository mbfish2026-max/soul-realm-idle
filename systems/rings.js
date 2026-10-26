(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.formula=SR.formula||{};
function soul(h){return SR.DATA.souls.find(function(s){return s.id===h.soulId;});}
function color(y){return y<100?'white':y<1000?'yellow':y<10000?'purple':y<100000?'black':'red';}
function slots(h){return Math.max(0,Math.min(9,Math.floor(h.level/10)));}
function cap(h){var s=soul(h);return Math.floor(300*Math.pow(2,(h.rings||[]).length)*(0.6+Math.max(1,Math.min(10,h.talent))/10)*(s&&s.kind==='body'?1.2:1));}
SR.formula.absorbRate=function(h,e){var s=soul(h),talent=0.65+Math.max(1,Math.min(10,h.talent))/100,fit=s&&s.vein===e.vein?0.2:0.05,over=-Math.max(0,e.years/cap(h)-1)*0.4;return {rate:Math.max(0,Math.min(1,talent+fit+over)),parts:{talent:talent,fit:fit,over:over}};};
SR.rings={color:color,slots:slots,capacity:cap,benefit:function(y){return Math.log10(1+Math.max(0,y));},absorb:function(uid){var s=SR.save.state,h=s.hero,bag=s.bag,e=bag.find(function(x){return x.uid===uid&&x.type==='essence';});if(!e){bag=s.store;e=bag.find(function(x){return x.uid===uid&&x.type==='essence';});}if(e&&e.locked)return {ok:false,reason:'locked'};if(!e||!s.flags.awakened||h.rings.length>=slots(h)||!Number.isFinite(e.years)||e.years<=0||!SR.DATA.skills[e.skillId])return {ok:false,reason:'invalid'};var r=SR.formula.absorbRate(h,e),i=h.rings.length,ok=SR.rng()<r.rate;bag.splice(bag.indexOf(e),1);if(ok)h.rings.push({uid:e.uid,years:e.years,color:color(e.years),vein:e.vein,skillId:e.skillId});var result={ok:ok,ringIndex:i,essence:e,rate:r.rate};SR.save.markDirty();SR.bus.emit('ring:absorb_result',result);SR.bus.emit('hero:changed',{});return result;},strip:function(i){var s=SR.save.state,r=s.hero.rings[i];if(!r||s.bag.length>=s.bagCap)return false;var y=Math.floor(r.years*0.5);s.hero.rings.splice(i,1);s.bag.push({uid:r.uid+'-strip',type:'essence',years:Math.max(1,y),color:color(Math.max(1,y)),vein:r.vein,skillId:r.skillId});SR.save.markDirty();SR.bus.emit('hero:changed',{});return true;}};
SR.bus.on('ring:absorb_request',function(p){SR.rings.absorb(p.essenceUid);});
SR.bus.on('ring:strip_request',function(p){SR.rings.strip(p.ringIndex);});
})(typeof window!=='undefined'?window:globalThis);
