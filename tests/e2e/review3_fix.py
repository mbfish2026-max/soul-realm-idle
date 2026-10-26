"""Regression coverage for asynchronous reward UI and the third stage companion."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[2]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
 with sync_playwright() as p:
  browser = p.webkit.launch()
  page = browser.new_page(viewport={'width':390, 'height':844}, is_mobile=True, has_touch=True)
  errors = []
  page.on('pageerror', lambda e: errors.append(str(e)))
  page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
  page.on('response', lambda r: errors.append(str(r.status)) if r.status >= 400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
  page.locator('#start').click(); page.locator('#opening-next').click()
  page.locator('[data-event="hero:awaken_request"]').first.click()
  page.locator('[data-event="class:choose"]').first.click()
  page.wait_for_function('!SR.idle.settling()')
  page.evaluate('''()=>{SR.idle.stop();SR.ui.close();let s=SR.save.state;s.hero.level=49;s.pets=[];s.team.pets=[];
   for(let i=0;i<3;i++){let e={uid:'egg'+i,type:'egg',speciesId:['fox','turtle','deer'][i]};s.bag.push(e);SR.pets.hatch(e.uid);}
   SR.pets.deploy(s.pets[0].uid);SR.pets.deploy(s.pets[1].uid);SR.ui.show('battle');}''')
  assert page.locator('.sr-pet').count() == 2
  page.evaluate('SR.save.state.hero.level=50;SR.pets.deploy(SR.save.state.pets[2].uid);SR.battle.start()')
  assert page.locator('.sr-pet').count() == 3
  assert page.locator('.sr-pet .sr-hp').count() == 3
  page.screenshot(path='/tmp/fix3-three-pets.png')
  page.evaluate('SR.pets.deploy(SR.save.state.pets[1].uid)')
  assert page.locator('.sr-pet').count() == 2
  page.evaluate('SR.pets.deploy(SR.save.state.pets[1].uid);SR.battle.stop();SR.save.save()')
  page.reload();page.locator('#start').click();page.wait_for_function('!SR.idle.settling()')
  assert page.locator('.sr-pet').count() == 3
  page.evaluate("SR.idle.stop();SR.save.state.t=Date.now()-43200000;localStorage.setItem('sr_save_v1',JSON.stringify(SR.save.state))")
  page.reload();page.locator('#start').click()
  page.get_by_role('heading', name='离线收益').wait_for()
  assert '720 分钟' in page.locator('#sr-modal').inner_text()
  page.evaluate('SR.ui.close()')
  page.evaluate('''()=>{SR.idle.stop();SR.ui.close();SR.ui.modal('busy','<h2>当前操作</h2>');
   SR.bus.emit('offline:reward',{seconds:43200,crystal:123,exp:456,items:[{type:'egg'},{type:'gear'},{type:'essence'}],pausedSeconds:1});
   SR.bus.emit('offline:status',{claiming:false});}''')
  assert page.get_by_role('heading', name='当前操作').count() == 1
  page.evaluate('SR.ui.close()')
  page.get_by_role('heading', name='离线收益').wait_for()
  text = page.locator('#sr-modal').inner_text()
  assert '720 分钟' in text and '兽卵 × 1' in text and '装备 × 1' in text and '容量不足' in text
  page.evaluate('SR.ui.close()');page.wait_for_timeout(400)
  assert page.locator('#sr-modal').count() == 0
  # Exercise the actual startup rejection and the visible retry, retaining the save cursor.
  page.evaluate('''()=>{const original=SR.offline.claimAsync;SR.offline.claimAsync=function(){SR.offline.claimAsync=original;return Promise.reject(Error('fixture'));};SR.idle.start().catch(()=>{});}''')
  page.get_by_role('button', name='重试结算').wait_for()
  page.get_by_role('button', name='重试结算').click()
  page.wait_for_function('!SR.idle.settling() && !document.querySelector("#offline-status")')
  assert page.evaluate('document.documentElement.scrollWidth<=390')
  assert not errors, errors
  print('review3_fix: third pet, reload, deferred 12h summary, capacity text, single display and error retry passed; errors=0')
  browser.close()
finally:
 server.shutdown();server.server_close()
