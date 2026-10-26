(function(g){
  var SR=g.SR=g.SR||{},timer=null,last=0,hidden=false,settling=null,generation=0;
  function resume(){if(timer!==null&&!hidden&&!settling&&!SR.offline.claiming&&SR.save.state.flags.awakened)SR.battle.start();}
  function settle(now){
    if(settling)return settling;
    var token=generation;
    SR.battle.stop();SR.save.state.t=last;
    SR.bus.emit('offline:status',{claiming:true,progress:0});
    settling=SR.offline.claimAsync(now,function(progress){SR.bus.emit('offline:status',{claiming:true,progress:progress});});
    var task=settling;
    task.then(function(result){
      if(token!==generation)return;
      settling=null;last=now;SR.save.save();SR.bus.emit('offline:status',{claiming:false,progress:1,result:result});
      // Visibility may have changed while a chunk yielded. Settle the remaining
      // wall interval before resuming so it cannot be claimed twice or lost.
      if(timer!==null&&!hidden&&Date.now()-last>5000)settle(Date.now());else resume();
    },function(error){
      if(token!==generation)return;
      settling=null;last=SR.save.state.t;SR.save.save();hidden=true;
      SR.bus.emit('offline:status',{claiming:false,error:error});
    });
    return task;
  }
  SR.idle={
    start:function(){
      if(timer!==null)return settling||Promise.resolve();
      if(SR.offline.claiming)return Promise.reject(new Error('offline claim in progress'));
      generation++;hidden=false;SR.loot.init();SR.save.load();last=SR.save.state.t;
      timer=g.setInterval(function(){
        if(hidden||settling)return;
        var now=Date.now(),dt=Math.max(0,now-last);
        if(dt>5000)settle(now);
        else {last=now;SR.battle.tick(dt);SR.save.markDirty();SR.save.tick(dt);}
      },100);
      return settle(Date.now());
    },
    stop:function(){if(timer!==null){g.clearInterval(timer);timer=null;}SR.battle.stop();if(!settling)SR.save.save();},
    running:function(){return timer!==null;},
    settling:function(){return !!settling;}
  };
  SR.bus.on('hero:changed',resume);
  SR.idle.visibility=function(isHidden,now){
    if(timer===null)return;now=now===undefined?Date.now():now;
    if(isHidden){
      if(hidden)return;
      hidden=true;
      if(!settling){if(now-last>5000)settle(now);else {SR.battle.tick(Math.max(0,now-last));last=now;SR.save.save();}}
      SR.battle.stop();
    }else if(hidden){hidden=false;if(!settling)return settle(now);}
  };
  if(g.document)g.document.addEventListener('visibilitychange',function(){SR.idle.visibility(g.document.hidden);});
  if(typeof g.addEventListener==='function')g.addEventListener('pagehide',function(){if(timer!==null&&!hidden&&!settling)SR.save.save();});
})(typeof window!=='undefined'?window:globalThis);
