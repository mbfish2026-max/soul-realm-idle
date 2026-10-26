"""Read-only WebKit review fixtures; evidence goes to /tmp only."""
import functools,http.server,threading,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  b=p.webkit.launch();page=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  errors=[];traffic={}
  page.on('response',lambda r:traffic.update({r.url:int(r.headers.get('content-length','0'))}))
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto('http://127.0.0.1:'+str(srv.server_port)+'/index.html')
  page.wait_for_function('!document.querySelector("#start").disabled');loading_bytes=sum(traffic.values())
  page.locator('#start').click();page.locator('#opening-next').click()
  page.locator('[data-event="hero:awaken_request"]').first.click();page.locator('[data-event="class:choose"]').first.click()
  page.locator('nav [data-tab="battle"]').click()
  page.wait_for_timeout(500);first_battle_bytes=sum(traffic.values())
  page.locator('#auto-settings').click()
  expected={'enabled':False,'healThreshold':.7,'reserveBossFusion':True,'advance':False,'challengeBoss':False,'absorb':True,'absorbRate':.8,'fitOnly':False,'sell':True,'sellQuality':3}
  for key,value in expected.items():
   c=page.locator('[data-auto="'+key+'"]')
   if isinstance(value,bool):c.set_checked(value)
   else:c.select_option(str(value))
  page.reload();page.locator('#start').click();page.wait_for_function('!SR.idle.settling()')
  settings=page.evaluate('SR.auto.config()');assert all(settings[k]==v for k,v in expected.items())
  page.evaluate('''()=>{SR.auto.update({enabled:true,advance:true,challengeBoss:true,absorb:false});SR.idle.stop();const s=SR.save.state;s.hero.level=50;s.pets=[];s.team.pets=[];
  for(let i=0;i<3;i++){let e={uid:'review-egg-'+i,type:'egg',speciesId:['fox','turtle','deer'][i]};s.bag.push(e);let p=SR.pets.hatch(e.uid);SR.pets.deploy(p.uid);}
  SR.battle.start();SR.ui.show('battle');}''')
  result={'loadingBytes':loading_bytes,'firstBattleBytes':first_battle_bytes,'settingsPersisted':True,'thirdPet':page.evaluate('''()=>({slots:SR.pets.slots(),team:SR.save.state.team.pets.length,battlePets:SR.battle.snapshot().pets.length,stagePets:Object.keys(SR.stage.current.actors).filter(k=>k.startsWith('pet:')).length})''')}
  page.screenshot(path='/tmp/review3-third-pet.png')
  page.locator('nav [data-tab="pets"]').click();result['petFooter']=page.locator('.sr-page-pets>.muted').inner_text()
  page.screenshot(path='/tmp/review3-pets.png')
  result['cleanup']=page.evaluate('''()=>{SR.battle.stop();SR.ui.show('battle');const before=document.querySelectorAll('*').length;let n=0;const on=SR.bus.on,off=SR.bus.off;SR.bus.on=function(...a){n++;return on(...a)};SR.bus.off=function(...a){n--;return off(...a)};for(let i=0;i<100;i++){SR.ui.show('hero');SR.ui.show('battle')}SR.bus.on=on;SR.bus.off=off;return {subscriptionDelta:n,before,after:document.querySelectorAll('*').length,stage:document.querySelectorAll('.sr-stage').length,canvas:document.querySelectorAll('canvas').length}}''')
  page.evaluate('''()=>{SR.idle.stop();const s=SR.save.state;s.bag=[];s.store=[];s.t=Date.now()-7200000;localStorage.setItem('sr_save_v1',JSON.stringify(s));}''')
  page.reload();page.wait_for_function('!document.querySelector("#start").disabled')
  page.evaluate('''()=>{window.audit={rewards:0,status:0};SR.bus.on('offline:reward',r=>{audit.rewards++;audit.seconds=r.seconds;audit.items=r.items.length;});SR.bus.on('offline:status',s=>{audit.status++;if(!s.claiming)audit.done=true;});}''')
  page.locator('#start').click();page.wait_for_function('window.audit.done===true');page.wait_for_timeout(400)
  result['offline']=page.evaluate('''()=>({...audit,dialog:document.querySelector('#sr-modal')?.innerText||null,claiming:SR.offline.claiming,level:SR.save.state.hero.level,width:document.documentElement.scrollWidth})''')
  page.screenshot(path='/tmp/review3-offline.png')
  result['offlineAudio']=page.evaluate('''async()=>{SR.idle.stop();await SR.audio2.unlock();const C=window.AudioContext||window.webkitAudioContext,original=C.prototype.createOscillator;let offlineOscillators=0;C.prototype.createOscillator=function(...a){if(SR.offline.simulating)offlineOscillators++;return original.apply(this,a)};try{SR.save.state.t=Date.now()-120000;await SR.offline.claimAsync();return {offlineOscillators}}finally{C.prototype.createOscillator=original}}''')
  assert loading_bytes<2000000 and first_battle_bytes<2000000
  assert not errors,errors
  result['errors']=errors
  print(json.dumps(result,ensure_ascii=False,indent=2));b.close()
finally:srv.shutdown();srv.server_close()
