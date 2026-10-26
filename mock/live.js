// ===== 动作系统：每个角色 = 一组姿态图 + 一次性 CSS 动作类；只有 idle 有轻微呼吸 =====
const POSES={
 hero:{idle:'hero_idle',move:'hero_idle',attack:'hero_attack',skill:'hero_skill',hit:'hero_idle',fusion:'hero_attack',win:'hero_skill',die:'hero_down'},
 fox:{idle:'fox_idle',move:'fox_idle',attack:'fox_attack',skill:'fox_attack',hit:'fox_idle',fusion:'fox_attack',win:'fox_idle',die:'fox_idle'},
 wolf:{idle:'wolf',move:'wolf',attack:'wolf',skill:'wolf',hit:'wolf',fusion:'wolf',win:'wolf',die:'wolf'},
 boss:{idle:'boss',move:'boss',attack:'boss',skill:'boss',hit:'boss',fusion:'boss',win:'boss',die:'boss'}};
const DUR={move:900,attack:420,skill:700,hit:380,fusion:900,win:800}; // die 停在最后一帧
const ACT={};
class Actor{
 constructor(o){Object.assign(this,o);const el=document.createElement('div');this.el=el;
  el.className=`actor ${o.kind} ${o.flip?'flip':''}`;el.style.cssText=`left:${o.x}px;top:${o.y}px;z-index:${o.z||Math.round(o.y/10)};--lx:${o.lx||0}px;--ly:${o.ly||0}px`;
  el.innerHTML='<div class="anc">'+(o.tag?`<div class="tag">${o.tag}<div class="hp"><s style="width:${o.hp??100}%"></s><i style="width:${o.hp??100}%"></i></div></div>`:'')+
   `<div class="body"><div class="ghost"><img></div><img class="pose"></div><div class="sh"></div></div>`;const im=el.querySelector('.pose');im.onload=()=>{const w=im.naturalWidth*(o.s||.4)+'px';im.style.width=w;el.querySelector('.ghost img').style.width=w}
  document.querySelector('.stage').appendChild(el);ACT[o.id]=this;this.set(o.state||'idle');}
 set(s){const p=POSES[this.kind][s];const src=`assets/${p}.png`;
  this.el.querySelector('.pose').src=src;this.el.querySelector('.ghost img').src=src;
  this.el.classList.remove(...[...this.el.classList].filter(c=>c.startsWith('s-')||c==='trail'));void this.el.offsetWidth;
  this.el.classList.add('s-'+s);if(s==='attack'||s==='fusion')this.el.classList.add('trail');
  this.state=s;clearTimeout(this._t);if(DUR[s]&&s!=='idle')this._t=setTimeout(()=>this.set('idle'),DUR[s]);}
 setHp(v){const t=this.el.querySelector('.hp');if(!t)return;t.querySelector('i').style.width=v+'%';t.querySelector('s').style.width=v+'%';}
 c(){const r=this.el.querySelector('.body').getBoundingClientRect(),s=document.querySelector('.stage').getBoundingClientRect();return{x:r.left-s.left+r.width/2,y:r.top-s.top+r.height*.5,top:r.top-s.top}}
}
const at=(ms,f)=>setTimeout(f,ms);
function add(html){const e=document.createElement('div');e.innerHTML=html.trim();const n=e.firstChild;document.querySelector('.stage').appendChild(n);return n}
function once(html,life){const n=add(html);setTimeout(()=>n.remove(),life||1400);return n}
function dmg(a,txt,cls='n',dx=0,dy=0){const p=a.c();once(`<div class="dmg ${cls}" style="left:${Math.min(320,Math.max(60,p.x+dx))}px;top:${p.top-34+dy}px">${txt}</div>`,cls==='c'?2600:1300)}
function slash(a,b){const p=a.c(),q=b.c(),dx=q.x-p.x,dy=q.y-p.y;once(`<div class="slash" style="left:${p.x}px;top:${p.y}px;width:${Math.hypot(dx,dy)}px;transform:rotate(${Math.atan2(dy,dx)}rad)"></div>`,500)}
function callout(t,s,y){once(`<div class="callout" style="top:${y}px">${t}<small>${s}</small></div>`,1500)}
function log(html){const L=document.querySelector('.log');if(!L)return;const p=document.createElement('p');p.className='new';p.innerHTML=html;L.insertBefore(p,L.children[0]);while(L.querySelectorAll('p').length>5)L.querySelectorAll('p')[5].remove()}
// rings under hero
const RINGS=['c-w','c-y','c-p','c-p','c-b','c-r'];
function drawRings(x,y,n,sc=1){const r=add(`<div class="ringset" style="left:${x}px;top:${y}px"></div>`);r.innerHTML=RINGS.slice(0,n).map((c,i)=>{const w=(56+i*30)*sc;return `<div class="ring ${c}" data-i="${i}" style="width:${w}px;height:${w*.32}px"></div>`}).join('')}
function lightRing(i){const r=document.querySelector(`.ring[data-i="${i}"]`);if(!r)return;r.classList.remove('lit');void r.offsetWidth;r.classList.add('lit');
 const w=r.cloneNode();w.className=`ring wave ${r.classList[1]}`;r.parentNode.appendChild(w);setTimeout(()=>w.remove(),950);
 const p=r.parentNode;burst({x:parseFloat(p.style.left),y:parseFloat(p.style.top),n:22,colors:[getComputedStyle(r).getPropertyValue('--c').trim()],spd:90,life:.8,flat:.32})}
