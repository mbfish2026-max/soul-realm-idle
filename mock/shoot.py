# usage: python3 shoot.py  -> shots/*.png ；每页: (名字, [(动作js, 等待ms)...]) 真实时间轴截图
import asyncio,sys
from playwright.async_api import async_playwright
P={
 'p1_ring_stage':[(None,1300),('DEMO.castSkill(1)',820)],
 'p2_boss':[(None,1200),('bossPhase()',1500)],
 'p3_absorb':[(None,2600)],
}
SEQ={'seq_skill':('p1_ring_stage','DEMO.castSkill(1)',[0,130,300,500,700,1100]),
     'seq_fusion':('p1_ring_stage','DEMO.fusion()',[100,350,520,700,1000,2300])}
async def main():
  async with async_playwright() as p:
    b=await p.webkit.launch()
    for n,steps in P.items():
      if len(sys.argv)>1 and n not in sys.argv: continue
      pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
      await pg.goto(f'file:///workspace/design/douluo_battle_mock/{n}.html')
      for js,w in steps:
        if js: await pg.evaluate(js)
        await pg.wait_for_timeout(w)
      await pg.screenshot(path=f'shots/{n}.png');print(n);await pg.close()
    for n,(page,js,ts) in SEQ.items():
      if len(sys.argv)>1 and n not in sys.argv: continue
      for k,t in enumerate(ts):
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
        await pg.goto(f'file:///workspace/design/douluo_battle_mock/{page}.html');await pg.wait_for_timeout(1300)
        await pg.evaluate(js);await pg.wait_for_timeout(t)
        await pg.screenshot(path=f'shots/_{n}_{k}.png',clip={'x':0,'y':120,'width':390,'height':420});await pg.close()
      from PIL import Image,ImageDraw
      ims=[Image.open(f'shots/_{n}_{k}.png') for k in range(len(ts))];o=Image.new('RGB',(390*3,450*2),'#f3eee2');d=ImageDraw.Draw(o)
      for k,im in enumerate(ims):
        x,y=(k%3)*390,(k//3)*450;o.paste(im,(x,y+30))
        d.text((x+10,y+8),f'{t} ms'.replace(str(t),str(ts[k])),fill='#b5302a')
      o.save(f'shots/{n}.png');print(n)
    await b.close()
asyncio.run(main())
