(function(){'use strict';var S=SR,U=S.ui,oldAsset=U.asset;
U.asset=function(key,fallback){if(key==='hero_idle')return 'assets/hero/hero_idle.webp';if(key==='pet_fox_idle')return 'assets/pet/pet_fox_idle.webp';return oldAsset(key,fallback);};
var hero=U.hero;U.hero=function(s){return hero(s)+'<section class="paper">'+U.btn(S.NAMES.soulBone,'wire:gear',{},'wide')+'</section>';};
S.bus.on('wire:gear',function(){U.show('gear');});
S.bus.on('wire:menu',function(){U.modal('journey','<h2>修行手札</h2><div class="wire-menu">'+[['gear',S.NAMES.soulBone,'ui2_nav_bone'],['rift',S.NAMES.rift,'ui2_nav_realm'],['achieve',S.NAMES.achieve,'ui2_nav_achievement'],['daily',S.NAMES.daily,'ui_daily'],['settings','设置','ui2_nav_settings']].map(function(x){return '<button data-event="wire:open" data-payload="'+U.esc(JSON.stringify({id:x[0]}))+'"><img alt="" src="'+U.asset(x[2])+'">'+x[1]+'</button>';}).join('')+'</div>');});
S.bus.on('wire:open',function(p){U.close();if(p.id==='gear'){U.show('gear');return;}if(p.id==='settings'){U.modal('settings','<h2>设置</h2>'+U.btn(S.NAMES.autoSettings,'wire:auto',{},'wide')+'<div id="wire-audio"></div>');S.audio2.mountSettings(document.getElementById('wire-audio'));}else S[p.id].open();});
S.bus.on('wire:auto',function(){U.autoSettings();});
var show=U.show;U.show=function(panel){show(panel);var header=U.root&&U.root.querySelector('header');if(header){var b=document.createElement('button');b.className='wire-menu-button';b.textContent='手札';b.dataset.event='wire:menu';b.dataset.payload='{}';header.appendChild(b);}};
})();
