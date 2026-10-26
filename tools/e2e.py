"""Real mobile WebKit journey; accelerated ticks are injected only by this runner."""
import json, subprocess, time, threading, http.server, functools
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(.5)
try:
 with sync_playwright() as p:
  browser=p.webkit.launch(); page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  page.set_default_timeout(10000)
  errors=[]; page.on('pageerror',lambda e:errors.append(str(e))); page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('response',lambda r:errors.append('HTTP '+str(r.status)+' '+r.url) if r.status>=400 else None)
  traffic={};page.on('response',lambda r:traffic.update({r.url: int(r.headers.get('content-length','0'))}))
  shots=ROOT/'docs/shots';shots.mkdir(exist_ok=True)
  def shot(name):
   page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
   page.screenshot(path=str(shots/('int_'+name+'.png')))
   assert page.evaluate('document.documentElement.scrollWidth<=390'),name+' overflow'
   assert 'undefined' not in page.locator('body').inner_text(),name+' missing display name'
  def tab(name):page.locator('nav [data-tab="'+name+'"]').click()
  def advance(ms):
   page.evaluate('(ms)=>{for(let i=0;i<ms;i+=100)SR.battle.tick(100)}',ms);page.wait_for_timeout(300)
  page.goto('http://127.0.0.1:8765/index.html');page.wait_for_function('!document.querySelector("#start").disabled');shot('00_loading')
  initial_bytes=sum(traffic.values());page.locator('#start').click();page.locator('#opening-next').wait_for();shot('01_opening');page.locator('#opening-next').click();shot('02_awaken');page.locator('[data-event="hero:awaken_request"]').first.click()
  shot('skill_class');page.locator('[data-event="class:choose"]').first.click();shot('skill_tree');tab('battle')
  assert page.evaluate('SR.audio.isUnlocked()')
  page.wait_for_timeout(300);first_battle_bytes=sum(traffic.values())
  page.evaluate('SR.rng.seed(42);window.bossSeen=false;SR.bus.on("battle:boss_phase",()=>window.bossSeen=true)')
  advance(60000);shot('03_battle');assert page.evaluate('SR.save.state.stats.kills>0');assert page.evaluate('SR.save.state.bag.length>0')
  # Continue real combat until first ring slot is available.
  for _ in range(25):
   if page.evaluate('SR.save.state.hero.level>=10'):break
   advance(60000)
  assert page.evaluate('SR.save.state.hero.level>=10')
  tab('bag');shot('04_bag')
  for _ in range(12):
   page.locator('[data-event="ui:absorb_open"]').first.click();shot('05_absorb');page.locator('[data-event="ring:absorb_request"]').click();page.wait_for_timeout(350)
   assert not page.locator('#sr-modal').count(),page.evaluate('JSON.stringify({hero:SR.save.state.hero,item:SR.save.state.bag[0]})')
   if page.evaluate('SR.save.state.hero.rings.length>0'):break
  assert page.evaluate('SR.save.state.hero.rings.length>0')
  tab('bag');page.locator('[data-event="ui:absorb_open"]').first.click();page.locator('[data-event="ui:ring_replace"]').first.click();shot('skill_replace');page.locator('[data-event="ring:replace"]').click();page.wait_for_timeout(200)
  tab('skills');shot('skill_tree');assert page.evaluate('SR.skills.entries({side:"hero"})[0].id===SR.save.state.hero.rings[0].skillId')
  tab('pets');page.locator('[data-event="pet:hatch_request"]').first.click();shot('06_pets');page.locator('[data-event="pet:feed_request"]').click();page.locator('[data-event="pet:deploy_request"]').click();assert page.evaluate('SR.save.state.pets[0].step>1');assert page.evaluate('SR.save.state.team.pets.length==1')
  tab('bag')
  if page.locator('[data-event="gear:equip"]').count():
   page.locator('[data-event="gear:equip"]').first.click();assert page.evaluate('Object.keys(SR.save.state.hero.bones).length>0')
  tab('hero');shot('07_hero')
  tab('battle');page.evaluate('for(let i=0;i<360000;i+=100){if(SR.battle.snapshot().enemies.some(e=>e.isBoss))break;SR.battle.tick(100)}');page.wait_for_timeout(200);shot('08_boss');assert page.evaluate('SR.battle.snapshot().enemies.some(e=>e.isBoss)')
  saved=page.evaluate('SR.save.save();SR.save.state.hero.soulId');page.reload();page.locator('#start').click();assert page.evaluate('SR.save.state.hero.soulId')==saved;shot('09_reload')
  page.evaluate('SR.idle.stop()');page.add_init_script("let s=JSON.parse(localStorage.sr_save_v1);if(s){s.t=Date.now()-7200000;localStorage.sr_save_v1=JSON.stringify(s)}");page.reload();page.locator('#start').click();page.get_by_role('heading',name='离线收益').wait_for();shot('10_offline');page.locator('#sr-modal').click(position={'x':5,'y':5});assert not page.locator('#sr-modal').count()
  assert not errors,errors
  result={'consoleErrors':errors,'loadingBytes':initial_bytes,'firstBattleBytes':first_battle_bytes,'totalRequestedBytes':sum(traffic.values()),'kills':page.evaluate('SR.save.state.stats.kills'),'level':page.evaluate('SR.save.state.hero.level'),'screenshots':14}
  (ROOT/'docs/e2e-integration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False));browser.close()
finally:server.terminate();server.wait()
