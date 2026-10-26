(function(g){
  'use strict';var SR=g.SR=g.SR||{};
  var EVENTS=['battle:wave_start','battle:attack','battle:skill','battle:fusion','battle:hp','battle:kill','battle:hero_down','battle:boss_phase','loot:drop','battle:wave_clear','pet:changed'];
  // Pure presentation plan: timestamps never mutate authoritative battle data.
  function commands(event,p){
    p=p||{};var op=function(at,type,data){return {at:at,type:type,data:data||p};};
    switch(event){
      case 'battle:wave_start':return [op(0,'wave')];
      case 'battle:attack':return [op(0,'attack'),op(p.skillId?480:180,'impact')];
      case 'battle:skill':return [op(0,'prepare'),op(120,'ring'),op(140,'title'),op(260,'linked'),op(380,'slash')];
      case 'battle:fusion':return [op(0,'charge'),op(60,'rings'),op(200,'title'),op(420,'fusion'),op(640,'shock')];
      case 'battle:hp':return [op(0,'hp')];
      case 'battle:kill':return [op(700,'kill')];
      case 'battle:hero_down':return [op(0,'down')];
      case 'battle:boss_phase':return [op(0,'phase')];
      case 'loot:drop':return [op(0,'loot')];
      case 'battle:wave_clear':return [op(1300,'win')];
      case 'pet:changed':return [op(0,'pets')];
      default:return [];
    }
  }
  function mount(el){
    if(SR.stage.current&&SR.stage.current.el===el)SR.stage.current.destroy();
    el.classList.add('sr-stage');var background=document.createElement('div');background.className='sr-background';el.appendChild(background);
    var caption=document.createElement('div');caption.className='sr-caption';el.appendChild(caption);
    var ringHost=document.createElement('div');ringHost.className='sr-rings';el.appendChild(ringHost);
    var fx=SR.stageFx.create(el),actors={},enemies=[],boss=null,bossUid=null,redDropped=false,timers=[],listeners=[],extras=[],dead=false;
    var base=new URL('../',document.currentScript&&document.currentScript.src||g.location.href).href;
    // demo and production callers may explicitly resolve from their own script location.
    base=SR.stage.assetBase||base;
    var fallback={hero_idle:'hero_idle',hero_attack:'hero_attack',hero_skill:'hero_skill',hero_die:'hero_down',pet_fox_idle:'fox_idle',pet_fox_attack:'fox_attack'};
    function asset(key,alternate){var catalog=SR.ASSETS||{},aliases={mob_reed:'mob_ink_wolf',mob_moss:'mob_bamboo_snake',boss_lord:'boss_cinder_stag'},a=catalog[(aliases[key]||key)+'_1x']||catalog[aliases[key]||key];if(!a&&/^(hero_|pet_fox_)/.test(key))a=catalog[key.replace(/_[^_]+$/,'_idle')];if(a){if(typeof a==='string')return new URL(a,base).href;var copy=Object.assign({},a);copy.file=new URL(a.file,base).href;return copy;}return new URL(catalog.mob_ink_wolf.file,base).href;}
    function scene(map){var id=map==='snow'?'snow':map==='ridge'?'ember':'forest';background.replaceChildren();['far','mid','front'].forEach(function(layer){var n=document.createElement('div');n.className='sr-scene-layer sr-layer-'+layer;n.style.backgroundImage='url("'+asset('bg_'+id+'_'+layer).file+'")';background.appendChild(n);});}scene('forest');
    function later(fn,ms){var id=setTimeout(function(){timers=timers.filter(function(x){return x!==id;});if(!dead)fn();},ms);timers.push(id);}
    function add(id,kind,x,y,width,label,assetId){var node=document.createElement('div');node.className='sr-actor sr-'+kind;node.style.left=x+'%';node.style.top=y+'%';node.style.setProperty('--actor-width',width+'px');el.appendChild(node);
      var sprites={};Object.keys(SR.actor.DUR).forEach(function(s){assetId=({reed:'ink_wolf',moss:'bamboo_snake',lord:'cinder_stag'}[assetId]||assetId);var prefix=kind==='hero'?'hero':kind==='pet'?'pet_fox':(kind==='boss'?'boss_':'mob_')+(assetId||id);var key=prefix+'_'+s;if(!(SR.ASSETS[key]||SR.ASSETS[key+'_1x']))key=prefix+'_idle';if(!(SR.ASSETS[key]||SR.ASSETS[key+'_1x']))key=prefix;sprites[s]=asset(key);});
      var actor=SR.actor.create({el:node,sprites:sprites});actor.el=node;actor.point={x:x,y:y};
      if(label){var tag=document.createElement('div');tag.className='sr-tag';var name=document.createElement('span');name.textContent=label;tag.appendChild(name);var hp=document.createElement('div');hp.className='sr-hp';hp.innerHTML='<i></i>';tag.appendChild(hp);node.appendChild(tag);actor.hp=hp.firstChild;}
      actors[id]=actor;return actor;
    }
    function remove(id){if(actors[id]){actors[id].destroy();actors[id].el.remove();delete actors[id];}}
    add('hero','hero',50,92,125);
    function pets(){Object.keys(actors).filter(function(id){return id.indexOf('pet:')===0;}).forEach(remove);var state=SR.save&&SR.save.state;((state&&state.team&&state.team.pets)||[]).slice(0,2).forEach(function(uid,i){add('pet:'+uid,'pet',i?76:23,91,95);});}
    function petActors(){return Object.keys(actors).filter(function(k){return k.indexOf('pet:')===0;}).map(function(k){return actors[k];});}
    function actor(ref){if(!ref)return null;return actors[ref.side==='hero'?'hero':ref.side==='pet'?'pet:'+ref.uid:ref.uid];}
    function set(a,s){if(a)a.set(s);}
    function rings(){ringHost.replaceChildren();var state=SR.save&&SR.save.state;((state&&state.hero&&state.hero.rings)||[]).slice(0,9).forEach(function(r,i){var n=document.createElement('div');n.className='sr-ring';n.style.width=(54+i*22)+'px';n.style.height=(18+i*7)+'px';n.style.backgroundImage='url("'+asset('ui2_ring_'+r.color).file+'")';ringHost.appendChild(n);});}
    function light(i){var n=ringHost.children[i];if(!n)return;n.classList.remove('sr-lit');void n.offsetWidth;n.classList.add('sr-lit');var wave=n.cloneNode();wave.className='sr-ring sr-ring-wave';el.appendChild(wave);wave.style.left='50%';wave.style.top='88%';later(function(){wave.remove();},950);fx.burst(50,88,n.style.getPropertyValue('--color'));}
    function run(c){var p=c.data,a;
      switch(c.type){
        case 'wave':
          timers.forEach(clearTimeout);timers=[];el.querySelectorAll('.sr-ring-wave').forEach(function(n){n.remove();});enemies.forEach(function(e){remove(e.uid);});enemies=p.enemies||[];
          if(boss)boss.destroy();boss=null;bossUid=null;redDropped=false;scene(p.mapId);rings();pets();actors.hero.set('idle',true);
          caption.textContent=((SR.NAMES.maps||{})[p.mapId]||p.mapId||'')+' · '+p.floor+' / '+p.wave+' · '+p.waveMax;
          background.style.transform='translateX('+((p.wave%5)-2)*3+'px)';
          enemies.forEach(function(e,i){var color=e.years>=100000?'red':e.years>=10000?'black':e.years>=1000?'purple':e.years>=100?'yellow':'white';a=add(e.uid,e.isBoss?'boss':'enemy',e.isBoss?50:[76,21,52][i%3],e.isBoss?72:[53,55,36][i%3],e.isBoss?190:112,e.years+'年 · '+(e.name||SR.NAMES.beast),e.kind);a.set('move');if(a.hp)a.hp.style.width=(e.hpMax?e.hp/e.hpMax*100:0)+'%';if(e.isBoss){bossUid=e.uid;boss=SR.stageBoss.create(el,fx,e);}});break;
        case 'prepare':set(actor(p.caster),'skill');if(p.fxKey)fx.skill(p.fxKey,p.fx);break;
        case 'ring':light(p.ringIndex);break;
        case 'title':fx.title(p.name||SR.NAMES.resonance);break;
        case 'linked':set(actor(p.caster),'attack');if(p.caster.side==='hero')petActors().forEach(function(a){set(a,'attack');});break;
        case 'slash':fx.image('fx_wind_slash',45,57,180);break;
        case 'attack':if(!p.skillId)set(actor(p.src),'attack');break;
        case 'impact':a=actor(p.dst);if(a){set(a,'hit');fx.damage(a.point,p.dmg,p.crit);fx.burst(a.point.x,a.point.y-9);if(p.dst.side==='hero')fx.edge();}break;
        case 'hp':a=actor(p);if(a&&a.hp)a.hp.style.width=(p.hpMax?Math.max(0,Math.min(100,p.hp/p.hpMax*100)):0)+'%';if(boss&&p.uid===bossUid)boss.hp(p);break;
        case 'charge':if(p.fxKey)fx.skill(p.fxKey,p.fx);set(actors.hero,'skill');petActors().forEach(function(a){set(a,'skill');});break;
        case 'rings':Array.prototype.forEach.call(ringHost.children,function(n,i){later(function(){light(i);},i*60);});break;
        case 'fusion':set(actors.hero,'fusion');petActors().forEach(function(a){set(a,'fusion');});break;
        case 'shock':fx.shake();enemies.forEach(function(e){a=actors[e.uid];if(a&&a.state!=='die'){set(a,'hit');fx.burst(a.point.x,a.point.y-10,'#bd984d');}});break;
        case 'kill':set(actors[p.uid],'die');if(p.isBoss&&p.years>=100000&&!redDropped){SR.stageBoss.drop(fx);redDropped=true;}break;
        case 'down':set(actors.hero,'die');fx.edge();break;
        case 'phase':if(boss&&p.uid===bossUid)boss.phase(p);break;
        case 'loot':if(p.item)fx.image('fx_drop_'+(p.item.color||'white'),70,50,150);if(p.item&&p.item.type==='essence'&&p.item.color==='red'&&!redDropped){SR.stageBoss.drop(fx);redDropped=true;}break;
        case 'win':set(actors.hero,'win');petActors().forEach(function(a){set(a,'win');});fx.title('胜');break;
        case 'pets':pets();break;
      }
    }
    EVENTS.forEach(function(event){var fn=function(p){if(SR.offline&&SR.offline.simulating)return;commands(event,p).forEach(function(c){if(c.at)later(function(){run(c);},c.at);else run(c);});};if(SR.bus){SR.bus.on(event,fn);listeners.push([event,fn]);}});
    rings();pets();var api={el:el,fx:fx,actors:actors,trackFx:function(effect){extras.push(effect);},destroy:function(){dead=true;timers.forEach(clearTimeout);listeners.forEach(function(l){SR.bus.off(l[0],l[1]);});Object.keys(actors).forEach(remove);extras.forEach(function(e){e.destroy();});if(boss)boss.destroy();fx.destroy();el.replaceChildren();el.classList.remove('sr-stage');if(SR.stage.current===api)SR.stage.current=null;}};
    SR.stage.current=api;return api;
  }
  SR.stage={mount:mount,commands:commands,events:EVENTS,assetBase:typeof document!=='undefined'&&document.currentScript?new URL('../',document.currentScript.src).href:null};
})(typeof window!=='undefined'?window:globalThis);
