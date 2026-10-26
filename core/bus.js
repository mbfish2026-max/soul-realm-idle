(function(g){
  var SR=g.SR=g.SR||{}, events=Object.create(null);
  SR.bus={
    on:function(n,f){if(typeof f!=='function')throw new TypeError('listener');(events[n]||(events[n]=[])).push(f);return function(){SR.bus.off(n,f);};},
    off:function(n,f){if(!f){delete events[n];return;}events[n]=(events[n]||[]).filter(function(x){return x!==f&&x.original!==f;});},
    once:function(n,f){function once(p){SR.bus.off(n,once);f(p);}once.original=f;return SR.bus.on(n,once);},
    emit:function(n,p){(events[n]||[]).slice().forEach(function(f){f(p);});}
  };
})(typeof window!=='undefined'?window:globalThis);
