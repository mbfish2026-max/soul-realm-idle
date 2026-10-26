# 第三轮 logic / view 修复记录

日期：2026-10-26。按用户最后指令直接在当前 integration 分支提交；未 push，未切换或修改 master。原有 STATUS.md 修改保留且不纳入提交。

## R3-01 · P1 · 已修复

- 改动：main.js 消费 offline:status，在异步结算完成后展示一次收益汇总；当前弹窗、功能浮层或后台期间延后展示，不覆盖操作。增加进度、异常和重试按钮；按精魄/兽卵/装备分类计数，保留满仓截断说明。
- 重试补充：core/idle.js 提供复用现有结算任务的 retry；core/save.js 支持 save(true) 保留时间游标。异常保存不再把尚未处理的离线时间当作已领取，按钮重试不经过 stop/start 重置时间。
- 验证：node tests/run.js 全部通过（41 文件），新增 core_idle_async 的异常保存游标、重试任务防重入断言。python3 tests/e2e/review3_fix.py 通过真实12h启动离线、已有弹窗延后、汇总关闭不重弹、分类/截断说明、异常重试；其中分类文案测试使用明确的合成收益事件，不冒充自然掉落。
- 原样 python3 tools/e2e.py 已通过真实2h离线标题等待，WebKit 390×844，consoleErrors=[]。python3 tests/e2e/view.py 通过，errors=0。全部跟踪/新增 JS 的 node --check 通过。
- 验证边界：末次全流程通过前有一次随机首分钟背包非空断言失败（tools/e2e.py:38），同一代码重跑全程通过；未修改测试以跳过断言。末次 loadingBytes=787152，firstBattleBytes=1542296，consoleErrors=[]。
