(function(g){
  'use strict';var SR=g.SR=g.SR||{};
  SR.stageBoss={create:function(root,fx,enemy){
    var el=document.createElement('div');el.className='sr-bossbar';
    var title=document.createElement('b');title.textContent=(enemy.name||SR.NAMES.beastLord)+' · '+enemy.years+'年';el.appendChild(title);
    var value=document.createElement('span');el.appendChild(value);
    var bar=document.createElement('div');bar.className='sr-bhp';bar.innerHTML='<i></i><s style="left:66%"></s><s style="left:33%"></s>';el.appendChild(bar);
    var phases=document.createElement('div');phases.className='sr-phases';phases.innerHTML='<b>壹</b><b>贰</b><b>叁</b>';el.appendChild(phases);root.appendChild(el);
    function hp(p){var ratio=p.hpMax>0?Math.max(0,Math.min(1,p.hp/p.hpMax)):0;bar.firstChild.style.width=ratio*100+'%';value.textContent=Math.round(ratio*100)+'% · '+p.hp+'/'+p.hpMax;}
    hp(enemy);
    return {hp:hp,phase:function(p){Array.prototype.forEach.call(phases.children,function(n,i){n.classList.toggle('sr-on',i===p.phase-1);});fx.shake();fx.edge();
      if(p.warn){var end=Date.now()+Math.max(0,p.warn.delayMs||0),n=fx.once('sr-warning','',null,null,Math.max(1,p.warn.delayMs||0)+500);
        function update(){var remaining=Math.max(0,end-Date.now());n.textContent=p.warn.name+' · '+Math.ceil(remaining/1000)+' 秒';if(remaining)fx.later(update,100);else n.textContent=p.warn.name;}
        update();}
    },destroy:function(){el.remove();}};
  },drop:function(fx){fx.image('fx_drop_red',72,65,200);fx.once('sr-drop-label',SR.NAMES.ringColors.red+SR.NAMES.soulRing,72,75,3500);fx.burst(72,65,'#c5302a');}};
})(typeof window!=='undefined'?window:globalThis);
