(function(g){
'use strict';
var SR=g.SR=g.SR||{},enabled=false,volume=0.3,timer=null,next=0,beat=0;
// Original D pentatonic phrase, eighth-note plucks under a sparse flute melody.
var scale=[0,2,4,7,9],phrase=[0,2,3,4,3,2,1,null,2,3,5,4,3,1,0,null];
function freq(degree,oct){return 440*Math.pow(2,(62+scale[degree%5]+12*(Math.floor(degree/5)+(oct||0))-69)/12);}
function engine(){return SR.audio&&SR.audio._engine();}
function gain(e){e.music.gain.setTargetAtTime(enabled?volume:0,e.ctx.currentTime,0.04);}
function schedule(){
 var e=engine();if(!e||!enabled||e.ctx.state!=='running')return;
 while(next<e.ctx.currentTime+0.22){
 var n=phrase[beat%phrase.length];
 if(n!==null){e.tone(e.music,freq(n),next,0.85,0.11,'triangle');e.tone(e.music,freq(n)*2,next,0.35,0.025,'sine');}
 if(beat%4===0)e.tone(e.music,freq([3,2,1,0][Math.floor(beat/4)%4],1),next,1.4,0.07,'sine',null,0.12);
 next+=60/72/2;beat++;
 }
}
function sleep(){if(timer!==null){g.clearInterval(timer);timer=null;}}
function wake(){var e=engine();if(!e)return;gain(e);if(!enabled||(g.document&&g.document.hidden))return;
 if(timer!==null)return;next=e.ctx.currentTime+0.04;schedule();timer=g.setInterval(schedule,100);}
SR.bgm={setEnabled:function(v){enabled=!!v;var e=engine();if(e)gain(e);if(enabled)wake();else sleep();},
 setVolume:function(v){v=Number(v);volume=isFinite(v)?Math.max(0,Math.min(1,v)):0;var e=engine();if(e)gain(e);},
 getVolume:function(){return volume;},isEnabled:function(){return enabled;},_wake:wake,_sleep:sleep};
})(typeof window!=='undefined'?window:globalThis);
