#!/usr/bin/env python3
"""Resize/crop/compress generated bitmap originals; never draws asset content.
Requires Pillow only for offline asset processing; game has no dependency.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'tools/art2/raw'
OUT = ROOT / 'assets/m2'
SIZES = {'mob': (512, 448), 'boss': (800, 800), 'pet': (512, 512),
         'portrait': (256, 256), 'icon': (192, 192), 'background': (780, 1688)}

def build(partial=False):
    sources = json.loads((RAW / 'sources.json').read_text())
    catalog = json.loads((ROOT / 'tools/art2/prompts.json').read_text())
    records = {x['key']: x for x in sources}
    corrections = RAW / 'corrections.json'
    if corrections.exists():
        records.update({x['key']: x for x in json.loads(corrections.read_text())})
    manifest = {}
    provenance = []
    OUT.mkdir(exist_ok=True, parents=True)
    for spec in catalog:
        key, kind = spec['key'], spec['kind']
        if key not in records:
            if partial:
                continue
            raise ValueError('Missing generated original: ' + key)
        original = Path(records[key]['path'])
        local = RAW / (key + '.png')
        shutil.copy2(original, local)
        im = Image.open(local).convert('RGBA')
        size = SIZES[kind]
        if kind == 'background':
            im = ImageOps.fit(im.convert('RGB'), size, Image.Resampling.LANCZOS)
        else:
            alpha = im.getchannel('A')
            if alpha.getextrema()[0] != 0:
                raise ValueError('Expected generated transparency: '+key)
            # Ignore near-invisible perimeter mist for stable subject occupancy.
            bounds = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
            if not bounds:
                raise ValueError('Empty subject: '+key)
            im = im.crop(bounds)
            im.thumbnail((int(size[0]*.90), int(size[1]*.90)), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', size, (0, 0, 0, 0))
            canvas.alpha_composite(im, ((size[0]-im.width)//2, (size[1]-im.height)//2))
            im = canvas
        target = OUT / (key + '.webp')
        staged = RAW / (key + '.pending.webp')
        limit = (600 if kind == 'boss' else 300) * 1024
        for quality in (88, 82, 75, 68, 60):
            im.save(staged, 'WEBP', quality=quality, method=6, exact=True)
            if staged.stat().st_size <= limit:
                break
        if staged.stat().st_size > limit:
            raise ValueError('Over budget: '+key)
        staged.replace(target)
        manifest[key] = dict(file='assets/m2/'+target.name, w=size[0], h=size[1], use=kind)
        provenance.append(dict(key=key, generator='image_gen', original=original.name,
                               sourceSha256=hashlib.sha256(local.read_bytes()).hexdigest(),
                               outputSha256=hashlib.sha256(target.read_bytes()).hexdigest()))
    (OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    js = "(function(g){'use strict';\nvar SR=g.SR=g.SR||{};\nvar assets="+json.dumps(manifest,indent=2)+";\nSR.art2={install:function(){\n  var target=SR.ASSETS=SR.ASSETS||{};\n  Object.keys(assets).forEach(function(key){target[key]=assets[key];});\n  return target;\n}};\nSR.art2.install();\n})(typeof window!=='undefined'?window:globalThis);\n"
    (OUT/'manifest.js').write_text(js)
    (ROOT/'tools/art2/provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
    print('Processed',len(manifest),'assets;',sum((ROOT/x['file']).stat().st_size for x in manifest.values()),'bytes')

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--partial',action='store_true')
    build(parser.parse_args().partial)
