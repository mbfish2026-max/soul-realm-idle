(function(g){
  'use strict';var SR=g.SR=g.SR||{};
  var colors={white:'#e8e4d8',yellow:'#d6a51e',purple:'#8a55d8',black:'#292530',red:'#c5302a'};
  function create(root){
    var canvas=document.createElement('canvas');canvas.className='sr-canvas';root.appendChild(canvas);
    var ctx=canvas.getContext('2d'),raf=0,particles=[],nodes=[],timers=[],dead=false;
    function later(fn,ms){var id=setTimeout(function(){timers=timers.filter(function(x){return x!==id;});if(!dead)fn();},ms);timers.push(id);return id;}
    function once(cls,text,x,y,life){var n=document.createElement('div');n.className=cls;n.textContent=text||'';
      if(x!=null)n.style.left=x+'%';if(y!=null)n.style.top=y+'%';root.appendChild(n);nodes.push(n);
      later(function(){n.remove();nodes=nodes.filter(function(x){return x!==n;});},life||1500);return n;}
    function tick(t){
      var w=root.clientWidth,h=root.clientHeight,dpr=Math.min(g.devicePixelRatio||1,2);
      if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      particles=particles.filter(function(p){var age=(t-p.t)/1000;if(age>p.life)return false;ctx.globalAlpha=1-age/p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x*w/100+p.vx*age,p.y*h/100+p.vy*age+24*age*age,p.r,0,Math.PI*2);ctx.fill();return true;});
      ctx.globalAlpha=1;raf=particles.length?requestAnimationFrame(tick):0;
    }
    function burst(x,y,color){var random=SR.rng||function(){return .5;};
      for(var i=0;i<28;i++){var a=i*Math.PI*2/28,speed=25+random()*65;particles.push({x:x,y:y,t:performance.now(),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,color:color||'#364b3e',r:1+random()*2,life:.65+random()*.45});}
      if(!raf)raf=requestAnimationFrame(tick);
    }
    return {once:once,later:later,burst:burst,
      skill:function(key,params){var palette={fire:'#c65b40',wind:'#71a386',earth:'#bc9b5e',wood:'#5f9867',moon:'#a08ac0',ice:'#80bac9'},vein=key.split('_')[1],count=Math.min(4,params&&params.bursts||1);for(var i=0;i<count;i++)burst(40+i*8,57,palette[vein]||'#71a386');},
      damage:function(p,dmg,crit){var n=once('sr-damage'+(crit?' sr-critical':'')+(dmg<0?' sr-heal':''),(dmg<0?'+':'−')+Math.abs(dmg).toLocaleString(),Math.max(27,Math.min(73,p.x)),p.y-15,1800);if(crit){var seal=document.createElement('small');seal.textContent='暴击';n.appendChild(seal);}},
      title:function(text){once('sr-callout',text,50,18,1500);},
      shake:function(){root.classList.remove('sr-shake');void root.offsetWidth;root.classList.add('sr-shake');later(function(){root.classList.remove('sr-shake');},460);},
      edge:function(){once('sr-edge','',null,null,1400);},
      get active(){return !!raf;},
      destroy:function(){dead=true;cancelAnimationFrame(raf);raf=0;particles=[];timers.forEach(clearTimeout);nodes.forEach(function(n){n.remove();});canvas.remove();}
    };
  }
  SR.stageFx=SR.stageFx||{};SR.stageFx.create=create;SR.stageFx.colors=colors;
})(typeof window!=='undefined'?window:globalThis);
