(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.DATA=SR.DATA||{};
SR.DATA.pets=[['fox','wind',0,'fox'],['jadefox','wind',1,'storm'],['moonfox','moon',1,'moon'],['tiger','fire',1,'flame'],['crane','wind',0,'wing'],['turtle','earth',0,'stone'],['deer','earth',0,'guard'],['hawk','wind',1,'wing']].map(function(a){return {id:a[0],name:SR.NAMES.species[a[0]],vein:a[1],grade:a[2],gradeName:SR.NAMES.petGrades[a[2]],baseStats:{atk:14,def:8,hp:120,spd:11},skills:[a[3]],evolve:a[0]==='fox'?[{to:'jadefox',need:{seg:10,counter:{key:'kills',count:30},mat:{key:'petSoul',count:20}}},{to:'moonfox',need:{seg:10,counter:{key:'battles',count:20},mat:{key:'petSoul',count:20}}}]:[]};});
})(typeof window!=='undefined'?window:globalThis);
