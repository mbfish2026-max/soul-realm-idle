#!/usr/bin/env python3
"""Inventory code-painted candidates, distinguishing shipped UI from reference pages."""
import importlib.util,re,sys
sys.dont_write_bytecode=True
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('visual',ROOT/'tools/visual_audit.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
ENTRY=(ROOT/'index.html').read_text();live={'index.html'}|set(re.findall(r'(?:src|href)="([^"?#]+\.(?:js|css))',ENTRY))
rows=[]
for p,n,kind,code,key in m.scan(ROOT):
 if p not in live: status='否：开发参考/测试/素材预览，不由正式入口加载'
 elif 'border-image:' in code or ('url(' in code and 'gradient' not in code): status='否：生成图九宫格/贴图，透明边仅定义切片空间'
 elif 'text-shadow' in code:status='否：文字可读性'
 else:status='是：需替换'
 rows.append((p,n,kind,code,status))
# Also cover canvas gradients and symbol-based pseudo icons beyond the shared audit.
extra=re.compile(r'\.(?:createLinearGradient|createRadialGradient|fillRect|strokeRect|arc|ellipse|fillText|strokeText)\s*\(|[◎◉◇♧♙]')
for p in sorted(ROOT.rglob('*')):
 if p.suffix not in {'.js','.css','.html'} or any(x in p.parts for x in ['.git','raw']):continue
 rel=str(p.relative_to(ROOT))
 for i,line in enumerate(p.read_text(errors='replace').splitlines(),1):
  if extra.search(line):rows.append((rel,i,'Canvas/文字图标',line[:140],'是：需替换' if rel in live else '否：开发参考/测试，不加载'))
count=sum(r[-1].startswith('是') for r in rows)
text=['# 代码绘制元素清单','',f'正式入口可替换项剩余：**{count}**。扫描全仓；参考页仍如实列出，不算作正式游戏验收。','', '| 文件:行 | 用途 | 是否应替换为生成素材 |','|---|---|---|']
for p,n,kind,code,status in rows:text.append(f'| {p}:{n} | {kind}：{code.replace("|","/").replace("`", "")[:170]} | {status} |')
(ROOT/'docs/drawn-elements.md').write_text('\n'.join(text)+'\n');print(f'{len(rows)} entries; {count} shipped candidates need replacement')
