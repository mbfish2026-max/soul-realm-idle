(function(g){
  var SR=g.SR=g.SR||{},timer=null,last=0;
  SR.idle={
    start:function(){if(timer!==null)return;SR.loot.init();SR.save.load();SR.offline.claim();if(SR.save.state.flags.awakened)SR.battle.start();last=Date.now();timer=g.setInterval(function(){var now=Date.now(),previous=last,dt=Math.max(0,now-last);last=now;if(dt>5000){/* Background throttling uses the same capped offline model. */SR.battle.stop();SR.save.state.t=previous;SR.offline.claim(now);if(SR.save.state.flags.awakened)SR.battle.start();}else {SR.battle.tick(dt);SR.save.markDirty();SR.save.tick(dt);}},100);},
    stop:function(){if(timer!==null){g.clearInterval(timer);timer=null;}SR.battle.stop();SR.save.save();},
    running:function(){return timer!==null;}
  };
  SR.bus.on('hero:changed',function(){if(timer!==null&&SR.save.state.flags.awakened)SR.battle.start();});
  if(typeof g.addEventListener==='function')g.addEventListener('pagehide',function(){SR.save.save();});
})(typeof window!=='undefined'?window:globalThis);
