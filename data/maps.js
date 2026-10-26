(function(g){
  var SR=g.SR=g.SR||{};SR.DATA=SR.DATA||{};
  var tables=[];for(var f=1;f<=5;f++){
    var range=[[10,160],[80,420],[180,850],[400,1600],[800,3800]][f-1],scale=Math.pow(1.65,f-1);
    tables.push({floor:f,monsters:[{kind:'reed',name:SR.NAMES.coreMobs.reed,hp:Math.round(110*scale),atk:Math.round(5*scale),yearsRange:range,weight:3},{kind:'moss',name:SR.NAMES.coreMobs.moss,hp:Math.round(145*scale),atk:Math.round(6*scale),yearsRange:range,weight:2}],boss:{kind:'lord',name:SR.NAMES.coreMobs.lord,hp:Math.round(580*scale),atk:Math.round(11*scale),yearsRange:[range[1],Math.round(range[1]*1.3)],weight:1},recPower:Math.round(70*scale)});
  }
  SR.DATA.maps=[{id:'forest',name:SR.NAMES.maps.forest,floors:5,waves:10,monsters:tables[0].monsters,boss:tables[0].boss,recPower:70,floorTables:tables}];
})(typeof window!=='undefined'?window:globalThis);

/* World map is an additive view over the calibrated fifteen battle floors.
 * Build after content.install(), leaving original map tables and balance intact. */
(function(g){'use strict';var S=g.SR;
S.buildWorldMap=function(){var N=S.NAMES.worldMap,regions=[];
for(var r=0;r<6;r++){
 var region={id:'region-'+r,name:N.regions[r],art:'assets/map/region-'+r+'.webp',reward:{crystal:300*(r+1),petSoul:30*(r+1)},nodes:[]};
 for(var j=0;j<8;j++){
  var i=r*8+j,group=Math.floor(r/2),mapId=['forest','snow','ridge'][group],floor=Math.min(5,Math.floor((i%16)*5/16)+1),m=S.DATA.maps.find(function(m){return m.id===mapId;});
  if(!m)throw new Error('world map requires installed content maps');
  var t=m.floorTables[floor-1],boss=j===7,range=(boss?t.boss:t.monsters[0]).yearsRange;
  region.nodes.push({id:'node-'+i,index:i,region:r,position:j,name:region.name+'·'+N.nodes[j],mapId:mapId,floor:floor,waves:boss?10:5,boss:boss,elite:j===3||j===6,recPower:t.recPower,yearsRange:range.slice(),drops:{yearsRange:range.slice(),colors:[range[0],range[1]].map(function(y){return y<100?'white':y<1000?'yellow':y<10000?'purple':y<100000?'black':'red';}),gear:true,eggPool:(m.eggPool||['fox','turtle','hawk']).slice(),mat:true}});
 }
 regions.push(region);
}S.DATA.worldRegions=regions;return regions;};
})(typeof window!=='undefined'?window:globalThis);
