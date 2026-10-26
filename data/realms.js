(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.DATA=SR.DATA||{};SR.DATA.realms=SR.NAMES.realms.map(function(n,i){return {id:i,name:n,minLevel:i*10+1,maxLevel:(i+1)*10,ringSlots:Math.min(9,i)};});
})(typeof window!=='undefined'?window:globalThis);
