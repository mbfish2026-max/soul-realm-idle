"""Decode all delivered assets and check alpha and nonempty animation cells."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
specs = json.loads((ROOT / 'tools/m/specs.json').read_text())
total = 0
for s in specs:
    p = ROOT / 'assets' / s['group'] / (s['key'] + '.webp')
    with Image.open(p) as im:
        im.load()
        assert im.size == (s['w'], s['h']), s['key']
        if s['alpha']:
            assert im.mode == 'RGBA', s['key']
            alpha = im.getchannel('A')
            lo, hi = alpha.getextrema()
            assert lo == 0 and hi > 0, s['key']
            for i in range(s.get('frames', 1)):
                fw = s.get('fw', s['w'])
                assert alpha.crop((i * fw, 0, (i + 1) * fw, s['h'])).getbbox(), s['key']
        if s['key'].endswith('_front') or s['key'] == 'fx_hit_edge':
            # Transparent center must remain clear for gameplay.
            a = im.getchannel('A')
            center = a.crop((int(im.width * .4), int(im.height * .3),
                             int(im.width * .6), int(im.height * .6)))
            assert sum(value * count for value, count in enumerate(center.histogram())) / (center.width * center.height) < 30, s['key']
    limit = 1000000 if s.get('frames', 1) > 1 else 300000
    assert p.stat().st_size <= limit, s['key']
    total += p.stat().st_size
print('Decoded', len(specs), 'images; alpha, cells, center clearance and budgets passed;', total, 'bytes')
