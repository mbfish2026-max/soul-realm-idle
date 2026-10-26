"""View review regressions, real WebKit clicks with explicit late-game fixtures."""
import functools, http.server, json, threading
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
  page = browser.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, accept_downloads=True)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto('http://127.0.0.1:'+str(server.server_port)+'/index.html')
  page.locator('#start').click()
  page.locator('#opening-next').wait_for()
  page.locator('#sr-modal').click(position={'x':3,'y':3})
  page.get_by_role('button',name='继续觉醒',exact=True).click()
  page.locator('#sr-modal .close').click()
  page.locator('nav [data-tab="pets"]').click()
  page.get_by_role('button',name='继续觉醒',exact=True).click()
  page.locator('[data-event="hero:awaken_request"]').first.click()
  page.locator('#sr-modal').click(position={'x':3,'y':3})
  page.get_by_role('button',name='继续选择修行之路',exact=True).click()
  page.locator('[data-event="class:choose"]').first.click()
  assert page.evaluate('SR.save.state.flags.awakened && !!SR.save.state.hero.classId')
  page.locator('nav [data-tab="battle"]').click()
  page.evaluate('SR.idle.stop()')
  # Nine bound active skills, deliberately long display names.
  page.evaluate('''()=>{const s=SR.save.state;s.hero.level=99;s.hero.rings=[];
  for(let i=1;i<=9;i++){const sk=SR.DATA.classSkills.find(x=>x.classId===s.hero.classId&&x.ring===i&&x.kind!=='passive');sk.name='长名称可读性回归技能第'+i+'式';s.hero.rings.push({skillId:sk.id,years:100000,color:'red',vein:sk.vein});}
  SR.skills.init();SR.ui.show('battle');SR.ui.autoHud();}''')
  assert page.locator('#manual-skills [data-cast]').count()==9
  assert page.evaluate('''()=>{const h=document.querySelector('#manual-skills');return h.scrollWidth>h.clientWidth && [...h.querySelectorAll('button')].every(b=>b.clientWidth>=70 && [...b.children].every(c=>c.scrollWidth<=b.clientWidth));}''')
  page.locator('#manual-fusion').scroll_into_view_if_needed()
  before=page.locator('#manual-skills').evaluate('(e)=>e.scrollLeft')
  page.wait_for_timeout(600)
  assert page.locator('#manual-skills').evaluate('(e)=>e.scrollLeft')==before
  assert page.evaluate('document.documentElement.scrollWidth===390')
  assert page.locator('.sr-page-battle>.paper').bounding_box()['y']+page.locator('.sr-page-battle>.paper').bounding_box()['height']<=page.locator('nav').bounding_box()['y']
  page.screenshot(path='/tmp/fix-view-nine-rings.png')
  page.evaluate('SR.ui.show("hero")')
  assert page.locator('.wire-hero-idle').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
  assert page.evaluate('''()=>{const el=document.createElement('div');document.body.append(el);const a=SR.actor.create({el,sprites:{idle:{file:'assets/frames/hero_idle@1x.webp',frames:4,fw:100,fh:100,fps:4}}});const ok=getComputedStyle(el.querySelector('.sr-pose')).animationName==='none';a.destroy();el.remove();return ok;}''')
  # A caught storage error must remain visible across navigation; export is exact state.
  page.evaluate('window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException("full","QuotaExceededError")};SR.save.save()')
  page.locator('#save-warning').wait_for()
  page.locator('nav [data-tab="pets"]').click()
  assert page.locator('#save-warning').is_visible()
  with page.expect_download() as download:
   page.locator('[data-save-export]').click()
  exported=json.loads(Path(download.value.path()).read_text())
  assert exported['hero']['level']==99 and len(exported['hero']['rings'])==9
  page.evaluate('()=>{Storage.prototype.setItem=window.originalSet;}')
  page.locator('[data-save-retry]').click()
  assert page.locator('#save-warning').count()==0
  # Names are configurable at runtime on each render, including strategy descriptions.
  page.evaluate('SR.NAMES.ringSkill="改名技能";SR.NAMES.soulRing="改名环";SR.ui.autoSettings()')
  assert '改名技能' in page.locator('.sr-dialog').inner_text()
  assert '改名环' in page.locator('.sr-dialog').inner_text()
  assert not errors,errors
  print('view regressions: R-01/R-03/R-08/R-09/R-10 passed; WebKit 390x844; errors=0')
  browser.close()
finally: server.shutdown();server.server_close()
