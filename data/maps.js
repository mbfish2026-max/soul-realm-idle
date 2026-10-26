(function(g){
  var SR=g.SR=g.SR||{};SR.DATA=SR.DATA||{};
  var tables=[];for(var f=1;f<=5;f++){
    var range=[[10,160],[80,420],[180,850],[400,1600],[800,3800]][f-1],scale=Math.pow(1.65,f-1);
    tables.push({floor:f,monsters:[{kind:'reed',name:SR.NAMES.coreMobs.reed,hp:Math.round(110*scale),atk:Math.round(5*scale),yearsRange:range,weight:3},{kind:'moss',name:SR.NAMES.coreMobs.moss,hp:Math.round(145*scale),atk:Math.round(6*scale),yearsRange:range,weight:2}],boss:{kind:'lord',name:SR.NAMES.coreMobs.lord,hp:Math.round(580*scale),atk:Math.round(11*scale),yearsRange:[range[1],Math.round(range[1]*1.3)],weight:1},recPower:Math.round(70*scale)});
  }
  SR.DATA.maps=[{id:'forest',name:SR.NAMES.maps.forest,floors:5,waves:10,monsters:tables[0].monsters,boss:tables[0].boss,recPower:70,floorTables:tables}];
})(typeof window!=='undefined'?window:globalThis);
