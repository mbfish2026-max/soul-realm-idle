(function(g){'use strict';
var S=g.SR=g.SR||{},P=S.progress={},installed=false;
function integer(n,lo,hi){return Math.max(lo,Math.min(hi,Math.floor(Number(n)||0)));}
function nodes(){return S.DATA.worldRegions.reduce(function(a,r){return a.concat(r.nodes);},[]);}
function state(s){return s||S.save.state;}
P.node=function(id){return nodes().find(function(n){return n.id===id;})||null;};
P.migrate=function(s){
 var all=nodes(),old=s.map||{},p=s.world;
 if(!p||p.v!==1){
  var group=['forest','snow','ridge'].indexOf(old.mapId);group=Math.max(0,group);
  var completed=group*16+Math.floor((integer(old.bestFloor||old.floor,1,5)-1)*16/5);
  var selected=group*16+Math.floor((integer(old.floor,1,5)-1)*16/5);
  if(s.flags&&s.flags.mapsCleared&&s.flags.mapsCleared.ridge)completed=48;
  p=s.world={v:1,cleared:completed,selected:all[Math.min(completed,selected)].id,wave:1,rewards:{}};
  // Historic unlocks are acknowledged without retroactively minting rewards.
  for(var r=0;r<6;r++)if(completed>=r*8)p.rewards[r]=true;
 }
 p.cleared=integer(p.cleared,0,all.length);p.wave=integer(p.wave,1,10);
 p.rewards=p.rewards&&typeof p.rewards==='object'?p.rewards:{};
 var n=P.node(p.selected);if(!n||n.index>p.cleared)p.selected=all[Math.min(p.cleared,all.length-1)].id;
 p.wave=Math.min(p.wave,P.node(p.selected).waves);return p;
};
P.frontier=function(s){var p=P.migrate(state(s));return nodes()[Math.min(p.cleared,47)];};
P.select=function(id,s){s=state(s);var p=P.migrate(s),n=P.node(id);if(!n||n.index>p.cleared)return false;p.selected=id;p.wave=1;return true;};
P.advance=function(s){s=state(s);return P.select(P.frontier(s).id,s);};
P.encounter=function(s){s=state(s);var p=P.migrate(s),n=P.node(p.selected),m=S.DATA.maps.find(function(m){return m.id===n.mapId;}),t=m.floorTables[n.floor-1];return {node:n,map:m,table:t,wave:p.wave,boss:n.boss&&p.wave===n.waves,eggPool:m.eggPool||['fox','turtle','hawk']};};
P.clearWave=function(s,config){
 s=state(s);var p=P.migrate(s),n=P.node(p.selected),c=config||s.auto||{};
 if(n.boss&&p.wave===n.waves&&!c.challengeBoss&&c.challengeBoss!==undefined)return {blocked:true};
 if(p.wave<n.waves){if(n.boss&&p.wave===n.waves-1&&c.challengeBoss===false)p.wave=1;else p.wave++;return {cleared:false};}
 var first=n.index===p.cleared;if(first)p.cleared++;p.wave=1;
 var reward=null,nextRegion=Math.floor(p.cleared/8);
 if(first&&p.cleared%8===0&&!p.rewards[nextRegion]){
  p.rewards[nextRegion]=true;reward={crystal:300*nextRegion,petSoul:30*nextRegion};s.cur=s.cur||{};
  Object.keys(reward).forEach(function(k){s.cur[k]=(Number(s.cur[k])||0)+reward[k];});
 }
 if(c.advance!==false)P.advance(s);
 return {cleared:true,first:first,nodeId:n.id,reward:reward,selected:p.selected};
};
P.install=function(){if(installed)return;installed=true;S.bus.on('save:loaded',function(e){P.migrate(e.state);});};
})(typeof window!=='undefined'?window:globalThis);
