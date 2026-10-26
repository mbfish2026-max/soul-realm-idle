#!/usr/bin/env python3
"""Contact sheets for human review; only resizes/composites existing bitmaps."""
from pathlib import Path
from PIL import Image,ImageDraw
import json
ROOT=Path(__file__).resolve().parents[2]
manifest=json.loads((ROOT/'assets/m2/manifest.json').read_text())
items=list(manifest.items())
for start in range(0,len(items),12):
    page=items[start:start+12]
    sheet=Image.new('RGB',(1000,3*290),(244,241,230))
    draw=ImageDraw.Draw(sheet)
    for n,(key,record) in enumerate(page):
        image=Image.open(ROOT/record['file']).convert('RGBA')
        image.thumbnail((240,250))
        x=(n%4)*250+(250-image.width)//2
        y=(n//4)*290+(250-image.height)//2
        sheet.paste(image,(x,y),image)
        draw.text(((n%4)*250+8,(n//4)*290+258),key,fill=(40,55,49))
    sheet.save(ROOT/'tools/art2/raw'/('review-%02d.jpg'%(start//12)))
print('Review sheets in ignored raw/')
