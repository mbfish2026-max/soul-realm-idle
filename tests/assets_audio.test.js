'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
function sandbox(withBus){
 const listeners={},subs={},scheduled=[],nodes=[],timers=new Set();let contexts=0;
 const param=()=>({value:1,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 class AC{constructor(){contexts++;this.currentTime=0;this.state='suspended';this.destination={};}
 createGain(){const n={gain:param(),connect(){},disconnect(){n.disconnected=true;}};nodes.push(n);return n;}
 createOscillator(){const n={frequency:param(),connect(){},disconnect(){n.disconnected=true;},start(t){assert(t>=0);},stop(t){scheduled.push({n,t});}};nodes.push(n);return n;}
 resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
 const c={Promise,AudioContext:AC,SR:{},document:{hidden:false,addEventListener(n,f){listeners[n]=f;}},setInterval(f){timers.add(f);return f;},clearInterval(f){timers.delete(f);}};
 if(withBus)c.SR.bus={on(n,f){subs[n]=f;},off(n){delete subs[n];}};
 vm.createContext(c);['sfx','bgm'].forEach(n=>vm.runInContext(fs.readFileSync('audio/'+n+'.js','utf8'),c));
 return {c,listeners,subs,scheduled,nodes,timers,get contexts(){return contexts;}};
}
(async()=>{
 const s=sandbox(true),a=s.c.SR.audio,b=s.c.SR.bgm;
 assert.strictEqual(a.play('attack'),false);assert.strictEqual(await a.unlock(),false);assert.strictEqual(s.contexts,0);
 assert.strictEqual(await a.unlock({isTrusted:true}),true);assert.strictEqual(s.contexts,1);
 for(const id of a.ids)assert.strictEqual(a.play(id),true,id);
 assert.strictEqual(a.play('attack'),false,'throttle');assert.strictEqual(a.play('__proto__'),false);
 a.setEnabled(false);assert.strictEqual(a.play('skill'),false);a.setEnabled(true);
 a.setVolume(NaN);assert.strictEqual(a.getVolume(),0);a.setVolume(2);assert.strictEqual(a.getVolume(),1);
 b.setEnabled(true);assert.strictEqual(s.timers.size,1);b.setEnabled(true);assert.strictEqual(s.timers.size,1);
 b.setVolume(-2);assert.strictEqual(b.getVolume(),0);b.setEnabled(false);assert.strictEqual(s.timers.size,0);
 b.setEnabled(true);s.c.document.hidden=true;s.listeners.visibilitychange();assert.strictEqual(s.timers.size,0);
 s.c.document.hidden=false;s.listeners.visibilitychange();await Promise.resolve();assert.strictEqual(s.timers.size,1);
 b.setEnabled(false);s.scheduled.forEach(x=>x.n.onended());assert(s.scheduled.every(x=>x.n.disconnected));
 const late=sandbox(false);late.c.SR.bus={on(n,f){late.subs[n]=f;}};late.c.SR.audio.bindBus();assert(late.subs.sfx);
 await late.c.SR.audio.unlock({isTrusted:true});late.subs.sfx({id:'hit'});assert(late.scheduled.length>0);
 const unsupported={SR:{}};vm.createContext(unsupported);vm.runInContext(fs.readFileSync('audio/sfx.js','utf8'),unsupported);assert.strictEqual(unsupported.SR.audio.play('click'),false);
 console.log('assets_audio: passed');
})().catch(e=>{console.error(e);process.exit(1);});
