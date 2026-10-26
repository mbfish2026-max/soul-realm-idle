"""Only extracts generated alpha silhouettes, aligns, resizes and encodes; never draws art."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent

def extract(source, count, cols):
    im = Image.open(source).convert('RGBA')
    a = np.array(im)
    labels, _ = ndi.label(a[:, :, 3] > 48)
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    ids = (np.argsort(sizes)[-count:]).tolist()
    if min(sizes[ids]) < 1000:
        raise ValueError(f'Not enough silhouettes: {source}')
    boxes = ndi.find_objects(labels)
    # Order by row bands, then left-to-right. Do not cut along grid lines:
    # swords and tails may extend beyond them.
    ids.sort(key=lambda i: (boxes[i-1][0].start + boxes[i-1][0].stop)/2)
    ordered = []
    for start in range(0, count, cols):
        ordered.extend(sorted(ids[start:start+cols], key=lambda i: boxes[i-1][1].start))
    seeds = np.zeros(labels.shape, dtype=np.int16)
    for n, i in enumerate(ordered, 1): seeds[labels == i] = n
    _, nearest = ndi.distance_transform_edt(seeds == 0, return_indices=True)
    owner = seeds[tuple(nearest)]
    result = []
    for n in range(1, count+1):
        pixels = a.copy()
        pixels[:, :, 3][owner != n] = 0
        # Discard almost invisible matte noise, preserving white cloth/fur.
        pixels[:, :, 3][pixels[:, :, 3] < 8] = 0
        frame = Image.fromarray(pixels)
        box = frame.getchannel('A').getbbox()
        result.append(frame.crop(box))
    return result

def run():
    jobs = json.loads((HERE/'sources.json').read_text())
    manifest = {}
    out = ROOT/'assets/frames'; out.mkdir(exist_ok=True)
    for job in jobs:
        key, count, fw, fh = job['key'], job['frames'], job['fw'], job['fh']
        frames = extract(HERE/'raw'/job['source'], count, job['cols'])
        # One scale for every frame in an action preserves motion proportions.
        scale = min(min((fw*.90)/f.width, (fh*.92)/f.height) for f in frames)
        sheet = Image.new('RGBA', (fw*count, fh))
        for i, frame in enumerate(frames):
            frame = frame.resize((round(frame.width*scale), round(frame.height*scale)), Image.Resampling.LANCZOS)
            sheet.alpha_composite(frame, (i*fw+(fw-frame.width)//2, round(fh*.96)-frame.height))
        for factor, suffix in [(1,''), (.5,'_1x')]:
            target = sheet if factor == 1 else sheet.resize((round(sheet.width*factor), round(fh*factor)), Image.Resampling.LANCZOS)
            file = out/(key+('@1x' if suffix else '')+'.webp')
            for quality in [88, 80, 72, 64, 56]:
                target.save(file, 'WEBP', quality=quality, method=4)
                if file.stat().st_size <= 1000000: break
            if file.stat().st_size > 1000000: raise ValueError(file)
            manifest[key+suffix] = dict(file=str(file.relative_to(ROOT)), w=target.width, h=target.height,
                use='animation', frames=count, fw=round(fw*factor), fh=round(fh*factor), fps=job['fps'],
                anchor={'x':.5,'y':.96}, loop=job['key'].endswith('_idle'), sourceScale=factor)
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (out/'manifest.js').write_text('(function (g) {\n  "use strict";\n  var SR = g.SR = g.SR || {};\n  Object.assign(SR.ASSETS = SR.ASSETS || {}, '+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n})(typeof window !== "undefined" ? window : globalThis);\n')
    print(f'{len(jobs)} actions, {sum(j["frames"] for j in jobs)} frames, {len(manifest)} sheets')
if __name__ == '__main__': run()
