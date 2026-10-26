# A 路：战斗与挂机核心交付

## 完成情况

已完整阅读 AGENTS.md、docs/interfaces.md、docs/plan.md、mock/README.md 与 mock 下全部 HTML/CSS/JS。实现纯 JS 普通 script，全局 SR，core 无 DOM 依赖；未修改其他路目录，names.js 仅追加 A 路名词。未访问或修改 master，未 push。

- core/bus.js：on/off/once/emit，订阅返回取消函数，emit 使用监听器快照，once 先注销后调用，可安全递归。
- core/rng.js：统一随机函数与 seed(n)，固定种子可复现。
- core/battle.js：50ms 固定步进，tick(dtMs) 接受累计时间；主角、最多两只契兽与一波敌人；1 秒普攻、自动技能、共鸣；五层各十波，末波首领；66%/33% 阶段预警，3 秒后攻击全队；倒下退回本层第 1 波；通关第五层后循环第五层。
- data/maps.js：万渊林与五层原创怪物、首领、权重、年限范围和推荐战力；第五层到千年。顶层 monsters/boss 保持 §4 格式，扩展 floorTables 保存分层配置。
- core/loot.js：击杀发灵晶和经验，概率掉精魄、兽卵、六部位灵骨；首领必掉精魄与兽卵；背包满自动折算灵晶，仍发 loot:drop。
- core/bag.js：背包、仓库增删移动排序锁定分解，bagCap 检查、跨背包重复 UID 检查、存档持久 UID 序号。
- core/save.js：sr_save_v1 本地存读、Node 内存 storage、默认字段补齐、v0→v1 迁移钩子、未来版本拒绝迁移、错误记录 lastError；dirty 时 30 秒自动保存，波次/倒下/养成/离线关键事件即时保存。写入失败保持 dirty 与原时间。
- core/offline.js：12 小时上限、70% 系数、按当前层固定期望速率发灵晶经验与白黄紫精魄；领取更新保存时间防止重复；离线预览不占用 UID。
- core/idle.js：100ms interval 串接加载、离线领取、战斗、存档；后台间隔超过 5 秒用离线模型结算并重开当前波；pagehide 存档，start 幂等、stop 清定时器并保存。

## 对外接口与集成

按 names.js → core/bus.js → data/*.js → core/*.js → systems/*.js → 其他路 → main.js 加载。core 脚本定义阶段不依赖彼此加载顺序，调用前需全部加载完。

入口 SR.idle.start() 会自行 load 并领取离线收益，再在 flags.awakened 为 true 时启动战斗；觉醒后发 hero:changed 可启动。不要在 idle.start 前另行修改未保存的 SR.save.state，否则 load 会覆盖。SR.idle.stop() 退出。

- SR.battle.start()/stop()/setAuto(bool)/tick(dtMs)/snapshot()。setAuto(false) 关闭技能与共鸣，普攻继续；snapshot 返回深拷贝。
- 属性优先读取 SR.stats.hero(state)/pet(pet)，要求返回 atk/def/hp（也接受 hpMax）；缺少 provider 时读 souls/pets.baseStats 并简单成长。hero:changed、pet:changed 后更新属性和出战列表。技能 cd 单位秒，mult 为伤害倍率；魂环技能事件 ringIndex 是从 0 开始的索引，武魂/契兽技能为 null。
- 所有 battle 事件、loot:drop、offline:reward、save:loaded/saved 均使用 interfaces.md 已有事件名与 payload。伤害在逻辑事件时即时生效，C 路自行安排表现动画。
- SR.loot.init() 幂等订阅 battle:kill；单独运行 battle 时须调用它才能掉落。SR.loot.drop(enemy)、color(years)、essence(years)、grant(item) 可直接调用。
- SR.bag.add(item,where='bag') 返回 item，满包分解或重复 UID 返回 false；remove(uid,where) 返回物品或 false；move(uid,from,to) 返回 bool；sort(where)；lock(uid,locked?,where) 返回 bool；dismantle(uid,where) 返回灵晶值或 false。where 为 bag/store；锁定防止删除分解，允许移动；仓库暂无限容量。
- SR.save.load()/save()/markDirty()/tick(dtMs)/state；create() 建新档，migrate(state) 补齐并迁移，migrations[版本] 可注册函数。cloud.push(state)/pull() 均返回 rejected Promise，错误 not configured，集成可替换实现。
- SR.offline.expected(state) 暴露每秒期望，calculate(state,nowMs?) 返回预览（会推进 RNG，不会改库存/UID）；claim(nowMs?) 实际入账并发事件。seconds 是封顶后的实际秒数，70% 只乘产出；预览物品 uid 为 null，入包时生成 UID。

## 验证

全部 JS 执行 node --check；全部 tests/*.test.js 执行 Node，无 npm 依赖。共六个测试：bus、battle、loot、save、offline、idle。B 路的最小 souls/skills/pets/stats 桩仅在测试文件内。

固定种子 42，按 100ms tick 模拟 600 秒：143 击杀、64 物品掉落、47 波清理、9 首领阶段事件；推进层数，覆盖技能和共鸣。另验证 provider 优先级、倒下本层重置、stop 停止模拟、事件名白名单、颜色边界、100 次首领必掉卵、满包分解、锁定移动、迁移、30 秒保存、离线上限与 70%、无黑红、重复领取、主循环幂等和后台结算。

提交：2193145 基础；809f28b 战斗/掉落/离线与模拟；报告另提交。

## 未做与已知限制

- 不做觉醒/升级/吸收/孵化 UI、舞台表现、美术或入口 HTML，归其他路。经验累加到 hero.exp，升级由 B 路消费。
- 云存档仅约定占位，未接 Supabase、账号与网络同步。
- 数值为 MVP 初值，未做 60–80 小时平衡；离线期望按每 7 秒一次击杀、含首领权重的简化模型，不按当前角色真实 DPS 回放；离线暂只给精魄和货币经验，不给卵或装备。
- 没有 B 路 pets 表时掉卵 speciesId 为 null，没 skills 表时精魄 skillId/vein 为 null；完整游玩须加载 B 路数据。共鸣 MVP 为 bond>=100 的人宠组合，没有配方筛选和宠宠共鸣。
- 战斗不做手动施法接口；setAuto 只切自动技能。战斗不实现装备/魂环属性叠加的完整公式，等待 SR.stats provider。
- localStorage 访问不可用时退到内存；存在但写入失败时 save() 返回 false，lastError 保存异常；读档损坏回退新档并保留 lastError，不另存备份。迁移支持结构补齐，不提供恶意/任意字段的完整校验。
- bus 监听器异常会向调用者抛出，调用者应确保处理器可靠。未做浏览器视觉验证，A 路验收均为无 DOM 的 Node 逻辑测试。
