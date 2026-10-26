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

## 第三批：三种渊兽

墨狼、竹蛇、石龟各完成 idle 2 / attack 3 / hit 1 / die 3，共 27 帧、12 动作、24 张图集。标准帧 460×330，手机版 230×165。每种九帧原图均由 image_gen 参考对应现有造型生成，按动作拆成横向图集；sourceFrames/indices 保留拆分依据。三种造型均保持左朝向。竹蛇保留现有素材的龙形头、叶鳍和小肢体，不另行重设计。

## 第四批：渊主与最终清单

首领 idle 2 / attack 3 / skill 3 / phase 2 / die 3，共 13 帧、5 动作、10 张图集；1000×1200，手机版 500×600。

最终完成 **95 帧、32 动作、64 张透明 WebP 图集**，原计划全部交付。主角 33、灵狐 22、三种渊兽各 9、首领 13。所有图像均出自内置 image_gen，未使用 CSS/SVG/Canvas 绘制替代、下载素材或程序插帧。基础静态素材和其他路代码未修改。

额外替换记录：主角 win 首版剑尖触顶，die 首版衣摆贴边；首领 attack 首版鹿角左侧被截、phase 首版鹿角触顶，均使用 image_gen 编辑原图重生后替换。弃用图仍保留于忽略的 raw/ 内，未以程序补画。提示词共包含各轮尝试及替换项；主角移动初版原图仍位于生成目录中，正式 raw 使用重生版。

脚底锚点校准按透明轮廓底部 6% 的实体接触区中心对齐至 (fw×0.5, fh×0.96)；同动作使用统一缩放比例，倒地按最低接触区中心锚定。角色是生成关键姿势，不是骨骼动画，动作间与帧间仍可能有细微衣纹、鹿角枝形和身形变化；舞台建议按 manifest fps 播放，不做长时间往复插值。

读取示例：加载基础 manifest 后加载 assets/frames/manifest.js；SR.ASSETS.hero_attack 为标准版，hero_attack_1x 为手机版；渊兽键如 mob_ink_wolf_attack，首领键如 boss_cinder_stag_phase。图集横向，frame i 的源矩形为 [i×fw,0,fw,fh]。手机优先使用 _1x。未改主入口，由集成方加载本 manifest。

验证补充：python3 tools/l/check.py 全解码检查真实透明像素、每帧留边、每动作不存在完全重复帧及尺寸/体积预算。原始生成图存在抗锯齿半透明边缘，处理保留白衣、白毛及淡彩，不使用亮度阈值抠除白色。单帧 hit 图也单独满足 ≤300KB。

最终实测：64 张图集总计 7,615,462 字节，最大 hero_fusion.webp 为 527,594 字节；全部图集低于 1MB。完整原始生成批次另归档 tools/l/raw/originals/，包含未采用版本，全部忽略。python3 tools/l/check.py、所有 JS node --check、全部 15 个 tests/*.test.js 均通过。主角、灵狐、渊兽分批提交后，末批包含首领、全角色脚底接触区校准与贴边重生替换。未 push，未切换分支，当前分支 dev/l-frames。
