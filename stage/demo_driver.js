(function(g){
  'use strict';var SR=g.SR=g.SR||{},handlers={};
  if(!SR.bus)SR.bus={on:function(n,f){(handlers[n]=handlers[n]||[]).push(f);},off:function(n,f){handlers[n]=(handlers[n]||[]).filter(function(x){return x!==f;});},emit:function(n,p){(handlers[n]||[]).slice().forEach(function(f){f(p);});}};
  if(!SR.rng){var seed=7;SR.rng=function(){seed=seed*16807%2147483647;return seed/2147483647;};}
  // Local fake state belongs only to this standalone demo, never loaded in the game.
  SR.save=SR.save||{state:{hero:{rings:['white','yellow','purple','black','red'].map(function(color){return {color:color};})},team:{pets:['demo-fox']}}};
  var view=null,absorb=null,timers=[],root=document.getElementById('stage'),log=document.getElementById('log');
  document.getElementById('heading').textContent=SR.NAMES.game+' · 战斗';
  function later(fn,ms){timers.push(setTimeout(fn,ms));}
  function emit(n,p){SR.bus.emit(n,p);}
  function line(text){var p=document.createElement('p');p.textContent='◆ '+text;log.prepend(p);while(log.children.length>4)log.lastChild.remove();}
  function wave(boss){emit('battle:wave_start',{mapId:'forest',floor:3,wave:boss?10:7,waveMax:10,enemies:boss?[{uid:'lord',kind:'demo',name:SR.NAMES.beastLord,hp:200000,hpMax:200000,years:100000,isBoss:true}]:[0,1,2].map(function(i){return {uid:'enemy'+i,kind:'demo',name:SR.NAMES.beast,hp:5200,hpMax:5200,years:i?320:1734,isBoss:false};})});}
  function skill(){emit('battle:skill',{caster:{side:'hero',uid:'hero'},skillId:'demo',ringIndex:2,name:SR.NAMES.ringSkill});emit('battle:attack',{src:{side:'hero',uid:'hero'},dst:{side:'enemy',uid:'enemy0'},dmg:1268,crit:true,skillId:'demo',ringIndex:2});later(function(){emit('battle:hp',{side:'enemy',uid:'enemy0',hp:3932,hpMax:5200});line(SR.NAMES.ringSkill+' · 暴击 1,268');},480);later(function(){emit('battle:attack',{src:{side:'pet',uid:'demo-fox'},dst:{side:'enemy',uid:'enemy1'},dmg:620,crit:false,skillId:null,ringIndex:null});line(SR.NAMES.pet+' · 追击 620');},440);}
  function scene(name,ok){timers.forEach(clearTimeout);timers=[];if(absorb)absorb.destroy();if(view)view.destroy();log.replaceChildren();view=SR.stage.mount(root);wave(name==='boss');line(SR.NAMES.maps.forest+' · '+(name==='boss'?SR.NAMES.beastLord:SR.NAMES.beast));
    if(name==='regular')later(skill,150);
    if(name==='boss')later(function(){emit('battle:hp',{side:'enemy',uid:'lord',hp:128000,hpMax:200000});emit('battle:boss_phase',{uid:'lord',phase:2,warn:{name:SR.NAMES.beastLord+' · 蓄势',delayMs:3000}});line('阶段贰 · 3 秒预警');},150);
    if(name==='fusion')later(function(){emit('battle:fusion',{heroUid:'hero',petUid:'demo-fox',name:SR.NAMES.resonance});later(function(){[0,1,2].forEach(function(i){emit('battle:attack',{src:{side:'hero',uid:'hero'},dst:{side:'enemy',uid:'enemy'+i},dmg:3567+i*411,crit:true,skillId:'fusion'});});line(SR.NAMES.resonance+' · 人宠同时出手');},160);},150);
    if(name==='absorb'){view.actors.enemy0.set('die');absorb=SR.stageFx.absorb({color:'purple',ok:ok!==false});line(SR.NAMES.soulRing+' · '+SR.NAMES.ringColors.purple+' · 吸收');}
    return view;
  }
  document.querySelectorAll('[data-scene]').forEach(function(b){b.addEventListener('click',function(){scene(b.dataset.scene);});});
  root.addEventListener('click',function(e){if(e.target===root||e.target.classList.contains('sr-background')){if(absorb)absorb.destroy();}});
  g.STAGE_DEMO={scene:scene,emit:emit,get view(){return view;}};scene('regular');
})(window);
