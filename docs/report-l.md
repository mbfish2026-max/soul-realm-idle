# L 角色动作帧

使用内置 image_gen，以现有 hero / pet / mob / boss 为身份参考，统一清新中国水墨、青玉、象牙白、墨灰细描边。两个候选位置均未找到 style-bible，采用 tools/art/prompts.json 的风格词。未下载或使用程序绘制视觉素材。

## 第一批：主角

已生成 8 个动作、33 帧：idle 4 / move 6 / attack 4 / skill 6 / hit 2 / fusion 4 / win 3 / die 4。帧尺寸 600×880，另有 300×440 手机版。每动作一张横向透明 WebP 图集，共 16 张。

移动首版六格横排衣摆过密，已重新生成三列两行原图后提取轮廓，正式输出仍为横向等宽帧。原图自 ~/.codex/generated_images/ 复制至 tools/l/raw/，由 tools/l/.gitignore 忽略。未用旧姿势重复帧或代码变形充数。

## 接口与复现

assets/frames/manifest.js 在基础 assets/manifest.js 之后加载，Object.assign 合并 SR.ASSETS，同名角色动作键覆盖静态姿势，保留背景及图标键。手机版以 `_1x` 键访问、文件后缀 @1x。条目含 file/w/h/use、frames/fw/fh/fps、anchor、loop、sourceScale。anchor 为帧内归一化脚底中心 {x:0.5,y:0.96}。仅 idle 标记循环，其他动作一次播放，move 如需持续移动由调用方再次触发。

后处理：python3 tools/l/process.py，依赖 Pillow、NumPy、SciPy，只做透明轮廓提取、裁切、对齐、缩放、合图和 WebP 压缩；无视觉绘制。tools/l/sources.json 记录帧布局和输出规格，tools/l/prompts.json 记录生成提示词。原图未提交，新克隆需取回原图才能复现，游戏不依赖 raw。

## 后续计划

灵狐 22 帧（7 动作）；前三种渊兽墨狼、竹蛇、石龟各 9 帧（4 动作）；渊主 13 帧（5 动作）。最终总计 95 帧、32 动作、64 张含手机版图集。

## 验证

每批提交前运行所有 JS 语法检查和 tests/*.test.js。tests/assets_l.test.js 校验真实 WebP 尺寸、透明标志、文件体积 ≤1,000,000 字节、键名、帧数、脚底锚点、半尺寸版本及 JS/JSON 一致性和增量合并行为。

## 第二批：灵狐

已完成 idle 3 / move 4 / attack 4 / hit 2 / fusion 4 / win 2 / die 3，共 22 帧、7 动作、14 张图集；400×320 和 200×160。原图全部由内置 image_gen 参考现有三尾灵狐生成，攻击为蹲伏—跃起—伸爪—落地，倒下为失衡—侧卧—闭眼伏地。未以平移、旋转或重复静态图填帧。解码检查和既有测试通过。
