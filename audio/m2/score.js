(function(g){'use strict';
var SR=g.SR=g.SR||{}, scale=[0,2,4,7,9];
function note(degree,root){var octave=Math.floor(degree/5),index=((degree%5)+5)%5;return 440*Math.pow(2,((root===undefined?60:root)+octave*12+scale[index]-69)/12);}
var tracks={
 town:{bpm:68,root:60,melody:[0,2,4,3,2,1,0,-1,0,1,2,4,3,2,1,0,2,3,4,6,4,3,2,1,0,2,1,-1,0,1,0,0]},
 field:{bpm:88,root:62,melody:[0,2,3,4,6,4,3,2,1,3,4,6,7,6,4,3,2,4,6,7,6,4,3,1,0,1,3,2,1,-1,0,0]},
 boss:{bpm:124,root:57,melody:[0,0,3,4,5,4,3,2,0,3,4,6,5,4,3,0,5,5,7,6,4,3,2,0,3,4,6,7,5,3,2,0]}
};
function score(scene){var t=tracks[scene]||tracks.town,beat=60/t.bpm,events=[];
 t.melody.forEach(function(d,i){
  events.push({at:i*beat,frequency:note(d,t.root),duration:beat*0.85,instrument:'pluck',gain:0.2});
  if(i%2===0)events.push({at:i*beat+beat*0.06,frequency:note(t.melody[(i+4)%32]+5,t.root),duration:beat*1.65,instrument:'flute',gain:0.095});
  if(i%4===0)events.push({at:i*beat,frequency:note(-5+(i%8===0?0:3),t.root),duration:beat*1.6,instrument:'pluck',gain:0.14});
  if(i%(scene==='boss'?1:4)===0)events.push({at:i*beat,frequency:i%4===0?100:160,duration:0.23,instrument:'drum',gain:scene==='boss'?0.2:0.07});
 });
 events.sort(function(a,b){return a.at-b.at;});return {duration:32*beat,events:events};
}
// Half-open scheduling windows prevent duplicates at loop and timer boundaries.
function windowEvents(song,from,to){var out=[];if(!song||!Number.isFinite(from)||!Number.isFinite(to)||to<=from||song.duration<=0)return out;
 var first=Math.max(0,Math.floor(from/song.duration)),last=Math.floor(to/song.duration);
 for(var loop=first;loop<=last;loop++)song.events.forEach(function(e){var at=loop*song.duration+e.at;if(at>=from&&at<to)out.push({at:at,event:e});});
 return out.sort(function(a,b){return a.at-b.at;});
}
function quality(item){item=item||{};var colors=['white','yellow','purple','black','red'];
 if(colors.indexOf(item.color)>=0)return item.color;
 if(item.type==='essence'){var y=item.years||0;return colors[y<100?0:y<1000?1:y<10000?2:y<100000?3:4];}
 var q=item.quality===undefined?Math.floor((item.grade||0)/2):item.quality;
 return colors.indexOf(q)>=0?q:colors[Math.max(0,Math.min(4,Math.floor(Number(q)||0)))];
}
SR.audio2Score={note:note,score:score,windowEvents:windowEvents,quality:quality,scenes:['town','field','boss']};
})(typeof window!=='undefined'?window:globalThis);
