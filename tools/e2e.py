"""Real mobile WebKit journey; accelerated ticks are injected only by this runner."""
import json, re, subprocess, time, threading, http.server, functools
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(.5)
try:
 with sync_playwright() as p:
  browser=p.webkit.launch(); page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
  page.set_default_timeout(10000)
  errors=[]; page.on('pageerror',lambda e:errors.append(str(e))); page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('response',lambda r:errors.append('HTTP '+str(r.status)+' '+r.url) if r.status>=400 else None)
  traffic={};page.on('response',lambda r:traffic.update({r.url: int(r.headers.get('content-length','0'))}))
  shots=ROOT/'docs/shots';shots.mkdir(exist_ok=True)
  for old in shots.glob('int2_*.png'):old.unlink()
  shot_names=[]
  def shot(name):
   shot_names.append(name)
   page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
   page.screenshot(path=str(shots/('int2_'+name+'.png')))
   assert page.evaluate('document.documentElement.scrollWidth<=390'),name+' overflow'
   assert not re.search(r'[A-Za-z]|测试|模拟|敬请期待|占位|调试',page.locator('body').inner_text()),name+' forbidden visible text'
  def tab(name):page.locator('nav [data-tab="'+name+'"]').click()
  def advance(ms):
   page.evaluate('(ms)=>{for(let i=0;i<ms;i+=100)SR.battle.tick(100)}',ms);page.wait_for_timeout(300)
  page.goto('http://127.0.0.1:8765/index.html');page.wait_for_function('!document.querySelector("#start").disabled');shot('00_loading')
  initial_bytes=sum(traffic.values());assert initial_bytes<2000000;page.locator('#start').click();page.locator('#opening-next').wait_for();shot('01_opening');page.locator('#opening-next').click();shot('02_awaken');page.locator('[data-event="hero:awaken_request"]').first.click()
  shot('skill_class');page.locator('[data-event="class:choose"]').first.click();shot('skill_tree');tab('battle')
  page.locator('#auto-toggle').click();assert not page.evaluate('SR.save.state.auto.enabled');shot('auto_off')
  page.locator('#auto-settings').click();page.locator('[data-auto="reserveBossFusion"]').check();page.locator('[data-auto="absorbRate"]').select_option('1');page.locator('[data-auto="fitOnly"]').check();shot('auto_settings')
  page.locator('#sr-modal').click(position={'x':5,'y':5});page.locator('#auto-toggle').click();assert page.evaluate('SR.save.state.auto.enabled');shot('auto_on')
  assert page.evaluate('SR.audio2.unlock()')
  page.wait_for_timeout(300);first_battle_bytes=sum(traffic.values());assert first_battle_bytes<2000000
  page.evaluate('SR.rng.seed(42);window.bossSeen=false;SR.bus.on("battle:boss_phase",()=>window.bossSeen=true)')
  advance(60000)
  for _ in range(10):
   if page.evaluate('SR.save.state.bag.length>0'):break
   advance(30000)
  shot('03_battle');assert page.locator('.sr-page-battle>.paper').bounding_box()['y']+page.locator('.sr-page-battle>.paper').bounding_box()['height']<=page.locator('nav').bounding_box()['y'];assert page.evaluate('SR.save.state.stats.kills>0');assert page.evaluate('SR.save.state.bag.length>0')
  # Continue real combat until first ring slot is available.
  for _ in range(25):
   if page.evaluate('SR.save.state.hero.level>=10'):break
   advance(60000)
  assert page.evaluate('SR.save.state.hero.level>=10')
  tab('bag');shot('04_bag')
  for _ in range(12):
   page.locator('.bg-grid [data-bag-uid]').filter(has=page.locator('img[src*="essence"]')).first.click();page.locator('#sr-modal [data-event="ui:absorb_open"]').click();shot('05_absorb');assert '适配威力' in page.locator('.sr-dialog').inner_text();page.locator('[data-event="ring:absorb_request"]').click();page.wait_for_timeout(350)
   assert not page.locator('#sr-modal').count(),page.evaluate('JSON.stringify({hero:SR.save.state.hero,item:SR.save.state.bag[0]})')
   if page.evaluate('SR.save.state.hero.rings.length>0'):break
  assert page.evaluate('SR.save.state.hero.rings.length>0')
  tab('bag');page.locator('.bg-grid [data-bag-uid]').filter(has=page.locator('img[src*="essence"]')).first.click();page.locator('#sr-modal [data-event="ui:absorb_open"]').click();page.locator('[data-event="ui:ring_replace"]').first.click();shot('skill_replace');page.locator('[data-event="ring:replace"]').click();page.wait_for_timeout(200)
  tab('battle');page.locator('#auto-toggle').click();assert not page.evaluate('SR.save.state.auto.enabled')
  # Ready a real acquired skill, then release it through its visible button.
  assert page.evaluate('SR.skills.branch(0,0)'),page.evaluate('JSON.stringify({rings:SR.save.state.hero.rings,cur:SR.save.state.cur})')
  page.evaluate('window.manualId=SR.skills.entries({side:"hero"}).find(e=>SR.DATA.skills[e.id].kind!=="passive").id')
  advance(35000);page.wait_for_timeout(600)
  for _ in range(20):
   button=page.locator('[data-cast="'+page.evaluate('window.manualId')+'"]')
   if button.is_enabled():button.click()
   if page.evaluate('SR.battle.snapshot().hero.cool[window.manualId]>0'):break
   advance(1000)
  assert page.evaluate('SR.battle.snapshot().hero.cool[window.manualId]>0');shot('auto_manual')
  page.locator('#auto-settings').click();page.locator('[data-event="auto:priority"]').first.click();assert page.locator('#sr-modal').count();before=page.evaluate('JSON.stringify(SR.battle.snapshot().enemies)');advance(15000);assert page.evaluate('JSON.stringify(SR.battle.snapshot().enemies)')!=before;assert page.locator('#sr-modal').count();shot('auto_priority');page.locator('#sr-modal').click(position={'x':5,'y':5});page.locator('#auto-toggle').click()
  tab('skills');shot('skill_tree');assert page.evaluate('SR.skills.entries({side:"hero"})[0].id===SR.save.state.hero.rings[0].skillId')
  tab('pets')
  for _ in range(30):
   if page.locator('[data-event="pet:hatch_request"]').count():break
   tab('battle');advance(60000);tab('pets')
  page.locator('[data-event="pet:hatch_request"]').first.click();shot('06_pets');page.locator('[data-event="pet:feed_request"]').click();page.locator('[data-event="pet:deploy_request"]').click();assert page.evaluate('SR.save.state.pets[0].step>1');assert page.evaluate('SR.save.state.team.pets.length==1')
  page.locator('[data-event="skill:order"]').first.click();assert page.evaluate('SR.save.state.pets[0].skillPriority.length>0');shot('pet_order')
  tab('bag')
  if page.locator('[data-event="gear:equip"]').count():
   page.locator('[data-event="gear:equip"]').first.click();assert page.evaluate('Object.keys(SR.save.state.hero.bones).length>0')
  tab('hero');shot('07_hero')
  page.locator('[data-event="wire:gear"]').click();assert page.locator('.gg-slots>article').count()==10;shot('gear_ten_slots')
  assert '8件' in page.locator('.gg').inner_text()
  # Explicit equipment fixture: roll real G items until one eight-piece set is complete.
  # This isolates set wiring from random collection time; combat/loot above remain real.
  fixture=page.evaluate('''()=>{const slots=SR.GEAR_DATA.setSlots,found={};for(let i=0;i<15000&&Object.keys(found).length<8;i++){let e=SR.gear.roll(SR.save.state.hero.level,SR.rng);if(e.setId==='bamboo'&&!found[e.slot]){SR.bag.add(e,'store');found[e.slot]=e.uid;}}return Object.values(found);}''')
  assert len(fixture)==8
  # Use acquired gear to exercise warehouse and reforge/detail controls.
  page.locator('[data-event="gear:action"][data-payload*="warehouse"]').click();shot('warehouse')
  page.locator('[data-event="gear:action"][data-payload*="where"][data-payload*="store"]').click()
  for uid in fixture:
   page.locator('.gg-item [data-event="gear:action"][data-payload*="'+uid+'"]').click()
   page.locator('#sr-modal [data-event="gear:action"][data-payload*="equip"]').click()
  assert page.evaluate('SR.gear.setCounts(SR.save.state).bamboo')==8
  page.locator('[data-event="gear:action"][data-payload*="open"][data-payload*="gear"]').click();shot('gear_eight_set')
  assert '青篁 · 8/8' in page.locator('.gg').inner_text()
  assert page.locator('.gg-active').count()>=4
  page.locator('.gg-slots [data-event="gear:action"]').first.click();shot('gear_reforge')
  equipped=page.evaluate("JSON.parse(document.querySelector('#sr-modal [data-event=\"gear:action\"]').dataset.payload).id")
  before_reforge=page.evaluate('(id)=>SR.gear.find(id).item.reforges||0',equipped)
  page.locator('#sr-modal [data-payload*="reforge"]').click();assert page.evaluate('(id)=>SR.gear.find(id).item.reforges',equipped)==before_reforge+1
  page.locator('#sr-modal').get_by_role('button',name='锁定',exact=True).click();assert page.evaluate('(id)=>SR.gear.find(id).item.locked',equipped)
  page.locator('#sr-modal').get_by_role('button',name='解锁',exact=True).click();page.locator('#sr-modal').click(position={'x':5,'y':5})
  spare=page.evaluate('()=>{let e=SR.gear.roll(SR.save.state.hero.level,SR.rng);SR.bag.add(e,"store");return e.uid}')
  page.locator('[data-event="gear:action"][data-payload*="warehouse"]').click()
  page.locator('.gg-item [data-event="gear:action"][data-payload*="'+spare+'"]').click();shot('gear_detail');page.locator('#sr-modal [data-payload*="confirmOne"]').click();page.locator('[data-event="gear:salvage"]').click();assert page.evaluate('(id)=>!SR.gear.find(id)',spare)
  if page.locator('.gg-item [data-event="gear:action"]').count():
   page.locator('.gg-item [data-event="gear:action"]').first.click();shot('gear_detail');page.locator('#sr-modal').click(position={'x':5,'y':5})

  tab('battle');page.evaluate('for(let i=0;i<360000;i+=100){if(SR.battle.snapshot().enemies.some(e=>e.isBoss))break;SR.battle.tick(100)}');page.wait_for_timeout(200);shot('08_boss');assert page.evaluate('SR.battle.snapshot().enemies.some(e=>e.isBoss)')
  # New feature entries and settings are reached through the visible menu.
  def menu_open(label):
   page.locator('[data-event="wire:menu"]').click();page.locator('.wire-menu').get_by_role('button',name=label,exact=True).click()
  for label,key in [('渊层秘境','rift'),('成就','achieve'),('日常','daily')]:
   menu_open(label);page.locator('.sr-feat-panel').wait_for();shot(key)
   if key=='rift':
    rift_world=page.evaluate('JSON.stringify(SR.save.state.world)');attempts=page.evaluate('SR.save.state.rift.attempts');page.locator('[data-action="challenge"]').click();assert page.evaluate('SR.save.state.rift.attempts')==attempts+1;assert page.evaluate('JSON.stringify(SR.save.state.world)')==rift_world;shot('rift_result')
   else:
    claims=page.locator('[data-action="claim"]:enabled')
    if claims.count():claims.first.click()
   page.locator('.sr-feat-overlay').click(position={'x':3,'y':3});assert not page.locator('.sr-feat-overlay').count()
  menu_open('设置');page.locator('#wire-audio input[type="checkbox"]').check();assert page.evaluate('SR.audio2.getSettings().muted');shot('settings_audio');page.locator('#wire-audio input[type="checkbox"]').uncheck();page.locator('#sr-modal').click(position={'x':5,'y':5})
  # Explicit isolated fixtures exercise grid operations and boundary node transitions.
  page.evaluate('window.wire2Before=JSON.parse(JSON.stringify(SR.save.state));SR.battle.stop();let s=SR.save.state;s.bag=[SR.gear.roll(10,SR.rng),SR.gear.roll(20,SR.rng),{uid:"wire-mat",type:"mat",quantity:3}];s.bagCap=5;SR.ui.show("bag")')
  def grid(action):return page.locator(f"[data-event='bag:grid'][data-payload*='\"action\":\"{action}\"']")
  page.locator('.bg-tabs').get_by_role('button',name='装备',exact=True).click();assert page.locator('.bg-grid [data-bag-uid]').count()==2;shot('wire2_bag_filter')
  page.locator('[data-bag-sort]').select_option('level');grid('tidy').click();assert page.evaluate('SR.save.state.bag[0].level===20')
  page.locator('.bg-grid [data-bag-uid]').first.click();shot('wire2_bag_detail');page.locator('#sr-modal').click(position={'x':5,'y':5})
  grid('multi').click();grid('select').click();shot('wire2_bag_multi')
  page.get_by_role('button',name='分解',exact=True).click();shot('wire2_bag_confirm');grid('execute').click();assert page.evaluate('!SR.save.state.bag.some(e=>e.type==="gear")')
  grid('multi').click();page.locator('.bg-tabs').get_by_role('button',name='全部',exact=True).click()
  page.evaluate('let s=SR.save.state;while(s.bag.length<s.bagCap)s.bag.push({uid:"wire-full-"+s.bag.length,type:"mat"});SR.ui.show("bag");window.wireStore=s.store.length;SR.auto.receive({uid:"wire-overflow",type:"mat"})');assert page.evaluate('SR.save.state.store.length===window.wireStore+1');shot('wire2_bag_full')
  grid('multi').click();grid('select').click();page.get_by_role('button',name='出售',exact=True).click();grid('execute').click();assert page.evaluate('SR.save.state.bag.length===0');grid('multi').click()
  tab('world');shot('wire2_map_overview')
  page.locator('[data-node="node-47"]').click();assert page.locator('[data-farm]').is_disabled();shot('wire2_map_locked');page.locator('[data-close]').click()
  page.evaluate('SR.save.state.world={v:1,cleared:7,selected:"node-0",wave:1,rewards:{}};SR.save.state.auto.advance=false;SR.save.state.auto.challengeBoss=true;SR.bus.emit("world:changed",{})')
  page.evaluate('SR.offline.claiming=true;SR.bus.emit("world:select_request",{nodeId:"node-7"})');assert page.evaluate('SR.save.state.world.selected==="node-0"');page.evaluate('SR.offline.claiming=false')
  page.locator('[data-node="node-0"]').click();page.locator('[data-farm]').click();assert page.evaluate('SR.save.state.world.selected==="node-0"');shot('wire2_map_repeat')
  page.locator('[data-frontier]').click();assert page.evaluate('SR.save.state.world.selected==="node-7"');shot('wire2_map_frontier')
  page.locator('[data-node="node-7"]').click();shot('wire2_map_boss');page.locator('[data-close]').click()
  page.evaluate('window.wireStats=SR.stats.hero;SR.stats.hero=()=>({atk:1e9,def:1e9,hp:1e9});SR.battle.stop();SR.save.state.world.wave=10;SR.save.state.auto.advance=true;window.wireCrystal=SR.save.state.cur.crystal;SR.battle.start();SR.battle.tick(2000)')
  assert page.evaluate('SR.save.state.world.cleared===8 && SR.save.state.world.selected==="node-8" && SR.save.state.world.rewards[1] && SR.save.state.cur.crystal>=window.wireCrystal+300');shot('wire2_map_reward')
  page.evaluate('SR.battle.stop();SR.progress.select("node-7");SR.save.state.world.wave=10;window.wireRewardEvents=0;SR.bus.on("world:changed",e=>{if(e.reward)window.wireRewardEvents++});SR.battle.start();SR.battle.tick(2000)');assert page.evaluate('SR.save.state.world.cleared===8 && window.wireRewardEvents===0')
  page.evaluate('SR.battle.stop();SR.stats.hero=window.wireStats;SR.save.state=window.wire2Before;SR.save.save();SR.ui.show("battle");SR.battle.start()')
  saved=page.evaluate('SR.save.save();SR.save.state.hero.soulId');page.reload();page.locator('#start').click();assert page.evaluate('SR.save.state.hero.soulId')==saved;assert page.evaluate('SR.gear.setCounts(SR.save.state).bamboo')==8;assert page.evaluate('SR.save.state.auto.reserveBossFusion && SR.save.state.auto.absorbRate===1');shot('09_reload')
  page.evaluate('SR.idle.stop()');page.add_init_script("let s=JSON.parse(localStorage.sr_save_v1);if(s && !sessionStorage.wire2OfflineInjected){sessionStorage.wire2OfflineInjected=1;s.t=Date.now()-7200000;localStorage.sr_save_v1=JSON.stringify(s)}");page.reload();page.locator('#start').click();page.get_by_role('heading',name='离线收益').wait_for();shot('10_offline');page.locator('#sr-modal').click(position={'x':5,'y':5});assert not page.locator('#sr-modal').count()
  migration_original=page.evaluate('SR.save.export()')
  for version in [0,1,2]:
   page.evaluate('({version,base})=>{SR.idle.stop();let s=JSON.parse(base);s.v=version;s.t=Date.now();s.bag=[{uid:"wire-legacy",type:"gear",slot:version<2?"head":"crown",quality:1,stats:{atk:1},locked:true}];s.store=[{uid:"wire-store",type:"mat",quantity:7,locked:true}];s.map={mapId:"snow",floor:2,wave:1,bestFloor:3};delete s.flags.mapsCleared;if(version<2)delete s.world;else s.world={v:1,cleared:27,selected:"node-26",wave:3,rewards:{1:true,2:true,3:true}};localStorage.sr_save_v1=JSON.stringify(s)}',{'version':version,'base':migration_original})
   page.reload();page.locator('#start').click();page.wait_for_function('!SR.offline.claiming && !SR.idle.settling()')
   assert page.evaluate('SR.save.state.v===2 && SR.save.state.bag.some(e=>e.uid==="wire-legacy" && e.slot==="crown" && e.locked) && SR.save.state.store.some(e=>e.uid==="wire-store" && e.quantity===7)')
   assert page.evaluate('SR.save.state.world.cleared')==(27 if version==2 else 22),page.evaluate('JSON.stringify({v:SR.save.state.v,world:SR.save.state.world,map:SR.save.state.map})')
   if version in [0,2]:shot('wire2_legacy_v'+str(version))
  page.evaluate('(base)=>{SR.idle.stop();let s=JSON.parse(base);s.t=Date.now();localStorage.sr_save_v1=JSON.stringify(s)}',migration_original);page.reload();page.locator('#start').click()
  assert not errors,errors
  result={'consoleErrors':errors,'loadingBytes':initial_bytes,'firstBattleBytes':first_battle_bytes,'totalRequestedBytes':sum(traffic.values()),'kills':page.evaluate('SR.save.state.stats.kills'),'level':page.evaluate('SR.save.state.hero.level'),'screenshots':len(set(shot_names)),'screenshotCaptures':len(shot_names),'shotNames':shot_names,'legacyVersions':[0,1,2],'worldAndBagFixtures':'isolated bag items and near-boss node; actual grid actions, selection bus and battle tick; original save restored','equipmentFixture':'eight bamboo pieces rolled via SR.gear.roll; equipped through UI','browser':'webkit','viewport':{'width':390,'height':844}}
  (ROOT/'docs/e2e-integration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False));browser.close()
finally:server.terminate();server.wait()
