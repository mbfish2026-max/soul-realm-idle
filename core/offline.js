(function(g){
  var SR=g.SR=g.SR||{}, api=SR.offline={capSeconds:43200,efficiency:0.7,
    expected:function(state){var f=state.map.floor;return {crystalPerSecond:f*3*1.3/7,expPerSecond:f*5*1.3/7,essencePerSecond:0.37/7};},
    calculate:function(state,now){var seconds=Math.min(api.capSeconds,Math.max(0,((now===undefined?Date.now():now)-state.t)/1000)),rate=api.expected(state),effective=seconds*api.efficiency,items=[],m=SR.DATA.maps.find(function(x){return x.id===state.map.mapId;})||SR.DATA.maps[0],t=m.floorTables?m.floorTables[Math.max(0,Math.min(m.floors-1,state.map.floor-1))]:m,range=t.monsters[0].yearsRange;
      for(var i=0,n=Math.floor(effective*rate.essencePerSecond);i<n;i++){var years=Math.min(9999,Math.max(10,range[0]+Math.floor(SR.rng()*(range[1]-range[0]+1))));items.push(SR.loot.essence(years,true));}
      return {seconds:seconds,crystal:Math.floor(effective*rate.crystalPerSecond),exp:Math.floor(effective*rate.expPerSecond),items:items};
    },
    claim:function(now){var s=SR.save.state,time=now===undefined?Date.now():now,r=api.calculate(s,time);s.cur.crystal+=r.crystal;s.hero.exp+=r.exp;r.items.forEach(function(item){SR.bag.add(item);});s.t=Math.max(s.t,time);SR.save.markDirty();SR.bus.emit('offline:reward',r);return r;}
  };
})(typeof window!=='undefined'?window:globalThis);
