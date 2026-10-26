"""Read-only review fixtures. Run from any directory; artifacts go to /tmp."""
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
        page.on('response', lambda r: errors.append(str(r.status)+' '+r.url) if r.status >= 400 else None)
        page.goto('http://127.0.0.1:'+str(server.server_port)+'/index.html')
        page.locator('#start').click()
        page.locator('#opening-next').click()
        page.locator('[data-event="hero:awaken_request"]').first.click()
        page.locator('[data-event="class:choose"]').first.click()
        page.wait_for_function('!SR.idle.settling()')
        page.evaluate('''()=>{SR.idle.stop();let s=SR.save.state;s.bag=[{uid:'review-a',type:'mat'},{uid:'review-b',type:'mat',locked:true},{uid:'review-c',type:'mat'}];SR.ui.show('bag');}''')
        tile = page.locator('[data-bag-uid="review-a"]')
        box = tile.bounding_box()
        page.mouse.move(box['x']+box['width']/2, box['y']+box['height']/2)
        page.mouse.down()
        page.wait_for_timeout(650)
        page.mouse.up()
        after_hold = page.locator('.bg-grid [aria-pressed="true"]').count()
        page.locator('[data-bag-uid="review-c"]').click()
        after_next = page.locator('.bg-grid [aria-pressed="true"]').count()
        page.screenshot(path='/tmp/r5-longpress.png')
        result = {'longpress': {'selectedAfterHold': after_hold, 'selectedAfterNextClick': after_next}}
        # Deliberately non-multiple of a 50ms combat tick, with ample capacity.
        result['offlineRounding'] = page.evaluate('''()=>{const s=SR.save.state;s.bag=[];s.store=[];s.t=1000000;const r=SR.offline.claim(1060021);return {seconds:r.seconds,pausedSeconds:r.pausedSeconds,bag:s.bag.length,store:s.store.length,capacityPaused:SR.bag.full()};}''')
        page.wait_for_timeout(350)
        result['offlineNotice'] = page.locator('#sr-modal').inner_text() if page.locator('#sr-modal').count() else None
        page.screenshot(path='/tmp/r5-rounding.png')
        page.evaluate('SR.ui.close();SR.ui.show("world");SR.ui.show("battle");SR.battle.stop()')
        result['mapCleanup'] = page.evaluate('''()=>{let delta=0;const on=SR.bus.on,off=SR.bus.off;SR.bus.on=function(...a){delta++;return on(...a)};SR.bus.off=function(...a){delta--;return off(...a)};for(let i=0;i<100;i++){SR.ui.show('world');SR.worldmap.open('node-47');SR.ui.show('bag');SR.ui.show('battle');}SR.bus.on=on;SR.bus.off=off;return {subscriptionDelta:delta,overlays:document.querySelectorAll('.wm-overlay').length,stages:document.querySelectorAll('.sr-stage').length,width:document.documentElement.scrollWidth};}''')
        # Repeated selection, invalid selection and snapshot/save consistency.
        result['mapSelection'] = page.evaluate('''()=>{const s=SR.save.state;s.world={v:1,cleared:9,selected:'node-0',wave:1,rewards:{1:true}};SR.bus.emit('world:select_request',{nodeId:'node-8'});let snap=SR.battle.snapshot(),selected=s.world.selected;SR.bus.emit('world:select_request',{nodeId:'node-47'});SR.bus.emit('world:select_request',{nodeId:'unknown'});SR.battle.stop();return {selected,afterInvalid:s.world.selected,map:s.map.mapId,floor:s.map.floor,wave:s.map.wave,enemies:snap.enemies.length};}''')
        result['forestEggPreview'] = page.evaluate('''()=>{const preview=SR.progress.node('node-0').drops.eggPool;SR.rng.seed(4200);const actual=new Set();for(let i=0;i<100;i++)SR.loot.drop({kind:'lord',years:100,isBoss:true}).filter(e=>e.type==='egg').forEach(e=>actual.add(e.speciesId));return {preview,observed:[...actual].sort(),unlisted:[...actual].filter(id=>!preview.includes(id)).sort()};}''')
        result['errors'] = errors
        assert not errors, errors
        assert result['mapCleanup']['subscriptionDelta'] == 0
        assert result['mapCleanup']['overlays'] == 0
        assert result['mapCleanup']['width'] == 390
        assert result['mapSelection']['afterInvalid'] == 'node-8'
        print(json.dumps(result, ensure_ascii=False, indent=2))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
