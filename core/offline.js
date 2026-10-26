(function(g){
  var SR=g.SR=g.SR||{}, api=SR.offline={capSeconds:43200,efficiency:0.7,
    expected:function(state){var f=state.map.floor;return {crystalPerSecond:f*3*1.3/7,expPerSecond:f*5*1.3/7,essencePerSecond:0.37/7};},
    calculate:function(state,now){var seconds=Math.min(api.capSeconds,Math.max(0,((now===undefined?Date.now():now)-state.t)/1000)),rate=api.expected(state),effective=seconds*api.efficiency,items=[],m=SR.DATA.maps.find(function(x){return x.id===state.map.mapId;})||SR.DATA.maps[0],t=m.floorTables?m.floorTables[Math.max(0,Math.min(m.floors-1,state.map.floor-1))]:m,range=t.monsters[0].yearsRange;
      for(var i=0,n=Math.floor(effective*rate.essencePerSecond);i<n;i++){var years=Math.min(9999,Math.max(10,range[0]+Math.floor(SR.rng()*(range[1]-range[0]+1))));items.push(SR.loot.essence(years,true));}
      return {seconds:seconds,crystal:Math.floor(effective*rate.crystalPerSecond),exp:Math.floor(effective*rate.expPerSecond),items:items};
    },
    claimAsync:function(now,onProgress){
      if(api.claiming)return Promise.reject(new Error('offline claim in progress'));
      var s=SR.save.state,end=now===undefined?Date.now():now,start=Math.max(s.t,end-api.capSeconds*1000),total=Math.max(0,end-start),cursor=start,items=[],crystal=0,exp=0;
      api.claiming=true;
      return new Promise(function(resolve,reject){
        function next(){
          var emit=SR.bus.emit;
          try{
            s.t=cursor;
            SR.bus.emit=function(n,p){if(n!=='offline:reward')emit(n,p);};
            var target=Math.min(end,cursor+60000),r=api.claim(target);
            SR.bus.emit=emit;cursor=Math.max(cursor,target);
            items=items.concat(r.items);crystal+=r.crystal;exp+=r.exp;
            if(onProgress)onProgress(total?Math.min(1,(cursor-start)/total):1);
            if(cursor<end&&!(SR.bag&&SR.bag.full())){setTimeout(next,0);return;}
            s.t=Math.max(start,end);api.claiming=false;SR.save.markDirty();
            var result={seconds:total,crystal:crystal,exp:exp,items:items,pausedSeconds:Math.max(0,end-cursor)/1000};
            result.seconds=total/1000;emit('offline:reward',result);resolve(result);
          }catch(e){SR.bus.emit=emit;api.claiming=false;reject(e);}
        }
        next();
      });
    },
    claim:function(now){var s=SR.save.state,time=now===undefined?Date.now():now,r;if(SR.auto&&SR.battle&&s.hero.classId&&s.flags.awakened){var seconds=Math.min(api.capSeconds,Math.max(0,(time-s.t)/1000)),crystal=s.cur.crystal,items=[],gainedExp=0,emit=SR.bus.emit;if(!seconds)return {seconds:0,crystal:0,exp:0,items:[]};api.simulating=true;SR.bus.emit=function(n,p){if(n==='loot:drop')items.push(p.item);if(n==='battle:kill')gainedExp+=s.map.floor*5*(p.isBoss?4:1);emit(n,p);};try{SR.battle.stop();SR.battle.start();SR.battle.tick(seconds*1000*api.efficiency);}finally{SR.battle.stop();SR.bus.emit=emit;api.simulating=false;}r={seconds:seconds,crystal:s.cur.crystal-crystal,exp:gainedExp,items:items};s.t=Math.max(s.t,time);SR.save.markDirty();SR.bus.emit('offline:reward',r);return r;}var requested=Math.min(api.capSeconds,Math.max(0,(time-s.t)/1000)),space=Math.max(0,s.bagCap-s.bag.length+SR.bag.storeCap-s.store.length),duration=Math.min(requested,space/(api.expected(s).essencePerSecond*api.efficiency));r=api.calculate(s,s.t+duration*1000);r.pausedSeconds=requested-r.seconds;s.cur.crystal+=r.crystal;s.hero.exp+=r.exp;r.items.forEach(function(item){SR.bag.add(item,s.bag.length>=s.bagCap?'store':undefined);});s.t=Math.max(s.t,time);SR.save.markDirty();SR.bus.emit('offline:reward',r);return r;}
  };
})(typeof window!=='undefined'?window:globalThis);
