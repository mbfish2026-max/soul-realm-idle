# WIRE2 集成接线验收

在 integration 完成，未 push，未切换或修改 master。待合并清单仅含 world-map；dev/bag-grid 已由上游合入。dev/world-map 单独合并提交为 82ddf1c，names.js 与 interfaces.md 冲突保留双方追加内容；待合并清单已删除。背包上游报告实际名为 docs/report-bag.md，未提供 report-bag-grid.md。

## 正式功能

- index.html 加载 progress 与 worldmap JS/CSS；底部六页签、战斗页与手札均可进入山河行卷。六区域、每区八节点，共 48 节点。地图卸载清理详情；地图按钮使用生成图九宫格，390 宽无横向溢出。
- 战斗生成读取 encounter，普通五波、关底十波且末波首领；clearWave 完全替代旧楼层推进。同步兼容 map 字段供掉落、舞台和素材使用；顺序解锁、原地挂机、前沿选择、首领策略、每区一次奖励均走同一逻辑。秘境保留独立 rift，不推进主线。
- 选择节点先拒绝离线结算中的请求和非法/未解锁节点，再停止、切换、同步、保存并重启战斗。死亡同时重置 world.wave。自动 advance/challengeBoss 直接复用既有设置。
- 格子背包正式加载，分类、四种排序、整理、多选出售/分解、锁定保护、详情、满包提示/转仓复用已有功能。入口包装移除旧的全背包来源长列表，来源魂技仍在吸收详情中展示。
- 本地键仍是 sr_save_v1，外层版本仍 v2。v0/v1 沿既有装备迁移升级，v2 原样读取；world 使用独立 v1 子结构，进入离线前迁移旧地图，保留新地图进度、背包/仓库与物品属性。无历史逐波记录的旧档只保守承认已通下界，不补发历史区域奖励。
- 离线主流程继续真实战斗模拟；兼容公式路径也读取当前节点、实际物种来源，取消 9999 年截断。完整培养模拟发现一分钟分块重置敌人血量的卡首领问题，已增加连续游标/同存档/同位置的运行时续接；读档、手动切图仍重新开战。十分钟单段与十个一分钟分块在相同种子下的击杀、地图与敌人血量一致。失败与修复证据见 wire2-offline-regression.json。

## 验证

44 个 tests/*.test.js 全通过；tests/run.js 逐个运行这 44 个文件，另含 10 项集成断言：三种版本迁移、普通节点、首领解锁与奖励、原地重刷、禁用首领、真实离线推进、高年限来源、分块一致性。全部跟踪/新增 JS 语法检查通过。完整输出见 wire2-tests.txt；文件摘要见 wire2-verification.json。

运行 python3 tools/audit_drawn.py 与 python3 tools/visual_audit.py，正式入口可替换项 0；仓库内开发参考和测试候选仍如实保留在审计文档，不等于正式入口残留。

平衡使用真实战斗、掉落、培养花费与离线结算，达标定义为 99 级且 48 节点全通，不使用满级满装夹具。最终 60/60 场景均在 60–80h 内：

| 场景 | 数量 | 时长范围 |
|---|---:|---:|
| seed 4200，六职业×三档操作频率×在线/离线，基础培养 | 36 | 69.133–75.000h |
| seed 4200，六职业×在线/离线，高频完整培养 | 12 | 69.733–74.200h |
| seed 4201，六职业×在线/离线，高频基础培养 | 12 | 70.033–74.150h |

三条命令及全部结果保存于 balance-wire2.json，均以 --assert-target=true 运行并返回 0。本轮没有调低敌人属性或修改经验曲线来掩盖离线卡关。

python3 tools/e2e.py：WebKit 390×844，console.error、pageerror、HTTP 错误均 0，43 张唯一截图，所有截图无横向溢出。覆盖原有觉醒/职业/魂技/宠物/装备/秘境/日常/离线，以及新增背包筛选/排序/整理/多选出售和分解/满格转仓/详情、地图锁定/重刷/前沿/首领/区域一次性奖励/离线期间禁止切图。额外真实 localStorage v0/v1/v2 读档检查物品 UID、旧槽迁移、锁定、仓库数量与地图进度。背包操作和首领边界使用显式隔离夹具，执行真实 UI、选择事件和 battle.tick；验收后恢复原存档，不冒充自然养成过程。

关键截图均在 docs/shots/：

- int2_wire2_bag_filter.png、int2_wire2_bag_detail.png、int2_wire2_bag_multi.png、int2_wire2_bag_confirm.png、int2_wire2_bag_full.png。
- int2_wire2_map_overview.png、int2_wire2_map_locked.png、int2_wire2_map_repeat.png、int2_wire2_map_frontier.png、int2_wire2_map_boss.png、int2_wire2_map_reward.png。
- int2_wire2_legacy_v0.png、int2_wire2_legacy_v2.png、int2_09_reload.png、int2_10_offline.png。完整列表见 e2e-integration.json。

12 小时真实 idle.start 浏览器结算也通过：一次最终收益、无并行战斗、零错误；仓库满时暂停，报告包含未收益时间，不宣称满仓还能获得整段收益。原始结果见 wire2-offline-browser.json。

## 体积、素材与遗留

最终正式入口实测加载页 812357 B（0.812 MB），首次战斗累计 1572197 B（1.572 MB），均小于 2 MB。后续进入地图、装备、养成等页面的累计资源不计作首屏，完整请求量见 e2e-integration.json。

本轮两路交付新增生成贴图共 24 张：背包 9、地图 15；来自 3 次源图生成，详见各自 provenance。WIRE2 自身新增生图 0，复用已交付素材。

遗留：未测实体 iPhone；旧档缺失的逐波历史无法重建；不跨读档保存敌人运行时血量（仍按新战斗开始）。无阻塞接线遗留。完整培养曾暴露的离线卡首领问题已修复并回归，未用跳过失败场景代替修复。
