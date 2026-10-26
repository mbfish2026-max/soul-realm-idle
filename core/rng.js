(function(g){
  var SR=g.SR=g.SR||{}, s=Date.now()>>>0;
  SR.rng=function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  SR.rng.seed=function(n){s=Number(n)>>>0;};
})(typeof window!=='undefined'?window:globalThis);
