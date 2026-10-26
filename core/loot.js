(function(g){
  var SR=g.SR=g.SR||{};
  function integer(a,b){return a+Math.floor(SR.rng()*(b-a+1));}
  var api=SR.loot={
    color:function(y){return y<100?'white':y<1000?'yellow':y<10000?'purple':y<100000?'black':'red';},
    essence:function(years,preview,source){if(SR.DATA.ringSkillPools){var keys=Object.keys(SR.DATA.ringSkillPools),kind=source&&source.kind||keys[integer(0,keys.length-1)],pool=SR.DATA.ringSkillPools[kind]||SR.DATA.ringSkillPools[keys[0]],branch=integer(0,1),index=Math.min(8,(SR.save.state.hero.rings||[]).length),id=pool.slots[index+1][branch];return {uid:preview?null:SR.bag.uid(),type:'essence',years:years,color:api.color(years),vein:SR.DATA.skills[id].vein,skillId:id,sourceKind:pool.kind,skillBranch:branch,ringIndex:index};}var skills=Object.keys((SR.DATA||{}).skills||{}),skill=skills.length?skills[integer(0,skills.length-1)]:null;return {uid:preview?null:SR.bag.uid(),type:'essence',years:years,color:api.color(years),vein:skill?SR.DATA.skills[skill].vein:null,skillId:skill};},
    grant:function(item){if(SR.auto)SR.auto.receive(item);else SR.bag.add(item);SR.bus.emit('loot:drop',{item:item});return item;},
    drop:function(enemy){var s=SR.save.state,f=s.map.floor,m=enemy.isBoss?4:1,items=[];s.cur.crystal+=f*3*m;var xp=(f*5*m*(SR.progression&&s.hero.level>=40?SR.progression.killExpScale:1)+(enemy.practiceExp||0))*(SR.offline&&SR.offline.simulating&&SR.progression?SR.progression.offlineExpBonus||1:1);s.hero.exp+=xp;enemy.expGranted=xp;s.cur.petSoul+=f*m*2;s.stats.kills=(s.stats.kills||0)+1;
      if(enemy.isBoss||SR.rng()<0.12)items.push(api.essence(Math.max(10,Math.floor(enemy.years*(0.8+SR.rng()*0.4))),false,enemy));
      if(enemy.isBoss||SR.rng()<0.01){var pets=(SR.DATA||{}).pets||[],map=((SR.DATA||{}).maps||[]).find(function(m){return m.id===s.map.mapId;}),pool=map&&(map.eggPool||(map.id==='forest'?['fox','crane','turtle','deer','hawk','tiger','bud']:null));if(pool){var local=pets.filter(function(p){return pool.indexOf(p.id)>=0;});if(local.length)pets=local;}var p=pets.length?pets[integer(0,pets.length-1)]:null;items.push({uid:SR.bag.uid(),type:'egg',speciesId:p?p.id:null,grade:p?p.grade:0});}
      if(SR.rng()<0.04){var q=integer(0,Math.min(3,f));items.push(SR.gear?SR.gear.roll(s.hero.level,SR.rng):{uid:SR.bag.uid(),type:'gear',slot:'weapon',quality:q,stats:{atk:f*(q+1),def:f,hp:f*10}});}
      items.forEach(api.grant);SR.save.markDirty();return items;
    },
    init:function(){if(api.ready)return;api.ready=true;SR.bus.on('battle:kill',api.drop);}
  };
})(typeof window!=='undefined'?window:globalThis);
