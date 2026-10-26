(function(g){
  'use strict';var SR=g.SR=g.SR||{};SR.stageFx=SR.stageFx||{};
  SR.stageFx.absorb=function(o){
    o=o||{};var host=o.el||(SR.stage.current&&SR.stage.current.el);if(!host)return null;
    var fx=SR.stageFx.create(host),color=SR.stageFx.colors[o.color]||SR.stageFx.colors.purple;
    var pillar=fx.once('sr-pillar','',50,28,2200);pillar.style.setProperty('--color',color);
    var ring=fx.once('sr-rise','',50,55,2400);ring.style.setProperty('--color',color);
    fx.burst(50,55,color);
    fx.later(function(){ring.classList.add(o.ok?'sr-absorb-ok':'sr-absorb-fail');fx.title(o.ok?'吸收成功':'吸收失败');if(!o.ok)fx.edge();fx.burst(50,30,color);},1400);
    fx.later(function(){fx.destroy();},3100);
    return {destroy:fx.destroy};
  };
})(typeof window!=='undefined'?window:globalThis);
