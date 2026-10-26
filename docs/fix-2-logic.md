# 第二轮 logic 修复

分支：`fix2-logic`，基于 integration；仅修改 logic 所属实现、测试和本记录，未 push。

## R2-03 · P2 · 异步离线接线（逻辑完成，界面配合待接）

- 改动：`core/idle.js` 的启动、节流长间隔、visibility 恢复均使用 `claimAsync`。结算期间禁止 tick 和 hero:changed 触发开战；重复启动/恢复共用当前任务；结束保存后仅在前台且 idle 仍运行时开战；异常保留已提交的时间游标，暂停等待恢复重试。隐藏/停止发生在分块间也不会误开战。
- 接口：`idle.start()` 返回结算 Promise；`idle.settling()` 查询状态；`offline:status` 携带 `{claiming, progress, result?, error?}`，供 view 连接进度和最终收益弹窗。`offline:reward` 仍仅最终发一次。
- 验证：`core_idle_async.test.js` 覆盖启动、进度、防重入、后台完成、前台恢复、异常重试、停止中结算；原 idle/auto 测试改为等待真实异步完成。
- view 协作：`main.js` 的启动代码仍同步检查局部 offline 变量，需 await `idle.start()` 或监听结算结束再显示收益；进度/异常展示也需接 `offline:status`。本路不修改 main.js/ui。未将界面进度或浏览器长任务检查声称为已完成。

## R2-08 · P2 · 后期三宠（部分修复）

- 改动：`pets.slots(hero)` 按等级段读取现有 `realms[].petSlots`（无扩展数据时保留兼容默认值），部署和 battle.refresh 共用该上限。20 级双宠、50 级三宠，第四只仍拒绝；战斗不再把有效队伍硬截成两只。
- 验证：`sys_pet_slots.test.js` 覆盖 1/19/20/49/50/99 级边界、部署/换宠和真实 battle snapshot 中的参战数量。连续模型同步允许自然孵化第三宠。
- 未完成：试炼结算与环数破境门槛仍未接入。启用门槛会改变 `main.js` 的等级推进和卡关提示，需要 view 同步提供可达挑战入口；本路不擅自使已有存档在隐藏入口前卡关。当前仍为可跨图的前期闭环，不宣称完整方案全部实现。
