(function(g){'use strict';var SR=g.SR=g.SR||{};
SR.content={install:function(){var D=SR.DATA,P=SR.contentParts;if(!D||!D.souls||!D.pets||!D.maps||!D.realms||!D.skills||!P||!P.progression||!P.pets||!P.maps)throw new Error('Content requires base data and all extension scripts');if(this.installed)return D;P.progression(D);P.pets(D);P.maps(D);this.installed=true;return D;}};
})(typeof window!=='undefined'?window:globalThis);
