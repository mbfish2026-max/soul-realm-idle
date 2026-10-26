'use strict';
var assert=require('assert'),vm=require('vm'),fs=require('fs');
function target(){var events={};return {hidden:false,addEventListener:function(n,f){(events[n]||(events[n]=[])).push(f);},removeEventListener:function(n,f){events[n]=(events[n]||[]).filter(function(x){return x!==f;});},fire:function(n,p){(events[n]||[]).slice().forEach(function(f){f(p||{});});},count:function(n){return (events[n]||[]).length;}};}
var document=target(),global=target(),contexts=[],intervals=new Set(),stored={},starts=[];
function param(){return {value:1,cancelScheduledValues:function(){},setValueAtTime:function(v){this.value=v;},linearRampToValueAtTime:function(v){this.value=v;},exponentialRampToValueAtTime:function(v){assert(v>0);this.value=v;}};}
function node(){return {gain:param(),frequency:param(),connect:function(){},disconnect:function(){},start:function(t){assert(t>=0);starts.push(t);},stop:function(){}};}
function Context(){this.currentTime=0;this.state='suspended';this.destination=node();contexts.push(this);}
Context.prototype.createGain=Context.prototype.createOscillator=Context.prototype.createBiquadFilter=node;
Context.prototype.resume=function(){this.state='running';return Promise.resolve();};Context.prototype.suspend=function(){this.state='suspended';return Promise.resolve();};Context.prototype.close=function(){this.state='closed';return Promise.resolve();};
Object.assign(global,{document:document,AudioContext:Context,localStorage:{getItem:function(k){return stored[k]||null;},setItem:function(k,v){stored[k]=v;}},setInterval:function(f){intervals.add(f);return f;},clearInterval:function(f){intervals.delete(f);},console:console});global.globalThis=global;
vm.createContext(global);['core/bus.js','audio/m2/score.js','audio/m2/audio.js'].forEach(function(f){vm.runInContext(fs.readFileSync(f,'utf8'),global);});
(async function(){var a=global.SR.audio2,b=global.SR.bus;
 a.install();a.install();assert.strictEqual(document.count('pointerdown'),1);assert.strictEqual(contexts.length,0);assert.strictEqual(a.play('ui_click'),false);
 await a.unlock();assert.strictEqual(contexts.length,1);assert.strictEqual(intervals.size,1);assert(starts.length>0);
 b.emit('battle:wave_start',{enemies:[{isBoss:true}]});assert.strictEqual(a.getScene(),'boss');b.emit('battle:wave_start',{enemies:[]});assert.strictEqual(a.getScene(),'field');assert.strictEqual(a.setScene('bad'),false);
 ['skill_wind','skill_fire','skill_earth','skill_moon','pet_attack','boss_warning','absorb_success','absorb_fail','level_up','drop_white','drop_yellow','drop_purple','drop_black','drop_red','ui_click'].forEach(function(id){contexts[0].currentTime+=1;assert.strictEqual(a.play(id),true);assert.strictEqual(a.play(id),false);});assert.strictEqual(a.play('unknown'),false);
 global.SR.DATA={skills:{moon:{vein:'moon'}}};global.SR.save={state:{hero:{level:1}}};b.emit('save:loaded',{state:global.SR.save.state});global.SR.save.state.hero.level=2;contexts[0].currentTime+=1;b.emit('hero:changed',{});
 b.emit('battle:skill',{caster:{side:'pet'},skillId:'moon'});b.emit('ring:absorb_result',{ok:true});b.emit('loot:drop',{item:{color:'red'}});
 global.SR.offline={claiming:true,simulating:true};b.emit('offline:status',{claiming:true});
 var before=starts.length,scene=a.getScene();assert.strictEqual(intervals.size,0);
 b.emit('battle:wave_start',{enemies:[{isBoss:true}]});b.emit('battle:kill',{isBoss:true});b.emit('battle:hero_down',{});
 b.emit('battle:attack',{src:{side:'hero'}});b.emit('battle:skill',{caster:{side:'pet'},skillId:'moon'});b.emit('loot:drop',{item:{color:'red'}});
 assert.strictEqual(starts.length,before);assert.strictEqual(a.getScene(),scene);assert.strictEqual(a.play('fusion'),false);
 global.SR.offline.claiming=false;global.SR.offline.simulating=false;global.SR.battle={snapshot:function(){return {enemies:[{isBoss:true}]};}};b.emit('offline:status',{claiming:false});
 assert.strictEqual(a.getScene(),'boss');assert.strictEqual(intervals.size,1);contexts[0].currentTime+=1;assert.strictEqual(a.play('attack'),true);a.setScene('field');
 a.setSettings({master:9,music:-1,sfx:NaN,muted:true});assert.strictEqual(a.getSettings().master,1);assert.strictEqual(a.getSettings().music,0);assert.strictEqual(a.getSettings().sfx,0.8);assert(JSON.parse(stored.sr_audio2_v1).muted);assert.strictEqual(intervals.size,0);
 a.setSettings({music:0.5,muted:false});assert.strictEqual(intervals.size,1);
 document.hidden=true;document.fire('visibilitychange');assert.strictEqual(intervals.size,0);assert.strictEqual(contexts[0].state,'suspended');assert.strictEqual(a.play('ui_click'),false);
 document.hidden=false;document.fire('visibilitychange');await Promise.resolve();assert.strictEqual(intervals.size,1);
 global.fire('pagehide');assert.strictEqual(intervals.size,0);global.fire('pageshow');await Promise.resolve();assert.strictEqual(intervals.size,1);
 a.uninstall();assert.strictEqual(contexts[0].state,'closed');assert.strictEqual(document.count('pointerdown'),0);assert.strictEqual(intervals.size,0);b.emit('battle:wave_start',{enemies:[{isBoss:true}]});assert.strictEqual(a.getScene(),'field');
 var legacy=0;a.install({legacy:{uninstall:function(){legacy++;}}});assert.strictEqual(legacy,1);await a.unlock();assert.strictEqual(contexts.length,2);a.uninstall();
 global.localStorage.setItem=function(){throw Error('blocked');};a.setSettings({sfx:0.3});assert.strictEqual(a.getSettings().sfx,0.3);
 console.log('audio_m2_runtime: ok');
})().catch(function(e){console.error(e);process.exit(1);});
