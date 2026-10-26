(function(g){
  var SR=g.SR=g.SR||{}, memory={}, dirty=false, elapsed=0;
  var fallback={getItem:function(k){return memory[k]||null;},setItem:function(k,v){memory[k]=v;}};
  function storage(){try{return g.localStorage||fallback;}catch(e){return fallback;}}
  function defaults(){return {v:2,t:Date.now(),hero:{name:'',soulId:null,twin:false,level:1,exp:0,talent:5,rings:[],bones:{}},pets:[],team:{pets:[]},bag:[],store:[],bagCap:60,cur:{crystal:0,petSoul:0,pactCharm:0},map:{mapId:'forest',floor:1,wave:1,bestFloor:1},flags:{awakened:false},stats:{}};}
  function merge(base,input){Object.keys(base).forEach(function(k){if(input[k]===undefined)input[k]=base[k];else if(base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k])&&input[k]&&typeof input[k]==='object')merge(base[k],input[k]);});return input;}
  var api=SR.save={state:defaults(),migrations:{1:function(s){var map={head:'crown',body:'robe',larm:'bracer',rarm:'weapon',lleg:'skirt',rleg:'boots'};s.hero=s.hero||{};var old=s.hero.bones||{},out={};Object.keys(old).forEach(function(k){var item=old[k];if(item&&typeof item==='object'){item.slot=map[k]||k;out[item.slot]=item;}});s.hero.bones=out;(s.bag||[]).concat(s.store||[]).forEach(function(i){if(i.type==='gear')i.slot=map[i.slot]||i.slot;});s.v=2;return s;},0:function(s){s.v=1;return s;}},create:defaults,
    migrate:function(s){if(!s||typeof s!=='object'||Array.isArray(s))throw Error('invalid save');var v=s.v===undefined?0:s.v;if(v>2)throw Error('future save');while(v<2){if(!api.migrations[v])throw Error('missing migration');s=api.migrations[v](s);if(s.v<=v)throw Error('migration stalled');v=s.v;}return merge(defaults(),s);},
    load:function(){var raw=storage().getItem('sr_save_v1');try{api.state=raw?api.migrate(JSON.parse(raw)):defaults();api.lastError=null;}catch(e){api.lastError=e;api.state=defaults();}dirty=false;elapsed=0;SR.bus.emit('save:loaded',{state:api.state});return api.state;},
    save:function(){var previous=api.state.t;api.state.t=Date.now();try{storage().setItem('sr_save_v1',JSON.stringify(api.state));}catch(e){api.state.t=previous;api.lastError=e;dirty=true;return false;}dirty=false;elapsed=0;api.lastError=null;SR.bus.emit('save:saved',{t:api.state.t});return true;},
    markDirty:function(){dirty=true;},tick:function(dt){elapsed+=dt;if(dirty&&elapsed>=30000)api.save();},
    cloud:{push:function(){return Promise.reject(new Error('not configured'));},pull:function(){return Promise.reject(new Error('not configured'));}}
  };
  ['battle:wave_clear','battle:hero_down','ring:absorb_result','pet:changed','hero:changed','offline:reward'].forEach(function(n){SR.bus.on(n,function(){api.markDirty();if(!(SR.offline&&SR.offline.simulating))api.save();});});
})(typeof window!=='undefined'?window:globalThis);
