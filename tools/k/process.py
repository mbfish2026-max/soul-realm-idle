"""Only crop/normalize/compress image_gen pixels; never draw replacements."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
CAT=json.loads((ROOT/'tools/k/catalog.json').read_text())
def process():
 manifest={}
 for a in CAT:
  source=ROOT/'tools/k/raw'/f"{a['key']}.png"
  if not source.exists():continue
  im=Image.open(source).convert('RGBA')
  bbox=im.getchannel('A').point(lambda a: 255 if a>200 else 0).getbbox()
  if not bbox:raise ValueError(source)
  im=im.crop(bbox)
  w,h=a['w'],a['h']
  # Flexible UI frames/bars are intentionally normalized to their target aspect.
  flexible=any(x in a['key'] for x in ['panel','modal','button_','bar_','tab_','divider'])
  if flexible:
   im=im.resize((w-8,h-4),Image.Resampling.LANCZOS)
  else:
   im.thumbnail((round(w*.84),round(h*.84)),Image.Resampling.LANCZOS)
  out=Image.new('RGBA',(w,h),(0,0,0,0))
  out.alpha_composite(im,((w-im.width)//2,(h-im.height)//2))
  if a['key']=='ui2_skill_cooldown':
   out.putalpha(out.getchannel('A').point(lambda x: round(x*.55)))
  dest=ROOT/'assets/ui2'/f"{a['key']}.webp"
  out.save(dest,'WEBP',quality=88,method=6)
  assert dest.stat().st_size<=300000,dest
  m=dict(file=str(dest.relative_to(ROOT)),w=w,h=h,use=a['subject'],source='image_gen')
  if 'slice' in a:m['slice']=a['slice']
  manifest[a['key']]=m
 target=ROOT/'assets/ui2'
 (target/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 (target/'manifest.js').write_text('(function (g) {\n  g.SR = g.SR || {};\n  g.SR.ASSETS = Object.assign(g.SR.ASSETS || {}, '+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n})(typeof window !== "undefined" ? window : globalThis);\n')
 print(f'{len(manifest)}/{len(CAT)} assets processed')
if __name__=='__main__':process()
