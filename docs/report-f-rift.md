# F「无尽秘境·成就·日常」交付报告

## 交付

工作分支 dev/f-rift，基于当前 integration 内容；未切换或修改 master/integration，未 push。只修改负责的 features/rift、features/achieve、features/daily、三个 feat 测试；公共 names.js / docs/interfaces.md 均仅追加，另新增本报告。

- 渊层秘境：读取正式 SR.stats.hero / pet 攻防，出战契兽增加协力攻击；双方每回合交锋，先手击败守卫则不受该回合反击，最多 120 回合。挑战同步结算，不消耗体力、货币，不锁时间；不会改动主线挂机状态、地图或生命。失败可立即重试，成功自动前进，可选前一层或最高待通层；已通层可以重复刷取。
- 不设内容层数上限，数值随层增长：气血 500×层数^1.65，攻击 24×层数^1.35，防御 5×层数，灵晶 50×层数。只在 JS 安全整数/有限数值范围保护极端值，无普通地图层数限制。
- 每层必得红魂环精魄，起始十万年，每五层增加十万年；十万年零纹，二十万年一纹，一百万年九纹，之后仍可提高年限，金纹封顶九道。奖励使用真实 loot.essence 和 bag.add，背包满直接放仓库，不触发满包折算灵晶。
- 30 个成就：击杀、首领、清波、轮技、共鸣、吸收、掉落、秘境通关、伤害、离线秒数十类各三档。监听 bus，排除敌方伤害/轮技，吸收只计成功；每档奖励 100/200/300 灵晶和 1/2/3 契符，逐项手动领取、不可重复领取。
- 每日五项固定任务：击杀20、清波5、轮技15、掉落5、伤害3000。前四项各80灵晶，伤害项120灵晶与1契符。本地日期更新，无体力、无等候步骤；跨日后下次计数/打开/领奖立即重置，日期回拨不重置，避免重复领取。日常不要求吸环或其他消耗资源行为。
- 三个水墨面板，内容独立滚动，按钮最小44px，点击遮罩或关闭按钮退出，打开面板计数随事件更新并保留滚动位置。无动画、图片或额外运行依赖。

## 集成方式（需集成路执行）

在原有 names、bus、rng、save、bag、loot、数据、systems/stats 等脚本之后追加普通 script，顺序如下：

1. features/rift/shared.js
2. features/rift/rift.js
3. features/achieve/achieve.js
4. features/daily/daily.js

引入 features/rift/panels.css。三个模块依赖 shared.js，脚本定义阶段不启动、不改主入口。

在 SR.idle.start() 前分别调用 SR.rift.install()、SR.achieve.install()、SR.daily.install()，以接收本次加载的离线奖励。install 幂等；save:loaded 自动补齐各自字段，不需要 A 改迁移器。

集成方可在「历练」或功能菜单挂三个入口，点击调用 SR.rift.open()、SR.achieve.open()、SR.daily.open()。也可给每次 install 传入 {entry:入口DOM容器} 自动追加一个按钮；同容器重复 install 不重复加按钮。原四 Tab 不必修改。面板直接挂在 body，可叠在现有 UI 上；集成入口应避免同时打开另一个模态窗。

可直接调用：SR.rift.challenge() 返回 false（未觉醒/重复进入）或 {ok,floor,rounds}；SR.rift.select(整数层) 仅允许 1 到 best+1；SR.rift.scaling(floor) 返回守卫数值和奖励；SR.rift.goldLines(years) 返回0到9。成就/日常 .claim(id) 返回布尔，.definitions 暴露条件，.render() 返回 HTML。

公共接口提案位于 docs/interfaces.md「变更提案-f-rift」。新增 state.rift / achieve / daily 和四个事件，全部由 save 原样持久化。金纹以年限为唯一依据，精魄额外 goldLines 只是便于展示的冗余值。

需 B 配合：在现有精魄、已吸收魂环界面按年限调用 SR.rift.goldLines(years) 展示金纹。现有 rings.absorb 不复制 goldLines 字段，但保留 years，因此不会丢失金纹。吸收容量/概率与属性收益仍遵循 B 的正式规则，F 不修改其数值。

## 验证

- 每次提交前对全部跟踪与新增 JS 执行 node --check；全部15个 tests/*.test.js 通过。
- feat_rift：未觉醒拒绝、金纹边界与封顶、高层缩放有限、越层/小数拒绝、成功推进、奖励、满包入仓不额外折算、失败不奖励、重刷、save/load。
- feat_achieve：30条唯一ID、install幂等、防重复领取、奖励两货币、吸收失败不计、敌方伤害/轮技不计、全成就可领取、存档恢复。
- feat_daily：5条任务、未完成不能领、幂等计数、防重复、本地跨零点重置、奖励、save/load、日期回拨防重置。
- Python Playwright WebKit 390×844，真实模块加载：三个面板无控制台错误、无页面/面板横向溢出；遮罩关闭；秘境挑战所得；成就领奖后按钮禁用。验证使用临时内存页面与仅注入测试用属性 provider，无预览桩进入正式文件。

## 范围与限制

秘境采用公开回合公式直接结算，不播放主线战斗动画、不套用主线随机暴击/轮技/敌方阶段AI。主线挂机正常继续；秘境通关发独立事件，因此只计秘境成就与实际掉落，不虚增主线击杀/伤害。当前公式属于独立秘境初始平衡，未进行80小时终局数值验证。

成就从 install 后观测到的事件起累计，不从旧 stats.kills 或当前库存追溯；日常日期按设备本地时间，属于单机存档规则，无服务端时钟。不会创建定时器，面板静置跨日会在下一次事件或交互时刷新。save.markDirty 遵循核心30秒落盘机制，不自行覆盖其保存时序。

提交：9b0f24c 功能与测试；本报告另提交。
