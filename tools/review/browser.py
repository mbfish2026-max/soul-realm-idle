import subprocess,time,sys,tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
srv=subprocess.Popen(['python3','-m','http.server','8766','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(.3)
try:
 with sync_playwright() as p:
  b=p.webkit.launch();page=b.new_page(viewport={'width':390,'height':844});errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
  page.goto('http://127.0.0.1:8766');page.locator('#start').click();page.locator('#sr-modal').click(position={'x':5,'y':5})
  print('dismiss opening',page.evaluate('({awakened:SR.save.state.flags.awakened,running:SR.battle.snapshot().running,buttons:Array.from(document.querySelectorAll("button")).map(b=>b.textContent)})'))
  page.reload();page.locator('#start').click();page.locator('#opening-next').click();page.locator('[data-event="hero:awaken_request"]').first.click();page.locator('[data-event="class:choose"]').first.click()
  # Late-game normal ring build; inspect all manual buttons, not only page scroll width.
  print('late layout',page.evaluate('''()=>{SR.idle.stop();const s=SR.save.state;s.hero.level=99;const pool=Object.values(SR.DATA.ringSkillPools)[0];s.hero.rings=Array.from({length:9},(_,i)=>({years:100000,color:'red',vein:'wind',sourceKind:pool.kind,skillBranch:0,skillId:pool.slots[i+1][0]}));SR.skills.init();SR.battle.start();SR.ui.show('battle');SR.ui.autoHud();return {width:document.documentElement.scrollWidth,buttons:Array.from(document.querySelectorAll('#manual-skills button')).map(e=>({text:e.textContent,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),paper:document.querySelector('.sr-page-battle>.paper').getBoundingClientRect().bottom,nav:document.querySelector('nav').getBoundingClientRect().top}}'''))
  page.screenshot(path=str(Path(tempfile.gettempdir())/'sr-review-nine-rings.png'))
  print('strip',page.evaluate('''()=>{const s=SR.save.state;const before=s.hero.rings.map(r=>r.skillId);SR.rings.strip(0);return {before,after:s.hero.rings.map(r=>r.skillId),slot7Allowed:SR.ringSkill.allowed(s.hero.rings[6],6)}}'''))
  print('locked ring',page.evaluate('''()=>{let s=SR.save.state;let e=SR.loot.essence(100000,false,{kind:Object.keys(SR.DATA.ringSkillPools)[0]});e.locked=true;SR.bag.add(e);const rng=SR.rng;SR.rng=()=>0;let r=SR.rings.absorb(e.uid);SR.rng=rng;return {ok:r.ok,kept:s.bag.some(x=>x.uid===e.uid)}}'''))
  if '--quick' in sys.argv:
   print('errors',errs);b.close();sys.exit(0)
  print('offline12h',page.evaluate('''()=>{let s=SR.save.state;s.t=Date.now()-43200000;let start=performance.now();let r=SR.offline.claim();return {ms:Math.round(performance.now()-start),items:r.items.length,store:s.store.length,saveBytes:JSON.stringify(s).length}}'''))
  for cycle in range(2,5):
   print('offline-cycle',cycle,page.evaluate('''()=>{let s=SR.save.state;s.t=Date.now()-43200000;let start=performance.now();SR.offline.claim();let ok=SR.save.save();return {ms:Math.round(performance.now()-start),store:s.store.length,saveChars:JSON.stringify(s).length,saved:ok,error:SR.save.lastError&&SR.save.lastError.name}}'''),flush=True)
  print('errors',errs);b.close()
finally:srv.terminate();srv.wait()
