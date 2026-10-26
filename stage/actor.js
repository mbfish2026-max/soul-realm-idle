(function(g){
  'use strict';
  var SR=g.SR=g.SR||{};
  var DUR={idle:0,move:900,attack:420,skill:700,hit:380,fusion:900,win:800,die:1100};
  function create(o){
    o=o||{};
    var state='idle',timer=null,disposed=false;
    var schedule=o.schedule||setTimeout,cancel=o.cancel||clearTimeout;
    var dur=Object.assign({},DUR,o.dur),el=o.el,pose;
    if(el){pose=document.createElement('div');pose.className='sr-pose';el.appendChild(pose);}
    function set(next,force){
      if(disposed||!Object.prototype.hasOwnProperty.call(DUR,next))return false;
      if((state==='die'||state==='win')&&!force)return false;
      if(timer!==null)cancel(timer);
      state=next;
      if(el){
        el.className=el.className.replace(/\bsr-s-\w+\b/g,'').trim();
        void el.offsetWidth;el.classList.add('sr-s-'+next);
        el.style.setProperty('--duration',(dur[next]||3000)+'ms');
        var sprite=(o.sprites||{})[next]||(o.sprites||{}).idle;
        pose.style.cssText='';pose.replaceChildren();
        if(sprite){
          if(typeof sprite==='string')sprite={file:sprite};
          if(sprite.frames>1){
            pose.classList.add('sr-atlas');
            var width=parseFloat(el.style.getPropertyValue('--actor-width'))||120;pose.style.width=width+'px';pose.style.height=(width*sprite.fh/sprite.fw)+'px';
            pose.style.backgroundImage='url("'+sprite.file+'")';
            pose.style.backgroundSize=(sprite.frames*100)+'% 100%';
            pose.style.setProperty('--frames',sprite.frames);
            var duration=sprite.frames/sprite.fps*1000;pose.style.animation='sr-frames '+duration+'ms steps('+(sprite.frames-1)+') '+(next==='idle'?'infinite':'1 forwards');if(next!=='idle')dur[next]=duration;
          }else{pose.classList.remove('sr-atlas');var img=document.createElement('img');img.src=sprite.file;img.alt='';pose.appendChild(img);}
        }
      }
      if(next!=='idle'&&next!=='win'&&next!=='die')timer=schedule(function(){timer=null;set('idle');},dur[next]);
      return true;
    }
    var api={set:set,destroy:function(){disposed=true;if(timer!==null)cancel(timer);},get state(){return state;}};
    set('idle');return api;
  }
  SR.actor={create:create,DUR:DUR};
})(typeof window!=='undefined'?window:globalThis);
