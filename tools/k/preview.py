"""Build a plain contact gallery using only generated images for decoration."""
import json,html
from pathlib import Path
root=Path(__file__).resolve().parents[2]
a=json.loads((root/'tools/k/catalog.json').read_text())
s='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>K 素材检视</title><style>body{margin:16px;font-family:serif}main{display:flex;flex-wrap:wrap;gap:20px}figure{margin:0;width:224px;overflow-wrap:anywhere}img{display:block;max-width:220px;max-height:160px;object-fit:contain}figcaption{font-size:12px}</style><h1>K · 生成素材检视</h1><p>全部 @2x；透明素材可在浏览器明暗外观下复核。框体标注 slice；接入见 tools/k/README.md。</p><main>'''
for i in a:
 s+=f'<figure><img src="{i["key"]}.webp" alt="{html.escape(i["subject"])}"><figcaption>{i["key"]}<br>{i["w"]} × {i["h"]}'+(f' · slice {i["slice"]}' if 'slice' in i else '')+'</figcaption></figure>'
s+='</main></html>'
(root/'assets/ui2/preview.html').write_text(s)
