# 美术流水线

所有交付图像由内置 image_gen 工具逐张生成，未下载网络图片，未用代码绘制替代图。
`prompts.json` 保存每张原图使用的提示词；角色动作使用 `raw/hero_idle.png` 作为人物一致性参考。

原始输出保留于 `~/.codex/generated_images/`，复制为 `tools/art/raw/<key>.png`。
raw 已加入根 .gitignore，不进入版本库。需要复跑时，先确保本地 raw 完整。

```sh
python3 tools/art/process.py
python3 tools/art/shoot.py
node tests/assets_manifest.test.js
node tests/assets_audio.test.js
```

Pillow 负责透明 alpha 裁边、留边、等比缩小和 WebP 压缩，不生成图案。
背景裁切至 780×1688；主角图像最大主体高度 780px，加透明边后约 812px。
图标主体最大 240px；每张图完整尺寸在 manifest。
原图 alpha 不做白色阈值抠图，以免误删白衣、白毛；仅以 alpha >12 识别裁切边界。
保留 WebP 的透明通道，普通素材上限 300KiB，首领 600KiB。

`assets/manifest.js` 可直接用普通 script 在 file:// 环境加载，不需要 fetch。
其中 file 路径相对项目根目录。渲染方按 w/h 保持纵横比，用底部中心对齐角色；
每个姿势独立裁边，切换时应以统一显示高度和脚底锚点定位。
这些是独立姿势图，不是逐帧动画图集；一次性运动由舞台状态机完成。

预览为 `assets/preview.html`，显示全部图像、key、尺寸，支持按用途筛选和音频试听。
`shoot.py` 使用 Python Playwright WebKit、390×844 viewport，截取首屏到 `docs/shots/d_assets.png`。
