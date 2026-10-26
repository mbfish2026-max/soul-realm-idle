# K · 界面素材、风格圣经与自检

## 范围与生成方式

风格圣经已最先独立提交：34f3561。读过 AGENTS.md、docs/interfaces.md §6、docs/report-d-art.md、tools/art/prompts.json，参考用户通过的三张概念图，并查看首批面板。统一清新水墨、宣纸淡彩、青玉与古金细线。

全部新素材使用内置 image_gen 逐张生成；没有下载、SVG、Canvas、CSS 或 Python 绘制替代图。Python 仅裁切 alpha 主体、规整尺寸、留透明边、压缩 WebP；冷却遮罩额外降低生成图 alpha 至 55%。原图留在 ~/.codex/generated_images/ 并复制到 tools/k/raw/，该目录被 tools/k/.gitignore 忽略，不提交。

## 计划与交付清单

计划 74 张静态素材，键统一使用 ui2_ 前缀，避免覆盖首批 SR.ASSETS。

| 类别 | 计划数 | key（省略 ui2_） |
|---|---:|---|
| 面板、弹窗 | 2 | panel / modal |
| 主次按钮各三态 | 6 | button_primary_normal / pressed / disabled；button_secondary_normal / pressed / disabled |
| 玉盘、冷却遮罩 | 2 | skill_base / skill_cooldown |
| 血、魂力、进度条底与填充 | 6 | bar_hp_base / fill；bar_soul_base / fill；bar_progress_base / fill |
| 底部导航 | 8 | nav_battle / pet / ring / bag / bone / realm / achievement / settings |
| 标签页 | 2 | tab_active / inactive |
| 分隔线、云纹、印章框 | 3 | divider / cloud / seal |
| 加载页 Logo、标题艺术字 | 2 | logo / title（魂域挂机） |
| 操作艺术字 | 9 | text_start / absorb / abandon / store / hatch / upgrade / evolve / equip / salvage |
| 货币、材料、道具 | 12 | item_crystal / beast_soul / pact / essence / egg / herb / ore / bone / scroll / stone / dust / chest |
| 五色魂环与金纹变体 | 6 | ring_white / yellow / purple / black / red / gold |
| 成就 | 10 | achievement_01 … achievement_10 |
| 地图节点 | 6 | node_forest / river / snow / ember / ruin / summit |

完整键、文件、@2x 尺寸见 assets/ui2/manifest.json；manifest.js 用 Object.assign 原地合并 SR.ASSETS，不清空已有条目。所有艺术字均为生成图片，动态数值与可访问文本由 DOM 负责。金纹仅装饰变体，不新增魂环年限等级。

本路没有角色动作帧需求，交付为独立静态图片，不把不相关图标合成伪动画；因此无 frames/fw/fh/fps 条目。

## 失败与替换

共生成 77 张原图，正式采用 74 张，3 张弃用图放 raw/rejected/：主按钮禁用态初版偏绿、黄环初版与白环太近、冷却遮罩初版偏浅。均另行 image_gen 生成替换，没有程序重绘或以其他素材冒充。

工具、重放提示词及规格见 tools/k/；prompts.json 记录最终提示词，provenance.json 通过 SHA256 匹配原图来源。首批少量提示词的措辞在归档时统一为风格模板，三个替换图记录实际专用提示词。raw 不随 Git 分发，新 clone 重跑后处理需取回原图，游戏加载不依赖 raw。

## 接入与边界

框体 slice 为 @2x 原图像素 [top,right,bottom,left]，按成品角饰实测保护：panel [96,96,96,96]，modal [96,160,96,160]，按钮 [32,72,32,72]，状态条 [12,12,12,12]；标签页整体缩放。面板中心可拉伸但不承诺纸纹无缝平铺；三态为独立生成，轮廓存在细微差异，已统一画布与目标比例。冷却遮罩和状态条填充可裁切图片显示。

检视页 assets/ui2/preview.html；接入说明 tools/k/README.md；跨目录请求 docs/requests-k.md。未改其他路目录、入口、首批资源或公共 names.js。专有名词由接入方继续引用 SR.NAMES，不向素材清单引入新游戏设定。

tools/visual_audit.py 扫描全部 HTML/CSS/JS，输出 docs/visual-audit.md：文件:行、元素类型、源码片段与建议素材键。压缩 CSS 按声明逐项扫描。涵盖渐变、边框/阴影、纯色按钮候选、Canvas 图形、SVG、emoji 和代码样式赋值。它是静态启发式候选清单，包含 mock/预览/测试误报，需要所有者按上下文确认；drawImage 使用生成图不视为代码画图。审计不会改其他路源文件，也不声称现有游戏所有代码视觉已替换。

## 最终验证

最终数量、尺寸、字节、alpha 范围与交付图 SHA256 见 tools/k/qa.json。Node 测试读取 WebP 真实尺寸，验证 74 键齐全、文件路径、300,000 B 限额、切片范围、QA 哈希，以及普通 script 在浏览器和 globalThis 两种环境中的增量注册、旧键保留和重复加载。

Pillow 完整解码每张，检查透明留边；魂环/印章中心透明；冷却遮罩 alpha 不超过 141。所有 JS 语法检查及全部 tests/*.test.js 在提交前运行。未 push，未切换或修改 master。

本轮最终结果：74/74 张交付，最大单张 52,754 B，74 张共 637,074 B；均低于 300,000 B。74 张原图均通过 SHA256 与 image_gen 原始输出匹配。WebKit 的 file:// 检查通过：74 图完整加载、390×844 无横向溢出、首批 42 键与新增 74 键并存为 116 键；预览截图另存 raw/qa/，不作游戏素材且不提交。Node 全部 15 个测试文件及全部 JS 语法检查通过，git diff --check 通过。

素材与工具提交：9cbbba1。视觉审计最终列出 158 处候选，并提供可对应的 ui2_ 键；未越权修改各路实现。
