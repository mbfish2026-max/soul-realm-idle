"""Read-only game audit; isolated WebKit state and /tmp evidence, no game writes."""
import functools
import http.server
import json
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.webkit.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('response', lambda r: errors.append(str(r.status) + ' ' + r.url) if r.status >= 400 else None)
        page.goto('http://127.0.0.1:' + str(server.server_port) + '/index.html')
        page.locator('#start').click()
        page.locator('#opening-next').click()
        page.locator('[data-event="hero:awaken_request"]').first.click()
        page.locator('[data-event="class:choose"]').first.click()
        page.locator('nav [data-tab="battle"]').click()
        result = {}
        page.evaluate('''()=>{
          SR.save.state.hero.level=10;
          const e=SR.loot.essence(51,false,{kind:'reed'});SR.bag.add(e);SR.ui.absorb(e.uid);
        }''')
        page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
        result['absorbLayout'] = page.evaluate('''()=>{
          const d=document.querySelector('.sr-dialog'),a=d.querySelector('.actions');
          return {viewport:document.documentElement.scrollWidth,dialogClient:d.clientWidth,
            dialogScroll:d.scrollWidth,actions:a.getBoundingClientRect().toJSON(),
            buttons:[...a.children].map(b=>({text:b.textContent,rect:b.getBoundingClientRect().toJSON()}))};
        }''')
        page.screenshot(path='/tmp/sr-review2-absorb.png')
        page.locator('#sr-modal').click(position={'x': 3, 'y': 3})
        result['capacityPaused'] = page.evaluate('''()=>{
          const s=SR.save.state; SR.rng.seed(4200);
          while(s.store.length<991) SR.bag.add(SR.gear.roll(1),'store');
          SR.battle.tick(100);
          return {capacity:SR.bag.capacityStatus(),running:SR.battle.snapshot().running,
            text:document.body.innerText,buttons:[...document.querySelectorAll('button')].map(b=>b.textContent)};
        }''')
        page.screenshot(path='/tmp/sr-review2-capacity.png')
        page.locator('nav [data-tab="bag"]').click()
        page.locator('[data-event="gear:action"][data-payload*="warehouse"]').click()
        page.locator('[data-event="gear:action"][data-payload*="where"][data-payload*="store"]').click()
        page.locator('.gg-item [data-event="gear:action"]').first.click()
        page.locator('#sr-modal [data-payload*="confirmOne"]').click()
        page.locator('[data-event="gear:salvage"]').click()
        page.locator('nav [data-tab="battle"]').click()
        page.locator('#auto-toggle').click()
        page.locator('#auto-toggle').click()
        page.wait_for_timeout(1200)
        result['afterCleanupAndToggle'] = page.evaluate('''()=>({capacity:SR.bag.capacityStatus(),
          running:SR.battle.snapshot().running,auto:SR.auto.config().enabled})''')
        # Source-derived late-game fixtures, explicitly not natural collection evidence.
        result['redRing'] = page.evaluate('''()=>{
          SR.idle.stop(); const s=SR.save.state;s.store=[];s.bag=[];s.hero.level=99;
          const pool=Object.values(SR.DATA.ringSkillPools)[0];
          s.hero.rings=[{years:100000,color:'red',sourceKind:pool.kind,skillBranch:0,
            vein:'wind',skillId:pool.slots[1][0]}];SR.skills.init();SR.ui.show('skills');
          return {entries:SR.skills.entries({side:'hero'}),
            displayedSkills:[...document.querySelectorAll('.skill-row b')].map(b=>b.textContent),
            learnButtons:[...document.querySelectorAll('[data-event="skill:learn"]')].map(b=>JSON.parse(b.dataset.payload).id)};
        }''')
        page.screenshot(path='/tmp/sr-review2-red-ring.png')
        result['newMap'] = page.evaluate('''()=>{
          SR.save.state.map={mapId:'snow',floor:1,wave:1,bestFloor:1};SR.battle.start();SR.ui.show('battle');
          return {caption:document.querySelector('.sr-caption').textContent,
            enemies:SR.battle.snapshot().enemies.map(e=>e.kind),
            images:[...document.querySelectorAll('.sr-enemy img')].map(i=>i.getAttribute('src'))};
        }''')
        page.wait_for_timeout(1100)
        page.screenshot(path='/tmp/sr-review2-snow.png')
        result['offline12h'] = page.evaluate('''()=>{
          SR.save.state.t=Date.now()-43200000;let start=performance.now();
          const r=SR.offline.claim();const saved=SR.save.save();
          return {ms:Math.round(performance.now()-start),seconds:r.seconds,items:r.items.length,
            blackOrRed:r.items.filter(e=>e.type==='essence'&&e.years>=10000).length,
            capacity:SR.bag.capacityStatus(),saveChars:JSON.stringify(SR.save.state).length,saved};
        }''')
        page.locator('#auto-settings').click()
        expected = {'enabled': False, 'healThreshold': .7, 'reserveBossFusion': True,
                    'advance': False, 'challengeBoss': False, 'absorb': True,
                    'absorbRate': .8, 'fitOnly': False, 'sell': True, 'sellQuality': 3}
        for key, value in expected.items():
            control = page.locator('[data-auto="' + key + '"]')
            if isinstance(value, bool):
                control.set_checked(value)
            else:
                control.select_option(str(value))
        result['settingsBeforeReload'] = page.evaluate('SR.auto.config()')
        page.reload()
        page.locator('#start').click()
        result['settingsAfterReload'] = page.evaluate('SR.auto.config()')
        assert all(result['settingsAfterReload'][k] == v for k, v in expected.items())
        # Count presentation subscriptions and nodes across repeated mount/destroy.
        result['stageCleanup'] = page.evaluate('''()=>{
          SR.idle.stop();const on=SR.bus.on,off=SR.bus.off;let balance=0;
          SR.bus.on=function(n,f){balance++;return on(n,f);};
          SR.bus.off=function(n,f){balance--;return off(n,f);};
          const before=document.querySelectorAll('*').length;
          for(let i=0;i<100;i++){SR.ui.show('hero');SR.ui.show('battle');}
          SR.bus.on=on;SR.bus.off=off;
          return {subscriptionDelta:balance,beforeNodes:before,
            afterNodes:document.querySelectorAll('*').length,stageCount:document.querySelectorAll('.sr-stage').length,
            canvasCount:document.querySelectorAll('canvas').length};
        }''')
        result['errors'] = errors
        print(json.dumps(result, ensure_ascii=False, indent=2))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
