(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.DATA=SR.DATA||{};
SR.DATA.souls=[['blade','tool','wind',24,9,180,12,'cut'],['tiger','beast','fire',28,7,160,13,'flame'],['body','body','earth',16,16,240,9,'guard']].map(function(a){return {id:a[0],name:SR.NAMES.souls[a[0]],kind:a[1],vein:a[2],role:a[1],baseStats:{atk:a[3],def:a[4],hp:a[5],spd:a[6]},skills:[a[7]]};});
})(typeof window!=='undefined'?window:globalThis);
