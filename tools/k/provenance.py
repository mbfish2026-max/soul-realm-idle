"""Match copied raw images to image_gen originals by content hash."""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
raw=root/'tools/k/raw'
sources=Path.home()/'.codex/generated_images'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
originals={}
for p in sources.rglob('*.png'):
 originals[digest(p)]=str(p.relative_to(sources))
rows=[]
for p in sorted(raw.glob('*.png')):
 sha=digest(p)
 assert sha in originals,p
 rows.append(dict(key=p.stem,original=originals[sha],rawSha256=sha,tool='image_gen'))
(root/'tools/k/provenance.json').write_text(json.dumps(rows,indent=2)+'\n')
print(len(rows),'raw images matched to image_gen originals')
