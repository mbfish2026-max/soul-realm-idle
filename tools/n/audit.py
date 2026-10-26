"""Inspect published raster pixels; no drawing or image modifications."""
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT/'assets/skills/manifest.json').read_text())
files = {}
for key, entry in manifest.items():
    files.setdefault(entry['file'], entry)
    if 'atlas' in entry:
        atlas = entry['atlas']
        files.setdefault(atlas['file'], {'atlas': True})
summary = {'icons': 0, 'fx': 0, 'atlases': 0, 'maxIconBytes': 0, 'maxAtlasBytes': 0}
for file, entry in files.items():
    target = ROOT/file
    image = Image.open(target).convert('RGBA')
    alpha = image.getchannel('A')
    assert alpha.getextrema()[0] == 0, file+' missing fully transparent pixels'
    if entry.get('frames'):
        assert image.size == (1024, 256), file
        frames = [image.crop((i*256, 0, (i+1)*256, 256)) for i in range(4)]
        assert len({f.tobytes() for f in frames}) == 4, file+' duplicated frames'
        for frame in frames:
            a = frame.getchannel('A')
            assert a.getbbox() and a.getextrema()[0] == 0, file+' empty/opaque frame'
        summary['fx'] += 1
    elif entry.get('atlas') is True:
        summary['atlases'] += 1
    else:
        assert image.size == (128, 128), file
        # The threshold ignores negligible WebP alpha ringing at the edge.
        box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
        assert box and min(box[0], box[1], 128-box[2], 128-box[3]) >= 11, file+' unsafe padding'
        if target.stem.startswith(('base_moon_', 'ultimate_mend', 'fusion_mend_', 'ring_trial0_', 'ring_trial6_')):
            cool = purple = 0
            for r, g, b, a in image.get_flattened_data():
                if a > 100 and b > g+15:
                    cool += 1
                    purple += r > g+6
            assert cool >= 100 and purple/cool >= .75, file+' moon palette is not lavender purple'
        summary['icons'] += 1
    is_atlas = bool(entry.get('frames') or entry.get('atlas') is True)
    size = target.stat().st_size
    assert size <= (1000000 if is_atlas else 300000), file+' too large'
    metric = 'maxAtlasBytes' if is_atlas else 'maxIconBytes'
    summary[metric] = max(summary[metric], size)
assert summary['icons'] == 294, summary
assert summary['fx'] == 12, summary
audit_path = ROOT/'tools/n/raw/audit.json'
audit_path.parent.mkdir(parents=True, exist_ok=True)
audit_path.write_text(json.dumps(summary, indent=2)+'\n')
print(json.dumps(summary))
