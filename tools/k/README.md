# K UI 素材流水线

全部原图由内置 image_gen 逐张生成，无下载或代码画图。规格清单 catalog.json；通用提示词见 prompts.json。原图复制到 raw/<key>.png（本目录 .gitignore 忽略），原始来源仍保留 ~/.codex/generated_images/。

运行 `python3 tools/k/process.py`：只读取已有原图，按 alpha 主体裁切、规格规整、透明留边、WebP 压缩，写 assets/ui2/manifest.json 和 manifest.js。需要 Pillow，仅开发时使用。无生图 API、无运行时依赖。

运行 `python3 tools/visual_audit.py` 重建 docs/visual-audit.md。审计为启发式候选，保留文件:行、源码上下文及建议键；它不修改其他路代码。

加载 assets/manifest.js 后加载 assets/ui2/manifest.js，通过 SR.ASSETS.ui2_* 查询。清单使用 Object.assign 原地合并。@2x 画布按一半 CSS 尺寸展示；9-slice 为原图像素 top/right/bottom/left。艺术字叠加在按钮上，同时保留 DOM 可访问名称；操作名和游戏名由 names.js 管理。冷却遮罩是生成的独立墨玉图，界面可裁切显示，不用代码画圆。条填充同理，从左向右裁切生成的图片。

本路不涉及角色动作，因此没有动画图集，不把异类图标作为帧动画注册。生成图不保证像素级状态轮廓一致，三态按统一画布及目标尺寸归一。raw 不随 Git 分发，重做后处理需原图；游戏加载不依赖 raw。
