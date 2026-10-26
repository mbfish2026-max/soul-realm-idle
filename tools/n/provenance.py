"""Record generated original hashes and prompts without modifying any image."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
RAW=ROOT/'tools/n/raw'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
prompts={p['id']:p['prompt'] for name in ['prompts.json','dedicated-prompts.json','fx-prompts.json'] for p in json.loads((ROOT/'tools/n'/name).read_text())}
sources={}
for p in (Path.home()/'.codex/generated_images').glob('*/*.png'):
    sources.setdefault(sha(p),str(p))
out={}
for p in sorted(RAW.glob('*.png')):
    if p.stem not in prompts: continue
    digest=sha(p)
    out[p.stem]={'tool':'image_gen.imagegen','prompt':prompts[p.stem],'rawFile':'tools/n/raw/'+p.name,'sha256':digest,'generatedSource':sources.get(digest),'postprocess':'alpha-bbox trim, uniform resize and transparent-center placement, atlas packing, WebP compression' if not p.stem.startswith('fx_') else 'fixed 2x2 frame crops, uniform resize, horizontal atlas packing, WebP compression'}
(ROOT/'tools/n/provenance.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Recorded',len(out),'generated sources')
