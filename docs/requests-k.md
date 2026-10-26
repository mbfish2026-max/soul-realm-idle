# K 路接入请求

K 仅交付 assets/ui2/、tools/k/、tests/assets_k.test.js、风格圣经与视觉审计；未修改 UI/舞台/入口。

- 集成方：在首批 assets/manifest.js 之后加载 assets/ui2/manifest.js；后者 Object.assign 合并，不清空旧资源。
- B/UI：将纸框、按钮三态、标签页、导航、状态条替换为 SR.ASSETS.ui2_* 生成图片；保留 DOM 文本/可访问名称及现有逻辑。清单 slice 为 @2x 原图像素。
- B/UI：游戏标题及常用操作艺术字已有生成图；游戏名和专有名词仍经 names.js 引用。12 个道具图标是通用素材，实际数据 id 由所有者映射。
- C/舞台：审计中 Canvas/CSS 特效需表现路的生图帧资源，不能用 UI 图标伪装成动画。详见 docs/visual-audit.md。
- 全路：docs/style-bible.md 已先行独立提交，所有新素材遵守其色板与笔触。审计只列候选，不代表既有代码已替换；需各目录所有者实施。
