(function(g){
  var SR=g.SR=g.SR||{},timer=null,last=0,hidden=false;
  SR.idle={
    start:function(){if(timer!==null)return;hidden=false;SR.loot.init();SR.save.load();SR.offline.claim();if(SR.save.state.flags.awakened)SR.battle.start();last=Date.now();timer=g.setInterval(function(){if(hidden)return;var now=Date.now(),previous=last,dt=Math.max(0,now-last);last=now;if(dt>5000){/* Background throttling uses the same capped offline model. */SR.battle.stop();SR.save.state.t=previous;SR.offline.claim(now);if(SR.save.state.flags.awakened)SR.battle.start();}else {SR.battle.tick(dt);SR.save.markDirty();SR.save.tick(dt);}},100);},
    stop:function(){if(timer!==null){g.clearInterval(timer);timer=null;}SR.battle.stop();SR.save.save();},
    running:function(){return timer!==null;}
  };
  SR.bus.on('hero:changed',function(){if(timer!==null&&SR.save.state.flags.awakened)SR.battle.start();});
  SR.idle.visibility=function(isHidden,now){if(timer===null)return;now=now===undefined?Date.now():now;if(isHidden){if(hidden)return;SR.battle.tick(Math.max(0,now-last));last=now;hidden=true;SR.save.save();}else if(hidden){hidden=false;SR.battle.stop();SR.save.state.t=last;SR.offline.claim(now);last=now;if(SR.save.state.flags.awakened)SR.battle.start();}};
  if(g.document)g.document.addEventListener('visibilitychange',function(){SR.idle.visibility(g.document.hidden);});
  if(typeof g.addEventListener==='function')g.addEventListener('pagehide',function(){if(timer!==null&&!hidden)SR.save.save();});
})(typeof window!=='undefined'?window:globalThis);
