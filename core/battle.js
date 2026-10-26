(function(g){
  var SR=g.SR=g.SR||{}, running=false,auto=true,carry=0,delay=0,serial=0,hero=null,pets=[],enemies=[],pending=[],fusion=0;
  function emit(n,p){SR.bus.emit('battle:'+n,p);}
  function map(){return SR.DATA.maps.find(function(m){return m.id===SR.save.state.map.mapId;})||SR.DATA.maps[0];}
  function stats(side,obj){var provider=SR.stats&&SR.stats[side],s=SR.save.state,base;
    if(provider)base=provider(side==='hero'?s:obj);
    else {var table=side==='hero'?SR.DATA.souls:SR.DATA.pets;var id=side==='hero'?s.hero.soulId:obj.speciesId;var row=(table||[]).find(function(x){return x.id===id;});base=Object.assign({atk:20,def:3,hp:260},row&&row.baseStats);var k=side==='hero'?1+((s.hero.level||1)-1)*0.12:1+((obj.seg||1)-1)*0.2;base={atk:base.atk*k,def:base.def*k,hp:base.hp*k};}
    return {atk:Math.max(1,Number(base.atk)||1),def:Math.max(0,Number(base.def)||0),hp:Math.max(1,Number(base.hpMax||base.hp)||1)};
  }
  function actor(side,obj,old){var st=stats(side,obj),max=st.hp;return {uid:side==='hero'?'hero':obj.uid,side:side,atk:st.atk,def:st.def,hpMax:max,hp:old?Math.max(0,Math.min(max,old.hp+max-old.hpMax)):max,clock:old?old.clock:0,cool:old?old.cool:{},source:obj};}
  function refresh(reset){hero=actor('hero',SR.save.state.hero,reset?null:hero);pets=SR.save.state.team.pets.slice(0,2).map(function(uid){return SR.save.state.pets.find(function(p){return p.uid===uid;});}).filter(Boolean).map(function(p){return actor('pet',p,reset?null:pets.find(function(x){return x.uid===p.uid;}));});}
  function hp(a){emit('hp',{side:a.side,uid:a.uid,hp:a.hp,hpMax:a.hpMax});}
  function phase(e){while(e.phase<3&&e.hp/e.hpMax<=(e.phase===1?0.66:0.33)){e.phase++;var name=e.phase===2?SR.NAMES.coreWarnings.surge:SR.NAMES.coreWarnings.rage;emit('boss_phase',{uid:e.uid,phase:e.phase,warn:{name:name,delayMs:3000}});pending.push({enemy:e,left:3000});}}
  function hit(a,b,m,skill,index){if(!b||b.hp<=0)return;var crit=SR.rng()<0.1,dmg=Math.max(1,Math.round((a.atk*m-b.def)*(crit?1.5:1)));b.hp=Math.max(0,b.hp-dmg);emit('attack',{src:{side:a.side,uid:a.uid},dst:{side:b.side,uid:b.uid},dmg:dmg,crit:crit,skillId:skill||null,ringIndex:index===undefined?null:index});hp(b);if(b.isBoss)phase(b);if(b.side==='enemy'&&b.hp===0)emit('kill',{uid:b.uid,kind:b.kind,years:b.years,isBoss:b.isBoss});}
  function spawn(){var s=SR.save.state,m=map();s.map.mapId=m.id;s.map.floor=Math.max(1,Math.min(m.floors,Math.floor(s.map.floor)||1));s.map.wave=Math.max(1,Math.min(m.waves,Math.floor(s.map.wave)||1));var t=m.floorTables?m.floorTables[s.map.floor-1]:m,boss=s.map.wave===m.waves;pending=[];
    enemies=Array.from({length:boss?1:3},function(){var total=t.monsters.reduce(function(n,x){return n+x.weight;},0),roll=SR.rng()*total,row=t.monsters[0];t.monsters.some(function(x){roll-=x.weight;if(roll<0){row=x;return true;}return false;});if(boss)row=t.boss;return {uid:'enemy-'+(++serial),side:'enemy',kind:row.kind,name:row.name,hp:row.hp,hpMax:row.hp,atk:row.atk,def:s.map.floor-1,years:row.yearsRange[0]+Math.floor(SR.rng()*(row.yearsRange[1]-row.yearsRange[0]+1)),isBoss:boss,phase:1,clock:0};});
    emit('wave_start',{mapId:s.map.mapId,floor:s.map.floor,wave:s.map.wave,waveMax:m.waves,enemies:enemies.map(function(e){return {uid:e.uid,kind:e.kind,name:e.name,hp:e.hp,hpMax:e.hpMax,years:e.years,isBoss:e.isBoss};})});enemies.forEach(function(e){if(e.isBoss)emit('boss_phase',{uid:e.uid,phase:1,warn:null});});hp(hero);pets.forEach(hp);
  }
  function target(){return enemies.find(function(e){return e.hp>0;});}
  function skills(a){var ids=[];if(a.side==='hero'){var soul=(SR.DATA.souls||[]).find(function(s){return s.id===a.source.soulId;});(soul&&soul.skills||[]).forEach(function(id){ids.push({id:id,index:null});});(a.source.rings||[]).forEach(function(r,i){if(r.skillId)ids.push({id:r.skillId,index:i});});}else (a.source.skills||[]).forEach(function(id){ids.push({id:id,index:null});});return ids;}
  function act(a,dt){if(a.hp<=0)return;a.clock+=dt;Object.keys(a.cool).forEach(function(k){a.cool[k]=Math.max(0,a.cool[k]-dt);});if(a.clock>=1000){a.clock-=1000;hit(a,target(),1);}if(auto)skills(a).forEach(function(entry){var sk=(SR.DATA.skills||{})[entry.id],key=entry.id+':'+entry.index;if(!sk||a.cool[key]>0||!target())return;a.cool[key]=Math.max(100,sk.cd*1000);emit('skill',{caster:{side:a.side,uid:a.uid},skillId:entry.id,ringIndex:entry.index,name:sk.name});hit(a,target(),sk.mult||1,entry.id,entry.index);});}
  function step(dt){if(delay>0){delay-=dt;if(delay<=0){refresh(false);spawn();}return;}
    pending=pending.filter(function(p){p.left-=dt;if(p.enemy.hp<=0)return false;if(p.left<=0){[hero].concat(pets).forEach(function(a){hit(p.enemy,a,1.6);});return false;}return true;});
    act(hero,dt);pets.forEach(function(p){act(p,dt);});fusion+=dt;var partner=pets.find(function(p){return p.hp>0&&p.source.bond>=100;});if(auto&&partner&&fusion>=15000&&target()){fusion=0;emit('fusion',{heroUid:hero.uid,petUid:partner.uid,name:SR.NAMES.resonance});enemies.forEach(function(e){hit(hero,e,2.5);});}
    enemies.forEach(function(e){if(e.hp<=0||hero.hp<=0)return;e.clock+=dt;if(e.clock>=1000){e.clock-=1000;hit(e,hero,1+(e.phase-1)*0.15);}});
    var s=SR.save.state;if(hero.hp<=0){s.map.wave=1;refresh(true);delay=1500;pending=[];emit('hero_down',{});return;}
    if(!target()){var wave=s.map.wave;if(wave>=map().waves){s.map.floor=Math.min(map().floors,s.map.floor+1);s.map.bestFloor=Math.max(s.map.bestFloor,s.map.floor);s.map.wave=1;}else s.map.wave++;hero.hp=Math.min(hero.hpMax,hero.hp+hero.hpMax*0.2);emit('wave_clear',{wave:wave});delay=1000;}
  }
  SR.battle={start:function(){if(running)return;running=true;carry=0;delay=0;fusion=0;refresh(true);spawn();},stop:function(){running=false;},setAuto:function(v){auto=!!v;},tick:function(dt){if(!running||!Number.isFinite(dt)||dt<=0)return;carry+=dt;while(carry>=50&&running){carry-=50;step(50);}},snapshot:function(){return JSON.parse(JSON.stringify({running:running,auto:auto,hero:hero,pets:pets,enemies:enemies}));}};
  ['hero:changed','pet:changed'].forEach(function(n){SR.bus.on(n,function(){if(running)refresh(false);});});
  SR.bus.on('save:loaded',function(){SR.battle.stop();hero=null;pets=[];enemies=[];});
})(typeof window!=='undefined'?window:globalThis);
