# 魂域挂机 · 风格圣经 v1

本规范适用于全部美术路。视觉以用户通过的三张概念图及第一批 assets 为基准：干净清新中国水墨、宣纸淡彩、留白充足，原创仙侠。所有视觉素材由内置 image_gen 生成；不得以 CSS/SVG/Canvas、程序画图或下载图片替代。Python 仅用于透明处理、裁切、规整、拼帧、压缩。动态文字、布局、数值和交互由界面代码负责。

## 色板（sRGB）

| 用途 | hex |
|---|---|
| 宣纸底 / 纸纹暗部 | #F5F0E3 / #E8DEC8 |
| 墨色 / 次级墨灰 | #252D29 / #68746B |
| 主青玉 / 深玉 / 浅玉 | #527D67 / #275642 / #B5CDB6 |
| 古金描边 / 高光 | #AF985F / #D8C894 |
| 朱砂印 / 血条 | #A74639 / #B45C50 |
| 魂力紫 / 冰青 | #9274AF / #86B8BB |
| 魂环白 / 黄 / 紫 / 黑 / 红 | #EEEFE7 / #E4C354 / #9870BA / #292C2B / #BA493F |

以上为目标基色，水彩自然晕染允许局部变化；金纹属于纹饰而非第六种魂环年限。

## 笔触、光照与描边

细腻水彩湿边、轻淡墨晕、少量干笔纸纤维；物件轮廓使用墨灰细线，@2x 约 2–3 px，金边约 1–2 px。正面近正投影、漫射左上柔光、低反差；不画强投影、摄影棚地面、塑料高光、厚重浮雕或霓虹。功能图标以单一可读剪影为主，缩至 32 px 仍可辨认。框体中心清淡无纹饰，装饰集中在边角，禁止整屏 UI 截图充当素材。

## 透明边距与规格（全部为 @2x 像素）

除背景与框体纸芯外使用真实 alpha；不把米白、白毛、白衣阈值删除。普通图标至少 8% 安全边距，角色至少 6%，剑尖、尾巴、光晕必须完整。下表尺寸是最终画布，显示时除以 2。

| 素材 | 规格 | 补充 |
|---|---|---|
| 全屏背景 | 780×1688 | 有底，无文字，中心留白 |
| 面板 / 弹窗 | 720×480 / 680×760 | 9-slice 上右下左 48；中心不放装饰 |
| 主次按钮各三态 | 320×96 | normal / pressed / disabled；slice 24；状态分别生图 |
| 玉盘 / 冷却遮罩 | 128×128 | 遮罩为独立半透明墨玉圆盘 |
| 血 / 魂力 / 进度条底及填充 | 480×32 | fill 从左裁切显示；slice 12 |
| 导航 / 道具 / 成就图标 | 96×96 | 透明，图形居中 |
| 魂环 | 128×128 | 五色及金纹，镂空中心 |
| 标签页 | 240×80 | active / inactive，slice 20 |
| 分隔线 / 云纹 | 640×32 / 256×96 | 两端留白 |
| 印章框 | 96×128 | 镂空，不含文字 |
| Logo / 标题 | 320×320 / 720×240 | 标题精确为「魂域挂机」 |
| 按钮艺术字 | 256×80 | 透明墨字，独立图，不附按钮底 |
| 地图节点 | 192×192 | 原创微景观，透明外部 |
| 角色动作 | 单帧 512×640 | 同角色同动作等宽帧横向拼图；脚底锚点一致 |

同动作帧合图需提供 frames/fw/fh/fps；禁止把不相干图标误标成动画。普通单张 ≤300,000 B，首领 ≤600,000 B，帧图集 ≤1,000,000 B。优先带 alpha WebP；必要时 PNG8 并目检边缘。

## 命名与接口

资源键 snake_case，遵守 docs/interfaces.md §6：ui_<功能>、icon_<类别>_<id>、bg_<id>、hero_<动作>、pet_<id>_<动作>。K 路新增统一 ui2_ 前缀，避免覆盖首批资源。文件名与键一致，资源放 assets/ui2/；manifest.json 与 manifest.js 一致，JS 使用 Object.assign 合并进 SR.ASSETS。条目含 file/w/h/use，9-slice 另含 slice:[top,right,bottom,left]，动画另含 frames/fw/fh/fps。file 相对项目根。所有可见专有名词由 names.js 维护；艺术字仅固定通用操作与游戏标题。

## 通用正面提示词模板

Use case: stylized-concept. Single standalone production game asset: {subject}. Fresh clean Chinese ink wash, delicate watercolor on xuan paper, muted sage jade #527D67, warm ivory #F5F0E3, charcoal #252D29, thin antique gold #AF985F. Fine consistent outlines, soft diffuse upper-left light, restrained texture, ample breathing space, frontal orthographic readable silhouette. {size/composition}. Genuine transparent background outside the subject, complete uncropped silhouette and generous safe padding. {exact text only when requested}.

## 通用负面提示词模板

No photograph, 3D render, glossy plastic, neon, heavy shadows, excessive bloom, thick outline, saturated rainbow, western fantasy armor, busy background, scenery behind isolated icons, screenshot, UI layout, watermark, signature, labels or text unless explicitly requested. No existing franchise characters, names, places or recognizable proprietary creatures. No clipping, checkerboard baked into pixels, fake white transparency, extra objects.

## 验收

逐张检查透明边缘、整体完整、色板、中文准确性及小尺寸辨识度；错误图另存 rejected 并重新生成，不用代码修绘。记录提示词、原图来源及后处理步骤。raw 保存在本路 tools/<路>/raw/ 并 gitignore，不提交。独立测试校验键名、文件、真实尺寸、体积及清单合并行为；代码绘图替换由对应目录所有者完成。

## K 首批切片实测补充

上表 slice 为初始设计值。实际生成框体的角饰大于预估，K 成品以 manifest 的实测保护边距为准：panel [96,96,96,96]；modal [96,160,96,160]；按钮 [32,72,32,72]；条槽与填充 [12,12,12,12]。均为 top/right/bottom/left 的 @2x 像素。标签页中央带装饰，不做 9-slice，按固有比例整体显示。其他路仍以各自成品实测填写，禁止切穿云纹或拉伸角色。
