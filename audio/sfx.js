(function(g){
'use strict';
var SR=g.SR=g.SR||{},ctx=null,master=null,sfx=null,music=null,unlocked=false;
var volume=0.7,enabled=true,boundBus=null,voices=0;
function clamp(v){v=Number(v);return isFinite(v)?Math.max(0,Math.min(1,v)):0;}
function setup(){
 if(ctx)return true;
 var AC=g.AudioContext||g.webkitAudioContext;if(!AC)return false;
 try{ctx=new AC();master=ctx.createGain();master.gain.value=0.65;master.connect(ctx.destination);
 sfx=ctx.createGain();music=ctx.createGain();sfx.connect(master);music.connect(master);apply();return true;}
 catch(e){ctx=null;return false;}
}
function apply(){if(sfx)sfx.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,0.02);}
function tone(dest,f,t,d,v,type,end,attack){
 if(!ctx||voices>=48)return false;
 var o=ctx.createOscillator(),a=ctx.createGain();voices++;
 o.type=type||'sine';o.frequency.setValueAtTime(f,t);
 if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);
 a.gain.setValueAtTime(0.0001,t);a.gain.linearRampToValueAtTime(v,t+(attack||0.004));
 a.gain.exponentialRampToValueAtTime(0.0001,t+d);
 o.connect(a);a.connect(dest);o.onended=function(){o.disconnect();a.disconnect();voices--;};
 o.start(t);o.stop(t+d+0.02);return true;
}
function notes(seq,t,step,d,v){seq.forEach(function(n,i){tone(sfx,440*Math.pow(2,(n-69)/12),t+i*step,d,v,'triangle');});}
var recipes={
 attack:function(t){tone(sfx,1200,t,0.1,0.12,'triangle',140);tone(sfx,130,t,0.09,0.12,'sine',65);},
 skill:function(t){notes([69,74,76,81],t,0.045,0.3,0.09);},
 crit:function(t){tone(sfx,110,t,0.24,0.24,'sine',35);notes([81,88],t,0.025,0.18,0.12);},
 hit:function(t){tone(sfx,160,t,0.14,0.16,'triangle',45);},
 pickup:function(t){notes([81,88],t,0.07,0.25,0.09);},
 absorb_success:function(t){notes([62,64,69,74,76],t,0.1,0.65,0.09);},
 absorb_fail:function(t){notes([64,62,57],t,0.13,0.3,0.1);},
 levelup:function(t){notes([62,66,69,74,81],t,0.09,0.7,0.08);},
 click:function(t){tone(sfx,850,t,0.045,0.07,'sine',650);}
};
var last={};
function play(id){
 bindBus();if(!Object.prototype.hasOwnProperty.call(recipes,id)||!unlocked||!ctx||ctx.state!=='running'||!enabled||!volume||(g.document&&g.document.hidden))return false;
 var t=ctx.currentTime;if(last[id]!==undefined&&t-last[id]<0.04)return false;
 last[id]=t;recipes[id](t+0.005);return true;
}
function bindBus(){if(SR.bus&&SR.bus!==boundBus&&typeof SR.bus.on==='function'){
 if(boundBus&&typeof boundBus.off==='function')boundBus.off('sfx',onSfx);
 boundBus=SR.bus;boundBus.on('sfx',onSfx);
}}
function onSfx(p){if(p)play(p.id);}
function unlock(event){
 // Public calls without a trusted gesture cannot instantiate an AudioContext.
 if(!event||event.isTrusted!==true)return Promise.resolve(false);
 if(!setup())return Promise.resolve(false);
 return Promise.resolve(ctx.resume()).then(function(){unlocked=ctx.state==='running';
 if(unlocked&&SR.bgm)SR.bgm._wake();return unlocked;}).catch(function(){return false;});
}
SR.audio={play:play,unlock:unlock,bindBus:bindBus,ids:Object.keys(recipes),
 setVolume:function(v){volume=clamp(v);apply();},setEnabled:function(v){enabled=!!v;apply();},
 getVolume:function(){return volume;},isUnlocked:function(){return unlocked;},
 _engine:function(){return unlocked&&ctx?{ctx:ctx,music:music,tone:tone}:null;}};
bindBus();
if(g.document){['pointerdown','touchend','keydown'].forEach(function(n){g.document.addEventListener(n,unlock,{passive:true});});
 g.document.addEventListener('visibilitychange',function(){if(!ctx)return;
 if(g.document.hidden){if(SR.bgm)SR.bgm._sleep();Promise.resolve(ctx.suspend()).catch(function(){});}
 else if(unlocked)Promise.resolve(ctx.resume()).then(function(){if(SR.bgm)SR.bgm._wake();}).catch(function(){});
 });}
})(typeof window!=='undefined'?window:globalThis);
