# D 美术与音频完成报告

使用内置 image_gen 逐张生图，未下载网络图片，未使用代码绘制替代图。已阅读 AGENTS.md、docs/interfaces.md、docs/plan.md、mock/README.md 与全部样板 HTML/CSS/JS，并参考只读 idle-arpg/audio.js。

## 交付范围

已交付 42 张独立图片，统一淡彩水墨、青玉、宣纸色调，无文字或整屏截图素材：

| 类别 | 数量 | manifest key |
|---|---:|---|
| 同一主角姿势 | 7 | hero_idle / move / attack / skill / hit / win / die |
| 三尾灵狐姿势 | 3 | pet_fox_idle / attack / fusion |
| 渊兽 | 4 | mob_ink_wolf / bamboo_snake / stone_turtle / mist_falcon |
| 渊主 | 1 | boss_cinder_stag |
| 竖屏背景 | 3 | bg_forest / snow / ember |
| 玉盘轮技图标 | 8 | icon_skill_bamboo / wind / mountain / lotus / shadow / frost / ember / fusion |
| 五色魂环 | 5 | icon_ring_white / yellow / purple / black / red |
| 契兽头像 | 8 | icon_pet_fox / jade_fox / ember_fox / wolf / snake / turtle / falcon / deer |
| UI 底图 | 3 | ui_panel / button / seal |

表内斜线后的词均沿用该行前缀，完整 key 以 assets/manifest.json 为准。
所有角色、兽、图标和 UI 素材保留透明通道；背景为 780×1688。

## 生图记录与后处理

本轮共生成并归档 44 张原图，正式交付 42 张，另 2 张为弃用的初版。原图从 ~/.codex/generated_images/ 复制至 tools/art/raw/，raw 已追加至 .gitignore，不提交。
所有交付图提示词见 tools/art/prompts.json，后处理可运行 `python3 tools/art/process.py`。
Pillow 只执行 alpha 裁边、留边、等比缩放、背景构图裁切和 WebP 压缩，未画图、未使用白色阈值误删白衣白毛。

首轮主角攻击图剑尖被截、倒下图衣摆贴边，已另行生图替换。两个弃用原图保存在 raw/rejected/。
没有因工具不可用而使用旧 mock、网络图或程序绘图替代。

## 对外接口

- `assets/manifest.js` 注册 `SR.ASSETS={key:{file,w,h,use}}`，与 JSON 内容一致；file 相对项目根目录。
- 普通 script 可直接 file:// 加载。预览页 assets/preview.html 可筛选用途、显示尺寸并试听音效。
- 加载顺序：audio/sfx.js → audio/bgm.js。完整音频调用约定见 audio/README.md。
- `SR.audio.play(id)`、`setEnabled(bool)`、`setVolume(0..1)`、`getVolume()`、`isUnlocked()`。
- 监听 `SR.bus` 的 `sfx` 事件 `{id}`。若总线晚于脚本创建，调用 `SR.audio.bindBus()`。
- 音效 id：attack、skill、crit、hit、pickup、absorb_success、absorb_fail、levelup、click。
- `SR.bgm.setEnabled(bool)`、`setVolume(0..1)`、`getVolume()`、`isEnabled()`。默认关闭。
- 首次可信 pointerdown/touchend/keydown 后才建立/解锁 AudioContext；解锁前不排队，后台暂停；合成节点结束即释放，BGM 停止后不保留调度定时器。

## 验证

- 全部受版本控制与未跟踪 JS 均执行 `node --check`，通过。
- 全部 `tests/*.test.js` 均执行并通过：assets_audio.test.js、assets_manifest.test.js。
- manifest 的 42 个条目逐项验证文件存在、真实 WebP 尺寸、大小限制、键名及 JS/JSON 一致性；检查最低类别数量与五色魂环齐全。
- Pillow 对全部 42 张图完整解码；所有非背景素材具有透明通道和完全透明像素。
- 普通素材最大 233,440 字节（bg_ember），首领 387,880 字节；42 张总计 3,745,840 字节，所有图片也均低于十进制 300KB / 首领 600KB。
- `python3 tools/art/shoot.py` 通过：WebKit 加载所有素材、390px 无横向溢出、真实点击解锁 AudioContext、BGM 开关。最终截图 docs/shots/d_assets.png 为 390×844，已目检。
- 音频测试覆盖解锁前静默、未知 id、所有 9 个音效、限流、开关/音量边界、后台恢复、结束断开节点、BGM 定时器释放、延迟建立总线和无 WebAudio 环境。
- 已分步提交音频（dfba3f2）、素材与流水线（165be2e），本报告单独提交。

## 未做与边界

- 未修改其他路目录、数据表、主入口或战斗代码；由集成方加载 manifest 和音频脚本，按实际数据 id 选择对应 key。
- 本次是独立动作姿势，不是逐帧动画图集；未制作其他兽的攻击/死亡姿势，也未制作主角专属 fusion 图。舞台可按约定复用 skill / attack 并播放一次性动作。
- 各姿势独立裁边，显示时需以脚底中心为锚点并保持纵横比；过宽攻击姿势应结合舞台空间调整显示比例。
- 未往存档结构增加音频设置。未试听物理手机扬声器，浏览器测试验证合成调用和生命周期。
- raw 按要求不提交；新的 clone 需取回原图才能复跑后处理。游戏与预览不依赖 raw。
- 未 git push，未切换或修改 master。
