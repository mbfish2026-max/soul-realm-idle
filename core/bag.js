(function(g){
  var SR=g.SR=g.SR||{}, seq=0;
  function list(where){return SR.save.state[where==='store'?'store':'bag'];}
  function value(item){return Math.max(1,Math.floor((item.years||10)/10)+(item.quality||0)*10);}
  SR.bag={
    uid:function(){var s=SR.save.state;s.stats.itemSeq=Math.max(s.stats.itemSeq||0,seq)+1;seq=s.stats.itemSeq;return 'item-'+seq;},
    value:value,
    storeCap:1000,
    full:function(){return SR.save.state.store.length>=SR.bag.storeCap-9;},
    capacityStatus:function(){return {paused:SR.bag.full(),count:SR.save.state.store.length,capacity:SR.bag.storeCap};},
    add:function(item,where){var s=SR.save.state,a=list(where);if(!item.uid)item.uid=SR.bag.uid();if(s.bag.concat(s.store).some(function(x){return x.uid===item.uid;}))return false;if(where!=='store'&&a.length>=s.bagCap){s.cur.crystal+=value(item);SR.save.markDirty();return false;}a.push(item);SR.save.markDirty();return item;},
    remove:function(uid,where){var a=list(where),i=a.findIndex(function(x){return x.uid===uid;});if(i<0||a[i].locked)return false;SR.save.markDirty();return a.splice(i,1)[0];},
    move:function(uid,from,to){if((from!=='bag'&&from!=='store')||(to!=='bag'&&to!=='store')||from===to)return false;var a=list(from),item=a.find(function(x){return x.uid===uid;});if(!item||to==='bag'&&list(to).length>=SR.save.state.bagCap)return false;a.splice(a.indexOf(item),1);list(to).push(item);SR.save.markDirty();return true;},
    sort:function(where){list(where).sort(function(a,b){return a.type.localeCompare(b.type)||(b.years||b.quality||0)-(a.years||a.quality||0)||a.uid.localeCompare(b.uid);});SR.save.markDirty();},
    lock:function(uid,locked,where){var item=list(where).find(function(x){return x.uid===uid;});if(!item)return false;item.locked=locked===undefined?!item.locked:!!locked;SR.save.markDirty();return true;},
    dismantle:function(uid,where){var item=SR.bag.remove(uid,where);if(!item)return false;var n=value(item);SR.save.state.cur.crystal+=n;return n;}
  };
})(typeof window!=='undefined'?window:globalThis);

/* BAG: derived grid helpers; no new save fields. */
(function(g){'use strict';var S=g.SR,B=S.bag,types=['gear','essence','egg','mat'];
B.category=function(item){return types.indexOf(item.type)>=0?item.type:'mat';};
B.quality=function(e){return e.type==='essence'?(e.years<100?0:e.years<1000?1:e.years<10000?2:e.years<100000?3:4):Math.max(0,Math.min(4,Math.floor(Number(e.quality===undefined?e.grade:e.quality)||0)));};
B.slots=function(where){var s=S.save.state,a=s[where==='store'?'store':'bag'],cap=where==='store'?B.storeCap:s.bagCap;return {used:a.length,total:cap,free:Math.max(0,cap-a.length),full:a.length>=cap};};
B.query=function(where,filter,sort){return S.save.state[where==='store'?'store':'bag'].map(function(e,i){return {e:e,i:i};}).filter(function(x){return !filter||filter==='all'||B.category(x.e)===filter;}).sort(function(a,b){var x=a.e,y=b.e,n=0;if(sort==='new'){var ax=Number(String(x.uid).replace(/^item-/,'')),by=Number(String(y.uid).replace(/^item-/,''));n=(isFinite(by)?by:b.i)-(isFinite(ax)?ax:a.i);}else if(sort==='level')n=(y.years||y.level||1)-(x.years||x.level||1);else if(sort==='type')n=types.indexOf(B.category(x))-types.indexOf(B.category(y));else n=B.quality(y)-B.quality(x);return n||a.i-b.i;}).map(function(x){return x.e;});};
B.sort=function(where,sort){var a=S.save.state[where==='store'?'store':'bag'],sorted=B.query(where,'all',sort||'type');a.splice.apply(a,[0,a.length].concat(sorted));S.save.markDirty();return a;};
B.selectable=function(where,ids){return S.save.state[where==='store'?'store':'bag'].filter(function(e){return !e.locked&&(!ids||ids.indexOf(e.uid)>=0);});};
B.batch=function(ids,action,where){var result={count:0,crystal:0},w=where==='store'?'store':'bag';if(action!=='sell'&&action!=='dismantle')return result;B.selectable(w,ids||[]).slice().forEach(function(e){if(action==='dismantle'){if(e.type!=='gear'||!S.gear)return;var r=S.gear.dismantle([e.uid]);result.count+=r.count;result.crystal+=r.crystal;}else{var removed=B.remove(e.uid,w);if(removed){var n=B.value(removed);S.save.state.cur.crystal+=n;result.count++;result.crystal+=n;}}});if(result.count){S.save.markDirty();if(S.bus)S.bus.emit('bag:changed',result);}return result;};
})(typeof window!=='undefined'?window:globalThis);
