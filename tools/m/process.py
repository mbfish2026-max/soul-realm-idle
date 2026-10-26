"""Only crop, resize, pack and compress image_gen pixels; never paint assets."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SPECS = json.loads((ROOT / 'tools/m/specs.json').read_text())

def process():
    manifests = {'scene': {}, 'fx': {}}
    for s in SPECS:
        raw = ROOT / 'tools/m/raw' / (s['key'] + '.png')
        if not raw.exists():
            raise FileNotFoundError(raw)
        file = 'assets/' + s['group'] + '/' + s['key'] + '.webp'
        target = ROOT / file
        if not target.exists() or target.stat().st_mtime < raw.stat().st_mtime:
            image = Image.open(raw).convert('RGBA' if s['alpha'] else 'RGB')
            if s['alpha'] and image.getchannel('A').getextrema()[0] == 255:
                raise ValueError('Missing generated alpha: ' + s['key'])
            if s.get('frames', 1) > 1:
                # Preserve the generated fixed frame centers, with no per-frame trim.
                frames = s['frames']
                packed = Image.new('RGBA', (s['w'], s['h']))
                for i in range(frames):
                    cell = image.crop((round(i * image.width / frames), 0,
                                       round((i + 1) * image.width / frames), image.height))
                    cell = ImageOps.contain(cell, (s['fw'], s['fh']), Image.Resampling.LANCZOS)
                    packed.paste(cell, (i * s['fw'] + (s['fw'] - cell.width) // 2,
                                        (s['fh'] - cell.height) // 2))
                image = packed
            elif s['alpha']:
                layer = ImageOps.contain(image, (s['w'], s['h']), Image.Resampling.LANCZOS)
                image = Image.new('RGBA', (s['w'], s['h']))
                image.paste(layer, ((s['w'] - layer.width) // 2, s['h'] - layer.height))
            else:
                image = ImageOps.fit(image, (s['w'], s['h']), Image.Resampling.LANCZOS)
            limit = 1000000 if s.get('frames', 1) > 1 else 300000
            for quality in [88, 80, 72, 64, 54, 44]:
                image.save(target, 'WEBP', quality=quality, method=6)
                if target.stat().st_size <= limit:
                    break
            assert target.stat().st_size <= limit, s['key']
        entry = dict(file=file, w=s['w'], h=s['h'], use=s['group'])
        if 'frames' in s:
            entry.update({k: s[k] for k in ['frames', 'fw', 'fh', 'fps']})
            entry['loop'] = False
        manifests[s['group']][s['key']] = entry
    for group, manifest in manifests.items():
        if not manifest:
            continue
        out = ROOT / 'assets' / group
        data = json.dumps(manifest, ensure_ascii=False, indent=2)
        (out / 'manifest.json').write_text(data + '\n')
        (out / 'manifest.js').write_text('(function(g){var SR=g.SR=g.SR||{};Object.assign(SR.ASSETS=SR.ASSETS||{},' + data + ');})(typeof window!=="undefined"?window:globalThis);\n')
    print('Processed', sum(map(len, manifests.values())), 'assets')

if __name__ == '__main__':
    process()
