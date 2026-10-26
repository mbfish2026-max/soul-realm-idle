#!/usr/bin/env python3
"""Heuristic visual audit: report candidates with context; no source mutation."""
import argparse,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RULES=[
 ('CSS 渐变',r'(?:linear|radial|conic)-gradient\s*\('),
 ('CSS 边框/阴影',r'(?<![\w-])(?:border(?:-(?:top|right|bottom|left))?|box-shadow)\s*:\s*(?!none\b|0\s*[;}])'),
 ('Canvas 图形',r'\.(?:fillRect|strokeRect|arc|ellipse|lineTo|bezierCurveTo|quadraticCurveTo|fillText|strokeText|fill|stroke)\s*\('),
 ('SVG 图形',r'<(?:svg|path|circle|rect|polygon|ellipse|polyline)\b|createElementNS\s*\('),
 ('Emoji/图形字符',r'[\U0001F000-\U0001FAFF\u2600-\u27BF]'),
 ('纯色背景（含按钮候选）',r'(?<![\w-])background(?:-color)?\s*:\s*(?:#[\da-fA-F]{3,8}\b|rgba?\(|hsla?\(|var\(|(?:white|black|green|red|gold)\b)'),
 ('代码样式赋值',r'\.style\.(?:background|backgroundColor|border|boxShadow)\s*='),
]
def suggest(context):
 c=context.lower()
 if any(x in c for x in ['cooldown','冷却']):return 'ui2_skill_cooldown'
 if any(x in c for x in ['hp','health','血条']):return 'ui2_bar_hp_base / ui2_bar_hp_fill'
 if any(x in c for x in ['progress','prog','exp','进度']):return 'ui2_bar_progress_base / ui2_bar_progress_fill'
 if any(x in c for x in ['soul','mana','魂力']):return 'ui2_bar_soul_base / ui2_bar_soul_fill'
 if any(x in c for x in ['jade-icon','.disc','.round']):return 'ui2_skill_base'
 if 'nav' in c:return 'ui2_nav_battle / ui2_nav_pet / ui2_nav_ring / ui2_nav_bag（按入口匹配）'
 for code,color in [('y-w','white'),('y-y','yellow'),('y-p','purple'),('y-b','black'),('y-r','red')]:
  if code in c:return 'ui2_ring_'+color
 for token,key in [('button','button_primary_normal'),('btn','button_primary_normal'),('modal','modal'),('popup','modal'),('tab','tab_active'),('seal','seal'),('ring','ring_purple'),('cloud','cloud'),('divider','divider'),('panel','panel'),('card','panel')]:
  if token in c:return 'ui2_'+key
 if 'canvas' in c or 'ctx.' in c or 'particle' in c:return '需对应表现路生成特效帧图集（ui2 无对应帧）'
 return 'ui2_panel（框体候选）；需人工确认用途'
def scan(root):
 rows=[]
 for p in sorted(root.rglob('*')):
  if any(x in {'.git','node_modules','raw','.venv'} for x in p.parts) or p.suffix not in {'.html','.css','.js'}:continue
  lines=p.read_text(errors='replace').splitlines()
  for i,line in enumerate(lines):
   # Include nearby selector/context for minified or template-heavy sources.
   context=' '.join(lines[max(0,i-2):i+2])
   for label,pattern in RULES:
    for match in re.finditer(pattern,line,re.I):
     start=line.rfind('}',0,match.start())+1
     end=line.find('}',match.end())
     fragment=line[start:end+1] if end>=0 else line[max(0,match.start()-90):match.end()+120]
     rows.append((str(p.relative_to(root)),i+1,label,fragment.strip()[:220],suggest(fragment)))
 return rows
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=ROOT);ap.add_argument('--output',type=Path,default=ROOT/'docs/visual-audit.md');args=ap.parse_args()
 rows=scan(args.root)
 entry=(args.root/'index.html').read_text()
 live={'index.html'}|set(re.findall(r'(?:src|href)="([^"?#]+\.(?:js|css))',entry))
 def verdict(p,code):
  if p not in live:return '参考/测试，正式入口不加载'
  if 'border-image:' in code or ('url(' in code and 'gradient' not in code):return '已用生成贴图；透明边用于切片布局'
  return '待替换'
 pending=sum(verdict(p,code)=='待替换' for p,n,label,code,key in rows)
 text=['# 视觉代码审计','', '静态启发式扫描全部 HTML/CSS/JS（含 mock、预览与测试）；候选需按上下文人工判断。布局边界、透明遮挡、调试绘图可能误报；命中不等于已确认违规。drawImage 使用生成图本身不计作代码绘图。本清单按正式入口加载关系区分运行内容与参考页。','',f'正式入口待替换 **{pending}** 处；全仓原始候选 {len(rows)} 处（逐项保留参考页与贴图切片误报）。建议键来自 assets/ui2/manifest.json；表现特效缺口需相应路生图。','', '| 文件:行 | 元素 | 源码片段 | 建议素材键 | 当前结论 |','|---|---|---|---|---|']
 for p,n,label,code,key in rows:
  code=code.replace('|','\\|').replace('`','&#96;')
  text.append(f'| {p}:{n} | {label} | `{code}` | {key} | {verdict(p,code)} |')
 args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text('\n'.join(text)+'\n');print(f'{len(rows)} candidates -> {args.output}')
if __name__=='__main__':main()
