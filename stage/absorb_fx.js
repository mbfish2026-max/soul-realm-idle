(function(g){
  'use strict';var SR=g.SR=g.SR||{};SR.stageFx=SR.stageFx||{};
  SR.stageFx.absorb=function(o){
    o=o||{};var host=o.el||(SR.stage.current&&SR.stage.current.el);if(!host)return null;
    var fx=SR.stageFx.create(host),color=SR.stageFx.colors[o.color]||SR.stageFx.colors.purple;
    var pillar=fx.image('fx_drop_'+(o.color||'white'),50,40,230);pillar.style.setProperty('--color',color);
    var ring=fx.image('fx_ring_rise',50,55,180);ring.style.setProperty('--color',color);
    fx.burst(50,55,color);
    fx.later(function(){ring.classList.add(o.ok?'sr-absorb-ok':'sr-absorb-fail');fx.image('fx_absorb_'+(o.ok?'success':'fail'),50,45,220);fx.title(o.ok?'吸收成功':'吸收失败');if(!o.ok)fx.edge();fx.burst(50,30,color);},1400);
    fx.later(function(){fx.destroy();},3100);
    var effect={destroy:fx.destroy};if(SR.stage.current&&SR.stage.current.el===host)SR.stage.current.trackFx(effect);return effect;
  };
})(typeof window!=='undefined'?window:globalThis);
