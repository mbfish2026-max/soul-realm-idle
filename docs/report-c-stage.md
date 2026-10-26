# C 战斗表现与动作完成报告

## 已完成

- `stage/actor.js`：八态状态机、可覆盖 DUR、可注入定时器、自动回 idle、win/die 保持终态（显式 `set('idle', true)` 可用于新波重置）、destroy 清理。支持单图 CSS 动作和横向图集 steps 帧动画。
- `stage/stage.js`：总线驱动舞台，背景按波次缓慢视差、存档只读魂环叠层、最多两只出战契兽、敌人年限标签和血条、对应环点亮扩散、人宠联动和融合时间轴。
- `stage/fx.js`：有上限的一次性 Canvas 粒子，结束即停止 rAF；伤害/暴击印/治疗飘字、字幕、斩线、屏震、红边。所有临时节点及定时器可清理。
- `stage/boss.js`：66%/33% 血条刻度、壹贰叁阶段印、真实倒计时预警、红色十万年魂环落地表现。
- `stage/absorb_fx.js`：光柱、魂环升空、成功聚拢/失败消散；只表现结果，不计算概率或修改存档。
- `stage/stage.css`：局部 sr- 前缀、水墨风、390px 优先，只有呼吸循环；支持 reduced-motion。
- `stage/demo.html`、`demo_driver.js`：file:// 可打开的独立假战斗驱动，局部 bus、确定性 rng 和示例 state，不依赖 A；按钮覆盖常规、首领、融合、吸收；脚本额外覆盖掉环、吸收成功/失败。

## 对外接口与集成

依次加载 `names.js`、实际 bus/save、可选素材清单，再加载 `stage/actor.js`、`stage/fx.js`、`stage/boss.js`、`stage/stage.js`、`stage/absorb_fx.js`，引入 `stage/stage.css`。正式游戏不要加载 demo_driver.js。

- `SR.stage.mount(el)` 返回 `{el, actors, fx, destroy(), trackFx(effect)}`，同一容器重新挂载自动销毁旧舞台；`SR.stage.current` 保存当前舞台。容器默认高 528px，可通过 CSS 调整。
- `SR.actor.create({el?, sprites?, dur?, schedule?, cancel?})` 返回 `{set(state, force?), state, destroy()}`；`SR.actor.DUR` 是默认时长表。无 DOM 可测试纯逻辑。单图为路径字符串或 `{file}`，横向图集为 `{file, frames, w, h}`（w/h 为显示帧尺寸），一次性播放并保留最后一帧。
- `SR.stage.commands(event, payload)` 返回纯表现指令 `{at,type,data}` 数组，at 为毫秒。
- `SR.stageFx.absorb({color, ok, el?})`：默认作用于当前舞台，也支持 B 传吸收面板内的定位容器，返回 `{destroy()}`。容器需有非零尺寸和相对定位；约 3.1 秒自动清理。挂在当前舞台的效果随舞台销毁。
- `SR.stageFx.create(el)` 提供 burst、damage、title、shake、edge、once、later、active、destroy。治疗飘字用负 dmg。
- 素材优先读取 `SR.ASSETS[key].file`，路径相对仓库根；缺失姿态优先对应 idle，再回退 mock/assets。敌人查 `mob_<kind>`，首领查 `boss_<kind>`，背景查 `bg_forest`。可通过 `SR.stage.assetBase` 覆盖根 URL。

监听事件：`battle:wave_start/attack/skill/fusion/hp/kill/hero_down/boss_phase/wave_clear`、`loot:drop`、`pet:changed`。payload 遵守 docs/interfaces.md，无新增事件或存档写入。

技能在 0/120/140/260/380ms 展示蓄势、环、字幕、人宠出手、斩线；带 skillId 的 attack 在 480ms 展示真实伤害，普通攻击 180ms 命中。演示宠物攻击由独立真实格式事件在 620ms 展示。融合在 0/60 起逐环/200/420/640ms 展示蓄势、逐环、字幕、出手、冲击；wave_clear 在 1300ms 展示胜利。kill 事件延后 700ms 展示倒下；不自行推断血量或制造追击伤害。

## 验证

- 按要求对全部已跟踪和新增 JS 执行 `node --check`。
- 执行全部 `tests/*.test.js`；当前为 stage_actor 和 stage_events，均通过。
- `python3 stage/shoot.py` 使用 Python Playwright WebKit，390×844、file://，生成 `docs/shots/c_*.png`，检查浏览器控制台、图片加载、横向溢出、粒子停帧、终态不被旧定时器打断及切换/销毁清理。
- 截图覆盖常规、首领预警、首领掉环、融合、吸收过程、吸收成功/失败；已人工查看画面并调整两侧暴击数字边距。

## 未做与已知限制

- 不修改正式入口、战斗核心、B 的吸收面板或 D 素材；由集成路加载和挂载。
- 使用现有 mock 素材兜底，无新增图片资产；未制作正式动作图集。支持横向单行图集，多行图集尚不支持。
- 契兽当前使用 fox 素材键；不同 speciesId 的美术映射需后续数据约定。背景当前 forest，其他地图背景映射待美术资源补齐。
- 未实现独立技能栏、冷却和业务日志，这些属于 B/UI 或集成。演示按钮只发假战斗事件。
- 并发技能不暂停核心战斗；表现按总线实际事件顺序播放，可能互相打断动作。低端实体手机性能未实测。
- 红环可由十万年首领 kill 或 red essence 的 loot:drop 触发，每波最多展示一次，避免击杀和掉落双事件重复。
