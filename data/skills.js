(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.DATA=SR.DATA||{};SR.DATA.skills={};
[['cut','wind',4,1.8],['flame','fire',6,2.3],['guard','earth',9,1.3],['fox','wind',5,1.7],['moon','moon',7,2],['storm','wind',8,2.2],['stone','earth',8,1.4],['wing','wind',4,1.6]].forEach(function(a){SR.DATA.skills[a[0]]={name:SR.NAMES.skills[a[0]],vein:a[1],cd:a[2],mult:a[3],desc:'造成 '+Math.round(a[3]*100)+'% 属性伤害'};});
})(typeof window!=='undefined'?window:globalThis);
