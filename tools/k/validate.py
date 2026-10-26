"""Decode every delivery, inspect alpha, and persist reproducible numeric QA."""
import hashlib,json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'assets/ui2/manifest.json').read_text())
rows=[]
for key,a in manifest.items():
 p=root/a['file'];im=Image.open(p).convert('RGBA');im.load()
 assert im.size==(a['w'],a['h']),key
 alpha=im.getchannel('A');lo,hi=alpha.getextrema()
 assert lo==0 and hi>0,key+' missing transparent exterior or content'
 assert im.getpixel((0,0))[3]==0,key+' no safe corner padding'
 assert p.stat().st_size<=300000,key
 if 'ring_' in key or key=='ui2_seal':
  assert im.getpixel((im.width//2,im.height//2))[3]<30,key+' center is not hollow'
 if key=='ui2_skill_cooldown':assert hi<=141,key+' not translucent'
 rows.append(dict(key=key,w=im.width,h=im.height,bytes=p.stat().st_size,alpha=[lo,hi],sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
(root/'tools/k/qa.json').write_text(json.dumps(rows,indent=2)+'\n')
print(len(rows),'decoded; max',max(r['bytes'] for r in rows),'bytes; total',sum(r['bytes'] for r in rows),'bytes')
