#!/usr/bin/env python3
"""Rebuild delivery assets from ignored image_gen originals; never draws artwork.
Usage: python3 tools/art/process.py [--partial]
Requires Pillow. Raw source PNGs must be retained in tools/art/raw/.
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
RAW = Path(__file__).parent / 'raw'
OUT = ROOT / 'assets'

def category(key):
    if key.startswith('hero_'): return 'hero'
    if key.startswith('pet_'): return 'pet'
    if key.startswith('mob_'): return 'mob'
    if key.startswith('boss_'): return 'boss'
    if key.startswith('bg_'): return 'background'
    if key.startswith('icon_'): return 'icon'
    return 'ui'

def process(path):
    key = path.stem
    kind = category(key)
    im = Image.open(path).convert('RGBA')
    if kind == 'background':
        im = ImageOps.fit(im.convert('RGB'), (780, 1688), Image.Resampling.LANCZOS)
    else:
        # True alpha comes from image_gen. Trim only near-invisible alpha fringes;
        # white robe/fur pixels are never keyed out by color threshold.
        alpha = im.getchannel('A')
        bbox = alpha.point(lambda x: 255 if x > 12 else 0).getbbox()
        if not bbox:
            raise ValueError(f'{key}: empty alpha')
        if alpha.getextrema()[0] == 255:
            raise ValueError(f'{key}: opaque background; regenerate or extract explicitly')
        im = im.crop(bbox)
        if kind == 'hero':
            im.thumbnail((860, 780), Image.Resampling.LANCZOS)
        elif kind == 'boss':
            im.thumbnail((1000, 1100), Image.Resampling.LANCZOS)
        elif kind in ('pet', 'mob'):
            im.thumbnail((680, 520), Image.Resampling.LANCZOS)
        elif kind == 'icon':
            im.thumbnail((240, 240), Image.Resampling.LANCZOS)
        else:
            im.thumbnail((900, 600), Image.Resampling.LANCZOS)
        pad = 16 if kind != 'icon' else 8
        im = ImageOps.expand(im, border=pad, fill=(0, 0, 0, 0))
    target = OUT / kind / (key + '.webp')
    target.parent.mkdir(parents=True, exist_ok=True)
    limit = (600 if kind == 'boss' else 300) * 1024
    temporary = target.with_suffix('.tmp.webp')
    for quality in (88, 82, 75, 65, 55):
        im.save(temporary, 'WEBP', quality=quality, method=6)
        if temporary.stat().st_size <= limit:
            break
    if temporary.stat().st_size > limit:
        raise ValueError(f'{key}: size budget exceeded')
    temporary.replace(target)
    return key, {'file': target.relative_to(ROOT).as_posix(), 'w': im.width, 'h': im.height, 'use': kind}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--partial', action='store_true', help='Allow incomplete raw generation set')
    args = parser.parse_args()
    sources = sorted(RAW.glob('*.png'))
    if not args.partial and len(sources) < 42:
        raise SystemExit('Expected all 42 source images; use --partial only for inspection')
    manifest = dict(process(p) for p in sources)
    body = json.dumps(manifest, ensure_ascii=False, indent=2)
    (OUT / 'manifest.json').write_text(body + '\n')
    (OUT / 'manifest.js').write_text("(function(g){var SR=g.SR=g.SR||{};SR.ASSETS=" + body + ";})(typeof window!=='undefined'?window:globalThis);\n")
    print(f'Processed {len(manifest)} assets')

if __name__ == '__main__':
    main()
