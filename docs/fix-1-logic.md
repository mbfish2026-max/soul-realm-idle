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
