# 第一轮 logic 修复记录

工作分支 `fix1-logic`，基于 integration 的独立 worktree。仅修改 logic 目录及本记录；不 push，不切换 master/integration。

## R-04 · P2

改动：底层吸收和替换吸收均在任何变更前拒绝 locked 精魄（返回 reason=locked）；孵化拒绝锁定兽卵。

验证：`tests/skill_rings.test.js` 对锁定仓库精魄检查整个 state 不变；`tests/sys_pets.test.js` 验证锁定卵保留。

## R-06 · P2

改动：魂环同步时为有来源的红环派生两个 skillIds，保留旧 skillId 供现有详情兼容；实际 entries/自动施法/手动 cast/优先级/学习使用两个技能。旧档在同步时派生；替换和剥离清除该环全部技能等级与优先级。

验证：`tests/skill_rings.test.js` 红环吸收得到两个 entries，存取档保持双技能，剥离清空绑定。界面展示仍由 view 路负责。

## R-07 · P2

改动：save v1 迁移 rarm→belt，gear 复用 save 的映射；装备槽冲突进仓，保留 UID/锁定/词条；gear 迁移不再清空散件 setId（套装计算仍只计前八格）。

验证：`tests/core_fix_review.test.js` 检查迁移的 belt、锁定和背包槽位；完整测试覆盖 gear 迁移。既有错误 v2 无法区别合法 weapon 与误迁右臂，不猜测重写；已被旧代码删除的 setId 无法恢复，需原始 v1 备份。

## R-03 · P1（logic 防护完成，view 接线待完成）

改动：自然战斗在仓库达到 991 件时暂停，预留同一战斗步最多九件掉落空间；已有物品（含锁定/稀有）不删除，旧的超量仓库不裁剪。整理后可重新开始。无战斗的离线保底结算也按剩余容量限制有效产出时间；自动吸收 pending 清理失效 UID。容量状态由 `SR.bag.capacityStatus()` 提供，并发出 `bag:capacity`。

保存失败保留 dirty 和原时间戳，提供持久状态 `SR.save.status={failed,name,at}`、`save:failed` 事件及 `SR.save.export()` 原始 JSON 恢复数据；成功保存清除失败状态。失败重试按 30 秒节流。

新增 `SR.offline.claimAsync(now,onProgress)`：每分钟游戏时长结算一次、让出事件循环、只发一次最终 offline:reward，防止每批弹窗/保存；并发异步领取会拒绝。同步 claim 保持兼容，满仓即停止战斗模拟，消除旧库存越大越慢的累积。

验证：`tests/core_capacity.test.js` 高等级/秒杀压力夹具重复领取七轮12小时（84小时），默认不卖不吸收，保存字符串受50万字符限额约束且全部保存成功，重载物品/货币/角色保持，满仓停止、整理后恢复。`tests/core_offline_async.test.js` 验证让出事件循环、进度、单次奖励和时间游标；`tests/core_fix_review.test.js` 验证容量错误事件、持久失败状态和导出。

**view 待接线（本路无权限修改）**：在主界面持久展示 `save.status.failed` 与 `bag.capacityStatus().paused`，提供导出按钮、整理后继续战斗入口；入口调用 `claimAsync` 并显示进度。当前 main.js 仍使用同步 claim，因此不声称正式页面已有异步进度或保存失败提示。Node 压力测试不等于浏览器容量验收。

## R-05 · P2（部分修复）

改动：末层首领击败记录 flags.mapsCleared；自动推进开启且满足后图 unlock.level 时自动进入下一图并重置层/波次。40/60级不再永远停留第一图。关闭自动推进仍留在本图。

验证：`tests/core_map_progression.test.js` 覆盖末层击败、等级不足、40/60级跨图及推进开关。

未完成：试炼/环数破境门槛、后期第三契兽出战以及对应入口。主入口的升级函数归 view，不能在此路修改；不将三图推进称为完整后期方案。
