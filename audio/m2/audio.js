(function(g){'use strict';
var SR=g.SR=g.SR||{}, P=SR.audio2Score, ctx,master,music,fx, timer=null,installed=false,unlocked=false;
var scene='town',voices=[],layers=[],listeners=[],dom=[],last=Object.create(null),level=null,closing=null;
var config={master:0.7,music:0.55,sfx:0.8,muted:false},KEY='sr_audio2_v1';
function settings(p){p=p||{};['master','music','sfx'].forEach(function(k){if(typeof p[k]==='number'&&Number.isFinite(p[k]))config[k]=Math.max(0,Math.min(1,p[k]));});if(typeof p.muted==='boolean')config.muted=p.muted;return api.getSettings();}
try{settings(JSON.parse(g.localStorage.getItem(KEY)));}catch(ignore){}
function replay(){return SR.offline&&(SR.offline.simulating||SR.offline.claiming);}
function hidden(){return !!(g.document&&g.document.hidden);}
function ramp(param,value,time){param.cancelScheduledValues(ctx.currentTime);param.setValueAtTime(param.value,ctx.currentTime);param.linearRampToValueAtTime(value,ctx.currentTime+(time||0.04));}
function volumes(){if(!ctx)return;ramp(master.gain,config.muted?0:config.master);ramp(music.gain,config.music);ramp(fx.gain,config.sfx);}
function listen(el,event,fn){el.addEventListener(event,fn);dom.push(function(){el.removeEventListener(event,fn);});}
function on(event,fn){SR.bus.on(event,fn);listeners.push(function(){SR.bus.off(event,fn);});}
function voice(freq,at,duration,instrument,gain,target){
 if(voices.length>=96)return;
 var osc=ctx.createOscillator(),amp=ctx.createGain(),nodes=[osc,amp],filter;
 osc.type=instrument==='pluck'?'triangle':'sine';osc.frequency.setValueAtTime(freq,at);
 if(instrument==='drum')osc.frequency.exponentialRampToValueAtTime(42,at+duration);
 if(instrument==='flute'){
  filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;osc.connect(filter);filter.connect(amp);nodes.push(filter);
  var vibrato=ctx.createOscillator(),depth=ctx.createGain();vibrato.frequency.value=5;depth.gain.value=freq*0.004;vibrato.connect(depth);depth.connect(osc.frequency);vibrato.start(at);vibrato.stop(at+duration+0.03);nodes.push(vibrato,depth);
 }else osc.connect(amp);
 amp.connect(target);amp.gain.setValueAtTime(0.0001,at);
 amp.gain.exponentialRampToValueAtTime(Math.max(0.0002,gain),at+(instrument==='flute'?0.06:0.008));
 amp.gain.exponentialRampToValueAtTime(0.0001,at+duration);
 var record={osc:osc,nodes:nodes};voices.push(record);
 osc.onended=function(){nodes.forEach(function(n){n.disconnect();});var i=voices.indexOf(record);if(i>=0)voices.splice(i,1);};
 osc.start(at);osc.stop(at+duration+0.03);
}
function stopVoices(){voices.slice().forEach(function(v){v.nodes.forEach(function(n){if(n.stop)try{n.stop();}catch(ignore){}n.disconnect();});});voices=[];}
function clearLayers(){layers.forEach(function(l){l.gain.disconnect();});layers=[];}
function activeMusic(){return installed&&unlocked&&ctx&&ctx.state==='running'&&!hidden()&&!replay()&&!config.muted&&config.master>0&&config.music>0;}
function newLayer(){var gain=ctx.createGain(),now=ctx.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+0.8);gain.connect(music);layers.push({gain:gain,song:P.score(scene),start:now+0.03,cursor:0,end:Infinity});}
function pump(){
 if(!activeMusic())return;
 var now=ctx.currentTime;if(!layers.length)newLayer();
 layers=layers.filter(function(l){if(now>=l.end){l.gain.disconnect();return false;}var until=Math.min(now+0.18,l.end)-l.start;
 P.windowEvents(l.song,Math.max(l.cursor,now-l.start),until).forEach(function(x){var e=x.event;voice(e.frequency,l.start+x.at,e.duration,e.instrument,e.gain,l.gain);});l.cursor=until;return true;});
}
function startTimer(){if(timer===null&&activeMusic()){pump();timer=g.setInterval(pump,70);}}
function stopTimer(){if(timer!==null)g.clearInterval(timer);timer=null;}
function suspend(){stopTimer();stopVoices();clearLayers();last=Object.create(null);if(ctx&&ctx.state!=='closed')ctx.suspend().catch(function(){});}
function unlock(){
 if(!installed||hidden())return Promise.resolve(false);
 if(!ctx){var C=g.AudioContext||g.webkitAudioContext;if(!C)return Promise.resolve(false);
  try{ctx=new C();master=ctx.createGain();music=ctx.createGain();fx=ctx.createGain();music.connect(master);fx.connect(master);master.connect(ctx.destination);volumes();ctx.onstatechange=function(){if(ctx.state==='running')startTimer();else stopTimer();};}catch(ignore){return Promise.resolve(false);}}
 return ctx.resume().then(function(){if(!installed||hidden()){suspend();return false;}unlocked=true;startTimer();return true;},function(){return false;});
}
var aliases={click:'ui_click',attack:'skill_wind',skill:'skill_wind',pet:'pet_attack',boss:'boss_warning',absorb:'absorb_success',upgrade:'level_up'};
function play(id){
 id=aliases[id]||id;if(replay()&&id!=='ui_click')return false;if(!installed||!unlocked||!ctx||ctx.state!=='running'||hidden()||config.muted||config.master===0||config.sfx===0)return false;
 var now=ctx.currentTime;if(last[id]!==undefined&&now-last[id]<0.09)return false;
 var tones={ui_click:[9],skill_wind:[5,8,10],skill_fire:[-3,0,4],skill_earth:[-8,-5,-3],skill_moon:[7,9,12],pet_attack:[2,5],boss_warning:[-5,-5,-5],absorb_success:[0,2,4,5,7],absorb_fail:[2,0,-3],level_up:[0,2,4,7,9],fusion:[0,4,7,10]};
 var notes=tones[id],drop=/^drop_(white|yellow|purple|black|red)$/.exec(id);
 if(drop)notes=[0,2,4,7,9].slice(0,['white','yellow','purple','black','red'].indexOf(drop[1])+1);
 if(!notes)return false;last[id]=now;
 notes.forEach(function(n,i){var drum=id==='skill_earth'||id==='boss_warning';voice(P.note(n,id==='skill_fire'?55:67),now+0.005+i*(drum?0.15:0.075),id==='ui_click'?0.055:drum?0.22:0.25,drum?'drum':id==='skill_wind'?'flute':'pluck',id==='ui_click'?0.08:0.16,fx);});return true;
}
function heroLevel(state,silent){var n=state&&state.hero&&state.hero.level;if(typeof n==='number'){if(!silent&&level!==null&&n>level)play('level_up');level=n;}}
function skill(p){var sk=SR.DATA&&SR.DATA.skills&&SR.DATA.skills[p.skillId],v=sk&&sk.vein;play('skill_'+({wind:'wind',fire:'fire',earth:'earth',moon:'moon'}[v]||'wind'));}
var api=SR.audio2={
 install:function(options){if(installed)return api;if(!SR.bus||!P)throw new Error('audio2 requires bus and score');options=options||{};
  if(options.legacy){if(typeof options.legacy.uninstall!=='function')throw new Error('legacy audio requires uninstall');options.legacy.uninstall();}
  installed=true;heroLevel(SR.save&&SR.save.state,true);
  on('offline:status',function(p){if(p.claiming){stopTimer();stopVoices();clearLayers();}else {var snap=SR.battle&&SR.battle.snapshot();api.setScene(snap&&snap.enemies&&snap.enemies.some(function(e){return e.isBoss;})?'boss':'field');startTimer();}});
  on('sfx',function(p){if(p)play(p.id);});
  on('battle:wave_start',function(p){api.setScene((p.enemies||[]).some(function(e){return e.isBoss;})?'boss':'field');});
  on('battle:skill',function(p){if(p.caster&&p.caster.side==='enemy')return;skill(p);if(p.caster&&p.caster.side==='pet')play('pet_attack');});
  on('battle:attack',function(p){if(p.skillId)return;if(p.src&&p.src.side==='pet')play('pet_attack');else if(p.src&&p.src.side==='hero')play('attack');});
  on('battle:boss_phase',function(p){if(p.warn)play('boss_warning');});
  on('battle:fusion',function(){play('fusion');});
  on('battle:hero_down',function(){api.setScene('town');});
  on('battle:kill',function(p){if(p.isBoss)api.setScene('field');});
  on('ring:absorb_result',function(p){play(p.ok?'absorb_success':'absorb_fail');});
  on('loot:drop',function(p){play('drop_'+P.quality(p.item));});
  on('save:loaded',function(p){heroLevel(p.state,true);});
  on('hero:changed',function(){heroLevel(SR.save&&SR.save.state,false);});
  if(g.document){['pointerdown','touchend','keydown'].forEach(function(e){listen(g.document,e,unlock);});
   listen(g.document,'visibilitychange',function(){if(hidden())suspend();else if(unlocked)unlock();});
   listen(g.document,'click',function(e){if(e.target&&e.target.closest&&e.target.closest('button,[role="button"]'))play('ui_click');});
   listen(g,'pagehide',suspend);listen(g,'pageshow',function(){if(unlocked)unlock();});}
  return api;
 },
 unlock:unlock,play:play,
 setScene:function(next){if(replay())return false;if(P.scenes.indexOf(next)<0)return false;if(scene===next)return true;scene=next;if(activeMusic()){
  var now=ctx.currentTime;layers.forEach(function(l){ramp(l.gain.gain,0,0.8);l.end=Math.min(l.end,now+0.8);});newLayer();pump();}return true;},
 getScene:function(){return scene;},getSettings:function(){return {master:config.master,music:config.music,sfx:config.sfx,muted:config.muted};},
 setSettings:function(p){settings(p);try{g.localStorage.setItem(KEY,JSON.stringify(config));}catch(ignore){}volumes();if(!activeMusic()){stopTimer();clearLayers();}else startTimer();return api.getSettings();},
 uninstall:function(){installed=false;listeners.splice(0).forEach(function(f){f();});dom.splice(0).forEach(function(f){f();});stopTimer();stopVoices();clearLayers();if(closing)closing();if(ctx){ctx.onstatechange=null;ctx.close().catch(function(){});}ctx=null;unlocked=false;last=Object.create(null);return api;}
};
api.mountSettings=function(el){
 var doc=el.ownerDocument;el.textContent='';el.style.cssText='display:grid;gap:18px;color:#304f44;font:16px sans-serif;max-width:100%;';
 ['master','music','sfx'].forEach(function(k,i){var label=doc.createElement('label'),input=doc.createElement('input');label.textContent=['总音量','音乐','音效'][i];input.type='range';input.min='0';input.max='1';input.step='0.01';input.value=config[k];input.setAttribute('aria-label',label.textContent);input.style.cssText='display:block;width:100%;accent-color:#527b65';input.addEventListener('input',function(){var p={};p[k]=Number(input.value);api.setSettings(p);});label.appendChild(input);el.appendChild(label);});
 var label=doc.createElement('label'),mute=doc.createElement('input');mute.type='checkbox';mute.checked=config.muted;mute.addEventListener('change',function(){api.setSettings({muted:mute.checked});});label.appendChild(mute);label.appendChild(doc.createTextNode('静音'));el.appendChild(label);return el;
};
api.openSettings=function(){
 if(!g.document)return;if(closing)closing();var d=g.document,previous=d.activeElement,overlay=d.createElement('div'),box=d.createElement('section'),close=d.createElement('button'),title=d.createElement('h2'),content=d.createElement('div');
 overlay.className='sr-overlay';overlay.style.zIndex='10000';
 box.className='sr-dialog';
 box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','声音设置');title.textContent='声音设置';title.style.cssText='margin:0 0 24px;color:#304f44;font-size:21px;';close.textContent='完成';close.style.cssText='margin-top:24px;width:100%;min-height:44px;font-size:16px;';
 api.mountSettings(content);box.appendChild(title);box.appendChild(content);box.appendChild(close);overlay.appendChild(box);d.body.appendChild(overlay);
 function finish(){overlay.remove();d.removeEventListener('keydown',key);closing=null;if(previous&&previous.focus)previous.focus();}
 function key(e){if(e.key==='Escape')finish();if(e.key==='Tab'){var all=box.querySelectorAll('input,button'),first=all[0],last=all[all.length-1];if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}}}
 close.addEventListener('click',finish);overlay.addEventListener('click',function(e){if(e.target===overlay)finish();});d.addEventListener('keydown',key);closing=finish;content.querySelector('input').focus();
};
})(typeof window!=='undefined'?window:globalThis);
