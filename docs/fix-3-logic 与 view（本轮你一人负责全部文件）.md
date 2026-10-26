# 第三轮 logic / view 修复记录

日期：2026-10-26。按用户最后指令直接在当前 integration 分支提交；未 push，未切换或修改 master。原有 STATUS.md 修改保留且不纳入提交。

## R3-01 · P1 · 已修复

- 改动：main.js 消费 offline:status，在异步结算完成后展示一次收益汇总；当前弹窗、功能浮层或后台期间延后展示，不覆盖操作。增加进度、异常和重试按钮；按精魄/兽卵/装备分类计数，保留满仓截断说明。
- 重试补充：core/idle.js 提供复用现有结算任务的 retry；core/save.js 支持 save(true) 保留时间游标。异常保存不再把尚未处理的离线时间当作已领取，按钮重试不经过 stop/start 重置时间。
- 验证：node tests/run.js 全部通过（41 文件），新增 core_idle_async 的异常保存游标、重试任务防重入断言。python3 tests/e2e/review3_fix.py 通过真实12h启动离线、已有弹窗延后、汇总关闭不重弹、分类/截断说明、异常重试；其中分类文案测试使用明确的合成收益事件，不冒充自然掉落。
- 原样 python3 tools/e2e.py 已通过真实2h离线标题等待，WebKit 390×844，consoleErrors=[]。python3 tests/e2e/view.py 通过，errors=0。全部跟踪/新增 JS 的 node --check 通过。
- 验证边界：末次全流程通过前有一次随机首分钟背包非空断言失败（tools/e2e.py:38），同一代码重跑全程通过；未修改测试以跳过断言。末次 loadingBytes=787152，firstBattleBytes=1542296，consoleErrors=[]。

## R3-02 · P2 · 已修复

- 改动：stage/stage.js 使用 SR.pets.slots(hero) 读取上限，过滤不存在的队伍成员，展示最多三宠。第三宠放在右侧上排，保留中央人物空间；补契兽名称及血条，挂载时读取当前战斗生命。三宠共用原有施法、合体、受击及移除路径；hero:changed 刷新槽位。ui/pets.js 页脚动态显示上限。
- 验证：tests/e2e/review3_fix.py 覆盖49→50级、两宠→三宠、收回/重新部署、三宠刷新读档及三个血条；390×844无全页横溢出。已查看 /tmp/fix3-three-pets.png，第三宠未覆盖中央人物。
- tools/review/review3.py 实测 slots/team/battlePets/stagePets 均为3，页脚“出战 3/3”；100次页面往返监听增量0，节点155→155，stage=1、canvas=0，errors=[]。

## R3-04 · P2 · 已修复

- 改动：audio/m2/audio.js 在 claiming/simulating 时阻止历史战斗音效和场景切换，音乐调度也不生成新声部；收到结算开始状态后清理现有声部/音乐层，完成或异常后按当前战斗快照同步一次场景并恢复调度。真实按钮的 ui_click 反馈保留。
- 验证：audio_m2_runtime.test.js 新增已解锁前台离线期间攻击/技能/掉落无新声部、音乐定时器停止、场景不变，以及完成后同步首领场景/恢复正常攻击音效断言；原有隐藏暂停、释放与卸载测试通过。tools/review/review3.py 真实 WebAudio 的离线振荡器计数=0，errors=[]。

## R3-03 · P2 · 未实现

- 当前仍只有试炼数据，未加入环数/试炼晋阶阻挡，也未开放入口。实现此项需完整挑战结算、通关存档迁移及连续模型重验；本轮优先完成唯一 P1 和上述两项表现 P2，未改变现有升级数值规则。
- 本轮未运行新的60–80h连续矩阵，不宣称模型终点代表完整方案终局或试炼已完成。

## 最终验证与提交边界

- 全部跟踪/新增 JS node --check、node tests/run.js（41文件）通过。
- 原样 python3 tools/e2e.py 完整流程通过，consoleErrors=[]；python3 tests/e2e/view.py 与 python3 tests/e2e/review3_fix.py 通过，errors=0。
- 复核 python3 tools/review/review3.py：三宠/2h汇总/离线音频均符合以上记录，errors=[]。
- e2e 自动改写的历史截图/JSON已恢复，末次运行JSON另存 /tmp/fix3-e2e-integration.json；不把旧文档改写混入修复。STATUS.md 原有修改未动。
