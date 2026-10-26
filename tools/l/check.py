"""Decode final sheets and check real alpha, frame uniqueness, padding and budget."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT/'assets/frames/manifest.json').read_text())
for key, item in manifest.items():
    path = ROOT/item['file']
    assert path.stat().st_size <= (300000 if item['frames'] == 1 else 1000000), key
    im = Image.open(path).convert('RGBA')
    assert im.size == (item['w'], item['h']), key
    hashes = set()
    for i in range(item['frames']):
        frame = im.crop((i*item['fw'], 0, (i+1)*item['fw'], item['fh']))
        alpha = frame.getchannel('A')
        assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 200, key
        box = alpha.point(lambda x: 255 if x > 16 else 0).getbbox()
        assert box and box[0] > 0 and box[1] > 0, (key, i, box)
        assert box[2] < frame.width and box[3] < frame.height, (key, i, box)
        hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())
    assert len(hashes) == item['frames'], key+' repeats frames'
print(f'assets_l decode: {len(manifest)} sheets, alpha/padding/distinct frames passed')
