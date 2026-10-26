"""BAG mobile acceptance; explicit fixtures isolate inventory states from loot RNG."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,time,json
root=Path(__file__).resolve().parents[3]
server=subprocess.Popen(['python3','-m','http.server','8771','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 time.sleep(.5)
 with sync_playwright() as p:
  browser=p.webkit.launch();page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto('http://127.0.0.1:8771');page.wait_for_function('window.SR && SR.save && SR.ui && SR.gear')
  page.evaluate('''()=>{let s=SR.save.state;s.flags.awakened=true;s.hero.classId='blade';s.hero.soulId='blade';s.hero.level=40;s.t=Date.now();SR.save.save();}''')
  page.locator('#start').click();page.wait_for_timeout(500)
  page.evaluate('''()=>{SR.idle.stop();SR.battle.stop();SR.ui.close();let s=SR.save.state;s.bag=[];s.store=[];s.bagCap=20;s.cur.crystal=1000;for(let i=0;i<5;i++){let e=SR.gear.roll(20,()=>.1);e.quality=i;e.locked=i===0;SR.bag.add(e);}for(let y of [10,100,1000,10000,100000])SR.bag.add({type:'essence',years:y,vein:'wind',skillId:'cut'});SR.bag.add({type:'egg',speciesId:'fox',grade:0});SR.bag.add({type:'mat',count:23});SR.ui.show('bag');}''')
  shots=root/'docs/shots';shots.mkdir(exist_ok=True)
  def shot(name):
   page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth)')
   assert page.evaluate('document.documentElement.scrollWidth<=390')
   page.screenshot(path=str(shots/('bag_'+name+'.png')))
  def action(a):page.locator('[data-event="bag:grid"][data-payload*="'+a+'"]').first.click()
  shot('grid');assert page.locator('.bg-grid').evaluate('(e)=>getComputedStyle(e).gridTemplateColumns.split(" ").length')==5
  page.locator('.bg-grid .bg-slot').nth(1).click();shot('detail');action('cancel') if page.locator('[data-payload*=cancel]').count() else page.locator('#sr-modal').click(position={'x':2,'y':2})
  # Long press enters multi mode; release-generated click must not undo selection.
  target=page.locator('.bg-grid .bg-slot').nth(1);box=target.bounding_box();page.mouse.move(box['x']+20,box['y']+20);page.mouse.down();page.wait_for_timeout(600);page.mouse.up();assert page.locator('.bg-batch').count();assert page.locator('.bg-slot:disabled').count()==1
  shot('multi');action('select');action('confirm');shot('batch_confirm');before=page.evaluate('SR.save.state.bag.length');action('execute');assert page.evaluate('SR.save.state.bag.length')<before;assert page.evaluate('SR.save.state.bag.some(e=>e.locked)')
  action('multi')
  page.evaluate('''()=>{let s=SR.save.state;while(s.bag.length<s.bagCap)SR.bag.add({type:'mat'});SR.auto.update({sell:true,sellQuality:1});let e=SR.gear.roll(1,()=>.1);SR.auto.receive(e);let lock=SR.gear.roll(1,()=>.1);lock.locked=true;SR.auto.receive(lock);SR.ui.show('bag');}''')
  assert page.evaluate('SR.save.state.store.length===1');shot('full');page.locator('.bg-location button').nth(1).click();shot('store')
  page.locator('.bg-tabs button').nth(1).click();shot('filter');page.locator('[data-bag-sort]').select_option('new');action('tidy')
  page.evaluate('SR.save.state.store=[];SR.save.state.bag=[];SR.ui.show("bag");SR.save.state.t=Date.now();SR.save.save()');shot('empty')
  page.reload();page.locator('#start').click();page.wait_for_timeout(500);page.evaluate('SR.idle.stop();SR.battle.stop();SR.ui.close();SR.ui.show("bag")');assert page.evaluate('SR.save.state.bag.length===0');shot('reload')
  assert not errors,errors
  print(json.dumps({'browser':'webkit','viewport':[390,844],'errors':errors,'shots':len(list(shots.glob('bag_*.png')))},ensure_ascii=False));browser.close()
finally:server.terminate()
