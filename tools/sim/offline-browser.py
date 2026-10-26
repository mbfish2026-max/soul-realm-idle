"""WebKit responsiveness fixture, not a natural progression or UI acceptance run."""
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
        page.on('response', lambda r: errors.append('HTTP ' + str(r.status)) if r.status >= 400 else None)
        page.goto('http://127.0.0.1:' + str(server.server_port) + '/index.html')
        page.wait_for_function('!document.querySelector("#start").disabled')
        page.evaluate('''() => {
          const s=SR.save.state=SR.save.create();
          s.flags.awakened=true;s.hero.classId='blade';s.hero.soulId='blade';s.hero.level=99;
          s.map={mapId:'snow',floor:5,wave:1,bestFloor:5};s.t=Date.now()-43200000;
          localStorage.setItem('sr_save_v1',JSON.stringify(s));
          window.audit={beats:0,rewards:0,chunks:0,parallelBattle:false,maxGap:0};
          let last=performance.now();
          const timer=setInterval(()=>{const n=performance.now();audit.maxGap=Math.max(audit.maxGap,n-last);last=n;audit.beats++;},0);
          SR.bus.on('offline:status',p=>{if(p.claiming){audit.chunks++;audit.parallelBattle ||= SR.battle.snapshot().running;}});
          SR.bus.on('offline:reward',r=>{audit.rewards++;audit.reward={seconds:r.seconds,pausedSeconds:r.pausedSeconds,items:r.items.length};});
          SR.idle.start().then(()=>{clearInterval(timer);audit.resumed=SR.battle.snapshot().running;audit.claiming=SR.offline.claiming;SR.idle.stop();audit.done=true;},e=>{audit.error=String(e);audit.done=true;});
        }''')
        page.wait_for_function('window.audit.done', timeout=60000)
        result = page.evaluate('window.audit')
        assert not result.get('error'), result
        assert result['beats'] > 1 and result['chunks'] > 2, result
        assert result['rewards'] == 1 and not result['parallelBattle'] and not result['claiming'], result
        assert result['reward']['pausedSeconds'] > 0 and not result['resumed'], result
        assert result['maxGap'] < 200, result
        assert not errors, errors
        print(json.dumps({'fixture': 'level 99 snow, 12h, real idle.start', 'audit': result, 'errors': errors}, ensure_ascii=False))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
