(function(){'use strict';var S=SR,U=S.ui,N=S.NAMES,stage=null,offline=null;
if(S.buildWorldMap&&S.progress){S.buildWorldMap();S.progress.install();
// Ring origin previews belong to item details, keeping the grid compact.
var grid=U.bag;U.bag=function(s){var html=grid(s),tail='<section class="paper"><h2>'+N.ringOrigin+'</h2>';var i=html.indexOf(tail);return i<0?html:html.slice(0,i);};
var migrate=S.save.migrate;S.save.migrate=function(s){s=migrate(s);S.progress.migrate(s);return s;};
U.world=function(){return '<div id="world-map"></div>';};
S.bus.on('world:select_request',function(p){
 if(S.offline.claiming||(S.idle.settling&&S.idle.settling()))return;
 var n=S.progress.node(p.nodeId),w=S.progress.migrate(S.save.state);
 if(!n||n.index>w.cleared)return;
 S.battle.stop();S.progress.select(p.nodeId);var e=S.progress.encounter(),m=S.save.state.map;
 m.mapId=e.node.mapId;m.floor=e.node.floor;m.wave=e.wave;S.save.markDirty();S.save.save();
 S.bus.emit('world:changed',{});S.battle.start();hud();
});
S.bus.on('ui:open',function(p){if(p.panel==='journey'){var menu=document.querySelector('.wire-menu');if(menu)menu.insertAdjacentHTML('afterbegin',U.btn(N.worldMap.title,'wire:world',{}));}});
S.bus.on('wire:world',function(){U.close();U.show('world');});
}
if(typeof document!=='undefined'){document.title=N.game;var logo=document.querySelector('.gate-logo');if(logo)logo.alt=N.game;}
// Keep failures visible across tab changes and allow a local recovery copy.
var save=S.save.save;
function saveNotice(){if(typeof document==='undefined')return;var old=document.getElementById('save-warning');if(old)old.remove();if(!U.root||!S.save.lastError)return;var el=document.createElement('aside');el.id='save-warning';el.className='save-warning';el.setAttribute('role','alert');el.innerHTML='<b>保存失败，当前进度尚未写入。请先导出备份，再重试保存。</b><br><button data-save-retry>重试保存</button><button data-save-export>导出当前进度</button>';document.body.appendChild(el);el.querySelector('[data-save-retry]').onclick=function(){S.save.save();};el.querySelector('[data-save-export]').onclick=function(){var blob=new Blob([JSON.stringify(S.save.state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='soul-realm-save-'+Date.now()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);};}
S.save.save=function(){var ok=save.apply(S.save,arguments);saveNotice();return ok;};
var capacityPaused=false;
function capacityNotice(){if(!U.root)return;var status=S.bag.capacityStatus(),el=document.getElementById('capacity-warning');if(status.paused)capacityPaused=true;if(!capacityPaused){if(el)el.remove();return;}if(!el){el=document.createElement('aside');el.id='capacity-warning';el.className='paper capacity-warning';el.setAttribute('role','status');document.body.appendChild(el);}var signature=status.count+':'+status.paused;if(el.dataset.status===signature)return;el.dataset.status=signature;el.innerHTML='<b>仓库容量暂停战斗 · '+status.count+'/'+status.capacity+'</b><p>请整理至 '+(status.capacity-10)+' 件以下，再继续战斗。自动开关仅控制技能释放。</p><button data-capacity-bag>整理仓库</button><button data-capacity-resume '+(status.paused?'disabled':'')+'>继续战斗</button>';el.querySelector('[data-capacity-bag]').onclick=function(){U.close();U.show('bag');};el.querySelector('[data-capacity-resume]').onclick=function(){if(S.bag.full())return;capacityPaused=false;el.remove();S.battle.start();U.show('battle');};}
S.bus.on('bag:capacity',capacityNotice);
if(typeof document!=='undefined')setInterval(function(){if(U.root&&!S.offline.simulating)capacityNotice();},500);
S.equipment={slots:['crown','robe','belt','boots','bracer','skirt','necklace','ring','weapon','jade']};
S.bus.on('gear:equip',function(p){S.gear.equip(p.uid);});
S.bus.on('gear:unequip',function(p){S.gear.unequip(p.slot);});
['gear','rift','achieve','daily','audio2'].forEach(function(k){if(S[k]&&S[k].install)S[k].install();});
function level(){var h=S.save.state.hero,changed=false;while(h.level<99&&h.exp>=(S.progression?S.progression.expToNext(h.level):h.level*15)){h.exp-=S.progression?S.progression.expToNext(h.level):h.level*15;h.level++;changed=true;}if(changed)S.bus.emit('hero:changed',{});}
S.bus.on('battle:kill',function(){if(S.offline.simulating)level();else setTimeout(level,0);});
U.battle=function(s){return '<header><small>山风入怀 · 与灵同行</small><h1><img class="game-title" src="assets/ui2/ui2_title.webp" alt="'+N.game+'"></h1><p id="journey"></p></header>'+U.autoControls()+'<div id="battle-stage"></div><section class="paper"><div id="battle-stats"></div><p id="loot-note">静心修行，自有所得。</p><button data-tab="world">'+N.worldMap.title+'</button><button data-tab="bag">查看收获</button></section>';};
var original=U.show;U.show=function(p){S.worldmap.unmount();if(stage){stage.destroy();stage=null;}original(p);var nav=U.root&&U.root.querySelector('nav');if(nav){var entry=document.createElement('button');entry.dataset.tab='world';entry.className=p==='world'?'active':'';entry.innerHTML='<img alt="" src="'+U.asset('ui2_nav_realm')+'">'+N.worldMap.title;nav.appendChild(entry);}if(p==='world')S.worldmap.mount(document.getElementById('world-map'));saveNotice();capacityNotice();if(p==='battle'){stage=S.stage.mount(document.getElementById('battle-stage'));var snap=S.battle.snapshot();if(snap&&snap.enemies&&snap.enemies.length)S.bus.emit('battle:wave_start',Object.assign({mapId:S.save.state.map.mapId,floor:S.save.state.map.floor,wave:S.save.state.map.wave,waveMax:S.progress.encounter().node.waves},snap));hud();if(U.autoHud)U.autoHud();}};
function hud(){var s=S.save.state,a=S.stats.hero(s),j=document.getElementById('journey'),b=document.getElementById('battle-stats');if(j)j.textContent=S.progress.encounter().node.name+' · '+s.map.wave+'/'+S.progress.encounter().node.waves+' 波';if(b)b.textContent='等级 '+s.hero.level+' · 战力 '+a.teamPower+' · '+N.crystal+' '+s.cur.crystal;}
S.bus.on('battle:wave_start',hud);S.bus.on('loot:drop',function(p){if(S.offline.simulating)return;hud();var el=document.getElementById('loot-note');if(el)el.textContent='拾得 '+(p.item.type==='essence'?N.ringEssence+' · '+p.item.years+'年':p.item.type==='egg'?N.egg:N.gearSlots[p.item.slot]||N.soulBone);});
S.bus.on('ring:absorb_result',function(p){if(S.offline.simulating)return;setTimeout(function(){S.stageFx.absorb({color:p.essence.color,ok:p.ok,el:document.querySelector('.sr-page')});},0);});
function showOffline(){
 if(!offline||!U.root||document.hidden||S.offline.claiming||document.getElementById('sr-modal')||document.querySelector('.sr-feat-overlay,.sr-overlay,.wm-overlay')||!S.save.state.hero.classId)return;
 var r=offline;offline=null;var counts={essence:0,egg:0,gear:0};r.items.forEach(function(i){if(counts[i.type]!==undefined)counts[i.type]++;});
 U.modal('offline','<h2>离线收益</h2><p>静修 '+Math.floor(r.seconds/60)+' 分钟</p><p>'+N.crystal+' +'+r.crystal+' · 经验 +'+r.exp+'</p><p>'+N.ringEssence+' × '+counts.essence+' · '+N.egg+' × '+counts.egg+' · 装备 × '+counts.gear+'</p><small>'+((r.pausedSeconds>0||S.bag.full())?'仓库容量不足，部分离线时间未获得收益；请整理仓库后继续战斗。':'所得已收入行囊，点击空白继续修行。')+'</small>');
}
S.bus.on('offline:reward',function(p){if(S.save.state.flags.awakened&&p.seconds>=60)offline=p;if(S.bag.full())capacityPaused=true;});
S.bus.on('offline:status',function(p){
 if(!U.root)return;var el=document.getElementById('offline-status');
 if(p.claiming||p.error){if(!el){el=document.createElement('aside');el.id='offline-status';el.className='paper';el.setAttribute('role','status');document.getElementById('app').prepend(el);}el.textContent=p.error?'离线结算中断，已保存进度。':'离线结算中 · '+Math.floor((p.progress||0)*100)+'%';
 if(p.error){var retry=document.createElement('button');retry.textContent='重试结算';retry.onclick=function(){S.idle.retry().catch(function(){});};el.appendChild(retry);}}
 else {if(el)el.remove();hud();showOffline();}
});
if(typeof document!=='undefined')setInterval(showOffline,250);
S.bus.on('hero:awaken_request',function(){U.close();U.show('battle');U.classes();S.save.save();});
function enter(){document.getElementById('gate').remove();U.mount(document.getElementById('app'));U.show('battle');S.idle.start().catch(function(){});level();if(!S.save.state.flags.awakened){U.modal('opening','<div class="opening-triptych"><img class="opening-art" src="assets/scene/mobile/bg_opening_awakening.webp" alt="灵光初醒"><img class="opening-art" src="assets/scene/mobile/bg_opening_bond.webp" alt="初结'+N.pact+'"><img class="opening-art" src="assets/scene/mobile/bg_opening_fusion.webp" alt="人宠同辉"></div><h1>'+N.game+'</h1><p>山海之间，一缕灵光照见心中万象。</p><p>执此初心，与山野之灵同赴漫长修行。</p><button id="opening-next" class="primary wide">启程 · 跳过</button>');document.getElementById('opening-next').onclick=function(){U.awaken();};}else {U.show('battle');if(!S.save.state.hero.classId)U.classes();showOffline();}}
var keys=['bg_loading','ui2_logo','hero_idle_1x','mob_ink_wolf_idle_1x','ui2_button_primary_normal'],done=0;
Promise.all(keys.map(function(k){return new Promise(function(resolve){var i=new Image();i.onload=i.onerror=function(){done++;document.getElementById('load-progress').value=done/keys.length;resolve();};i.src=S.ASSETS[k].file;});})).then(function(){var b=document.getElementById('start');b.disabled=false;b.textContent='点击开始';b.onclick=enter;});
})();
