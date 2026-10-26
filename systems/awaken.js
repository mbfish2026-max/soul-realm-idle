(function(g){'use strict';var SR=g.SR=g.SR||{};
var offers=null;
SR.awaken={choices:function(){if(!offers){offers=SR.DATA.souls.slice();for(var i=offers.length-1;i>0;i--){var j=Math.floor(SR.rng()*(i+1)),t=offers[i];offers[i]=offers[j];offers[j]=t;}offers=offers.slice(0,3);}return offers.slice();},choose:function(id){var s=SR.save.state;if(s.flags.awakened||!this.choices().some(function(x){return x.id===id;}))return false;s.hero.soulId=id;s.hero.twin=SR.rng()<0.01;s.hero.talent=Math.floor(SR.rng()*10)+1;s.flags.awakened=true;SR.save.markDirty();SR.bus.emit('hero:changed',{});return true;}};
SR.bus.on('hero:awaken_request',function(p){SR.awaken.choose(p.soulId);});
})(typeof window!=='undefined'?window:globalThis);
