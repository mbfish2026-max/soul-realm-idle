# B 武魂 / 魂环 / 契兽系统与界面完成报告

已完成里程碑 1 的 B 路功能，提交位于当前 dev/b-systems 分支；未 push，未修改其他路目录。names.js 和 docs/interfaces.md 仅追加。docs/shots/ 是任务明确要求的截图输出。

## 已完成

- 数据：器/兽/本体各一个武魂，8 个轮技、8 种契兽、10 阶境界。灵狐可选碧尾/映月两条蜕变分支，条件包含满段、行为计数及兽魂材料。
- 觉醒三选一、1% 双相、天资 1–10；已觉醒存档不能重选。
- 魂环承受上限含槽位、天资、武魂类别；成功率公开 talent + fit + over 并限定 [0,1]。每十级一个槽、九槽封顶。失败只销毁精魄，等级/经验保留。剥离返还年限 50% 的精魄。年限收益为 log10(1+years)。
- 孵化、兽魂喂养、1–9段每段9阶、10段无细分阶、分支蜕变、满段化轮、图鉴残影、出战切换（20级前1只，之后最多2只）。击杀与清波事件更新出战契兽行为计数器。
- 人物/契兽属性、战力、同脉轮脉共振 +20% 技能倍率、契心值属性加成。
- 水墨宣纸界面：角色魂环页、契兽页、背包/仓库、觉醒选择、吸收面板、底部四 Tab。使用清新绿与朱印、圆形玉盘/CSS 环；无持续动画。390×844 下契兽主要操作在底部导航上方；多宠选择可横向滚动。
- UI 通过请求事件调用系统；背包搬运事件由 UI 层处理，均调用 markDirty。所有新增专有名词集中追加至 SR.NAMES。

## 对外接口与接入

完整补充见 docs/interfaces.md 的「B 系统补充」。加载 names → bus → data → systems → ui（tabs.js 先加载）后，调用 `SR.ui.mount(el)`；觉醒调用 `SR.ui.awaken()`；吸收调用 `SR.ui.absorb(essenceUid)`。正式入口需加载 ui/ui.css。

`ui/preview.html` 支持 `?panel=hero|pets|bag|absorb|awaken|battle`，可直接 file:// 打开。`ui/preview_stub.js` 提供仅预览使用的 bus、rng、save，正式入口不可加载。Node 测试的依赖桩只放在 tests/sys_*.test.js。

战斗方读取 `SR.stats.hero(state).ringMult[index]` 获取已包含年限与共振的对应轮技倍率；`teamPower` 包含出战契兽。化轮产物先进入背包，由玩家决定后续吸收，遵守环槽限制。

## 验证

- 提交前对全部已跟踪及新增 JS 执行 node --check，通过。
- 全部 tests/*.test.js 通过：sys_awaken、sys_rings、sys_pets、sys_stats。
- Python Playwright WebKit，390×844，file://，六个页面均无 JS/console error、无横向页面溢出。
- 浏览器操作通过：点空白关闭两类弹窗、觉醒选择、存入/取回仓库、成功吸收、孵化、培养到满段、预览并选择蜕变分支。
- 截图：docs/shots/b_hero.png、b_pets.png、b_bag.png、b_absorb.png、b_awaken.png、b_battle.png。均以390×844视口生成 full_page 截图，超出视口的页面保留完整内容。

## 未做 / 已知限制

- 主入口、战斗舞台、实际战斗结算、掉落、存档落盘和音频属于其他路。battle Tab 为接入占位；可由集成方覆盖 SR.ui.battle(state) 返回内容 HTML。
- 双相目前保存标记，不增加第二武魂或技能树；灵骨装备、技能洗练、完整共鸣配方、80小时经济平衡不在此次 MVP。
- 契兽美术沿用 mock 灵狐；其他种类没有正式资源时用 mock 墨狼占位。正式资源优先查 SR.ASSETS 对应 key。未新增美术资源。
- 剥离不收额外材料；背包满时拒绝剥离/化轮/取回，当前反馈以操作无变化为主，可在后续加入统一提示。化轮有确认弹窗，尚未满足条件也会拒绝执行。
- 数值为 MVP 初值；行为计数器 kills 指出战时队伍击败次数，battles 指出战时清剿波次，并非最后一击归属。
