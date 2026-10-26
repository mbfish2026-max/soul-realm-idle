#!/usr/bin/env python3
"""Derive phone-sized copies of M's generated scenes; resize/compress only."""
from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
source=ROOT/'assets/scene';target=source/'mobile';target.mkdir(exist_ok=True)
manifest={}
for f in sorted(source.glob('*.webp')):
 out=target/f.name
 with Image.open(f) as im:im.resize((390,844),Image.Resampling.LANCZOS).save(out,'WEBP',quality=65,method=6)
 manifest[f.stem]={'file':str(out.relative_to(ROOT)),'w':390,'h':844,'use':'background'}
(target/'manifest.js').write_text('(function(g){Object.assign(g.SR.ASSETS,'+json.dumps(manifest)+');})(typeof window!==\'undefined\'?window:globalThis);\n')
print(f'{len(manifest)} scenes; {sum(f.stat().st_size for f in target.glob("*.webp"))} bytes')