// ink particles (canvas, one-shot)
const FX={b:[]};
function burst(o){o.t0=performance.now();let s=o.seed||(Math.random()*1e9|0)+1;const R=()=>(s=(s*16807)%2147483647)/2147483647;
 o.p=[...Array(o.n||30)].map(()=>({a:R()*6.283,v:(.3+R())*(o.spd||100),r:1+R()*(o.size||2.5),c:o.colors[R()*o.colors.length|0]}));FX.b.push(o);if(!FX.on){FX.on=1;requestAnimationFrame(tick)}}
function tick(){const c=document.querySelector('canvas.fx');const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,390,528);const now=performance.now();
 FX.b=FX.b.filter(b=>{const t=(now-b.t0)/1000,L=b.life||1;if(t>L)return false;const k=t/L;for(const p of b.p){const d=p.v*t*(1-k*.5);g.globalAlpha=(1-k)*.9;g.fillStyle=p.c;g.beginPath();g.arc(b.x+Math.cos(p.a)*d,b.y+Math.sin(p.a)*d*(b.flat||1)+(b.fall||0)*t*t*80,p.r,0,6.283);g.fill()}return true});
 if(FX.b.length)requestAnimationFrame(tick);else FX.on=0}
// ===== 人宠联动时间轴（毫秒）=====
function castSkill(i,target){const H=ACT.hero,F=ACT.fox,T=target||ACT[TARGET];if(!T||T.state==='die')return;
 press(i);H.set('skill');                         // 0ms 人物结印
 at(120,()=>lightRing(SK[i].ring));               // 120ms 对应魂环亮+扩散
 at(140,()=>window.CALLY!==null&&callout(SK[i].nm,SK[i].sub,window.CALLY||96));
 at(260,()=>{H.set('attack');F.set('attack')});   // 260ms 人出剑 / 契兽同时扑击
 at(380,()=>slash(H,T));
 at(480,()=>{T.set('hit');T.setHp(T.hpv=Math.max(0,(T.hpv??60)-SK[i].dmg));const crit=i===1;
   dmg(T,crit?`${SK[i].v}<span class="seal">暴击</span>`:`-${SK[i].v}`,crit?'c':'n');
   burst({x:T.c().x,y:T.c().y,n:34,colors:['#1d1b1f','#3b382f','#3f7a5e'],spd:110,life:.8,fall:1});
   log(`${SK[i].nm} 对 ${T.name} 造成 <b class="${crit?'zhu':''}">${SK[i].v}</b> 伤害`)});
 at(620,()=>dmg(T,`狐爪 -${Math.round(parseInt(SK[i].v.replace(',',''))*.18)}`,'n',-40,110));
 at(700,()=>{if(T.hpv<=0)kill(T)})}
function fusion(){const H=ACT.hero,F=ACT.fox;press(4);
 H.set('skill');F.set('skill');                                   // 0 人宠同时蓄势
 RINGS.forEach((_,k)=>at(60+k*60,()=>lightRing(k)));              // 60-360 六环依次点亮
 at(200,()=>callout("灵元融合","人宠共鸣 · 竹影狐舞",96));
 at(420,()=>{H.set('fusion');F.set('fusion')});                     // 420 各自出手姿态
 at(640,()=>{const st=document.querySelector('.stage');st.classList.remove('shake');void st.offsetWidth;st.classList.add('shake');
   Object.values(ACT).filter(a=>a.foe&&a.state!=='die').forEach((a,k)=>{a.set('hit');a.setHp(a.hpv=Math.max(0,(a.hpv??60)-45));
     at(k*90,()=>dmg(a,`-${(3567+k*411).toLocaleString()}`,'fu'));burst({x:a.c().x,y:a.c().y,n:40,colors:['#1d1b1f','#b5302a','#3f7a5e'],spd:130,life:.9})});
   log('<b class="zhu">灵元融合</b>！对全体造成 <b class="zhu">3,567</b> 伤害')});
 at(1300,()=>Object.values(ACT).filter(a=>a.foe&&a.hpv<=0&&a.state!=='die').forEach(kill))}
function kill(a){a.set('die');log(`${a.name} 被击败`);if(!Object.values(ACT).some(x=>x.foe&&x.state!=='die'))at(700,()=>{ACT.hero.set('win');ACT.fox.set('win');callout('胜','本波清剿完成',190)})}
function press(i){const b=document.querySelectorAll('.sk')[i];if(!b)return;b.classList.remove('press');void b.offsetWidth;b.classList.add('press')}
let TARGET='w1';const RC={'c-w':'#b9b5a8','c-y':'#d6a51e','c-p':'#8a55d8','c-b':'#1d1b1f','c-r':'#c5302a'};
const SK=[{nm:'竹影剑',sub:'第二魂环 · 百年',ring:1,v:'1,268',dmg:22},{nm:'清风诀',sub:'第三魂环 · 千年',ring:2,v:'3,567',dmg:40},{nm:'山灵护',sub:'第四魂环 · 千年',ring:3,v:'974',dmg:16},{nm:'玄煞域',sub:'第五魂环 · 万年',ring:4,v:'5,820',dmg:55}];
function skillBar(){const G=['竹','风','山','煞'];return `<div class="skills">${SK.map((s,i)=>`<div class="sk" onclick="castSkill(${i})"><div class="disc"><span class="ringdot" style="--c:${RC[RINGS[s.ring]]}"></span>${G[i]}${i===2?'<div class="cd" style="--p:62%">6.2</div>':''}</div><div class="nm">${s.nm}</div></div>`).join('')}<div class="sk ult" onclick="fusion()"><div class="disc">融</div><div class="nm">灵元融合</div></div></div>`}
// demo hooks for screenshots
window.DEMO={castSkill,fusion,kill,ACT};
