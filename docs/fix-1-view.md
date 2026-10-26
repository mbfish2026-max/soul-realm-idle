# 第一轮 view 修复

- R-01（P1）→ 所有主页面在未觉醒/未选职业时显示继续入口，关闭开场、觉醒、职业弹窗后仍可恢复；保留空白关闭行为。→ WebKit 实际点击关闭开场（空白）、觉醒（关闭按钮）、职业（空白）后均恢复；Node 全量通过。

- R-08（P2）→ 舞台 idle 图集固定首帧，人物/装备页和契兽 idle 去掉无限帧切换；攻击等一次性动作时序保持。→ stage_actor/stage_events 通过；WebKit 检查舞台 idle 与人物页 computed animationName=none。
- R-09（P2）→ 主动技能卡固定 78px、名称换行、消耗不强制单行；横向滚动并显示“左右滑动查看技能”，生命/魂力独立状态行；每次 HUD 更新保留滚动位置，未进入战斗时安全处理空快照。→ WebKit 390×844 九环主动技能+合契技、刻意加长名称夹具验证：卡宽≥70px、内部元素无宽度越界、文档宽390、收获卡不盖导航、HUD更新不重置滚动。截图 /tmp/fix-view-nine-rings.png 已目检。
- R-03（P1，view 配合）→ 在 main.js 包装既有保存返回值/lastError：失败显示持续可见告警，切页仍保留，提供重试与 JSON 原始进度下载；成功重试后消失。→ WebKit 注入 QuotaExceededError，真实点击跨页、下载并解析备份（99级/九环完整）、恢复存储后真实点击重试通过。未修改 core：仓库容量、分批离线与长时存档容量保障仍需 logic 修复；不声称 R-03 整体已解决。
- R-10（P2）→ 自动策略、技能说明及吸收文案引用 NAMES 已有 key；入口 title、logo 替代文本和开场心契名称从 NAMES 获取；蜕变按钮素材映射引用名称 key。未改公共 names.js。→ 归属内运行源码检索相关专有名词无硬编码；WebKit 动态替换 ringSkill/soulRing 后策略文案同步变化；正式入口与全流程验证通过。

## 验证

- 全部跟踪/新增 JS 执行 `node --check`：通过。
- `node tests/run.js` 与逐个 `tests/*.test.js`：32 个测试文件全部通过。
- `python3 tests/e2e/view.py`：WebKit 390×844，上述专项回归全部通过，pageerror、console.error、HTTP≥400 均为0。
- `python3 tools/e2e.py`：WebKit 390×844，正常主流程全部通过，30张独立截图/32次采集，错误0；加载及首战均<2MB。脚本重写的公共截图和报告恢复，避免提交非归属产物。
- 只改 view 所属实现及 `tests/e2e/view.py` 和本记录。R-02/04/05/06/07 为 logic 条目，未越界修改；R-05 未完成入口继续隐藏。
