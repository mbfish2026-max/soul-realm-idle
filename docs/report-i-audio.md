# i-audio 里程碑二交付报告

## 完成内容

仅修改 audio/m2/、tests/audio_m2*.test.js，以及任务授权的本报告与 docs/interfaces.md 末尾提案。未修改入口、其他路实现、names.js 或游戏存档，未切换分支或 push。工作分支 dev/i-audio。

- 三首原创 32 拍循环：town 68 BPM 清雅、field 88 BPM 流动、boss 124 BPM 激昂；各自独立旋律与根音，全旋律/低声部/笛声使用五声音阶。三角波快速衰减模拟古筝拨弦、正弦低通与独立颤音模拟竹笛、指数降频模拟鼓，完全由 WebAudio 合成。
- 800ms 场景交叉淡化；70ms 定时器前视调度 180ms，使用 AudioContext 时钟，循环边界半开区间防重复，计时器落后时跳过过期音符，不集中补播。
- 风/焰/岩/月四类轮技、契兽出手、首领预警、吸收成功/失败、升级、五色掉落、点击、普攻与共鸣；同 id 90ms 去重，技能 attack 不重复播放 skill 音，最多 96 个主音声部，振荡器结束后断开节点。声音不消费 SR.rng。
- master/music/sfx 三路音量、静音，独立 sr_audio2_v1 localStorage，禁用或配额错误时仍可在本次会话使用。首次手势前不创建 AudioContext、不缓存战斗音效。pointerdown/touchend/keydown 解锁，支持 webkitAudioContext。
- 页面隐藏/pagehide 时停调度、停止全部声部、断开音乐层并 suspend；恢复可见/pageshow 后尝试 resume，不补播后台事件。若平台要求重新手势，下次手势继续尝试。
- 可直接嵌入的设置控件，以及 390px 自适应独立声音弹窗，点空白/完成/Escape 关闭，焦点循环与关闭恢复。没有新专有名词，无需追加 names.js。

## 集成方式（集成路配合）

在现有 bus 与数据定义后、main 启动前，按顺序加载：

```html
<script src="audio/m2/score.js"></script>
<script src="audio/m2/audio.js"></script>
```

调用 `SR.audio2.install()`，幂等。最好在 `SR.idle.start()` 之前安装，以接收首次波次；若已开战，可根据当前状态调用 setScene。无需 CSS、图片、网络或新 Tab。请在现有设置入口/顶栏增加「声音」按钮，其点击调用 `SR.audio2.openSettings()`；已有设置页也可调用 `SR.audio2.mountSettings(container)`。

音乐自动切换规则：battle:wave_start 含 isBoss → boss，否则 field；首领 kill → field；hero_down → town。真正进入主城时请集成路调用 `SR.audio2.setScene('town')`。养成页或弹窗的 ui:open 不改场景，避免短暂弹窗反复换曲。

自动音效监听：sfx、battle:skill/attack/boss_phase/fusion、ring:absorb_result、loot:drop。skill 读 DATA.skills[skillId].vein（wind/fire/earth/moon），未知脉回风；敌方技能不套主角轮技声。契兽技能同时有脉音与契兽出手双音。

升级监听 hero:changed，对比 SR.save.state.hero.level；save:loaded 只初始化级别，不播放升级音。如果后续系统升级时未发 hero:changed，请系统路补发既有事件，或显式发 sfx {id:'level_up'}，不要两者同时发。

质量提示：精魄先看 color，再看 years；灵骨支持字符串色阶/0..4 数字 quality，兽卵 grade 0..8 两级映射一色。id 与可用 API 详见 audio/m2/README.md。业务若已经自动监听，无需再显式发送相同音效。

当前基线不存在第一批 audio/ 实现。兼容策略为保留 SR.audio、不覆盖旧引用，默认可并存；但两个模块都订阅 sfx 会双响。集成路应只安装 audio2。如果后续合并的 SR.audio 提供 uninstall()，可 `SR.audio2.install({legacy:SR.audio})` 先卸载旧模块再接管；未知旧 API 不进行猜测调用，未提供 uninstall 时明确抛错。传 legacy 需在首次 install 时完成。卸载用 SR.audio2.uninstall()，可重新 install，音量保留。

公共接口提案已追加于 docs/interfaces.md「变更提案-i-audio」。本路不修改 main.js/game.html/ui，因此正式入口接线与「声音」按钮由集成路完成。

## 验证

- 提交前全部已跟踪和新增 JS 经 node --check，全部 14 个 tests/*.test.js 通过，包含原核心/系统/舞台回归。
- audio_m2_score：正负级数与八度、三首曲目的五声音阶/乐器、全长三次循环与 137ms 分窗结果逐项一致、边界音符不重复、品质边界。
- audio_m2_runtime：惰性上下文创建、重复安装、全部音效 id/限频、自动场景、业务事件、音量截断/非法数值、存储失败、页面隐藏/恢复、pagehide/pageshow、卸载/重装、显式旧模块移交。使用可控 WebAudio 与 DOM 事件桩，不依赖 npm。
- 本地 Python Playwright WebKit 实际 390×844 触屏验证：手势 unlock 返回 true，真实 WebAudio 播放请求成功，三条滑杆/静音控件可操作，弹窗无横向溢出、点外部关闭，切 boss 场景后持续调度，无 pageerror。未生成仓库外的产品页面，也未修改他路 HTML。

## 验证边界

WebKit 自动化确认 API/页面行为，未在实体手机上主观试听或测量功耗；笛与筝均为轻量合成近似音色。后台恢复若受 Safari 音频策略阻止，会保留手势监听以再次解锁。当前事件未区分实际主城入口，主城音乐仍需上述显式接线。
