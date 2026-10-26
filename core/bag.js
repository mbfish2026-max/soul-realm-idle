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
