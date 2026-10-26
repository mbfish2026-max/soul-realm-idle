# 第二轮 view 修复

分支：fix2-view；只处理 view 归属，不修改 logic 目录。

| 编号 | 改动 | 验证 |
|---|---|---|
| R2-02 P1 | 接入 bag:capacity；跨页面持续显示容量暂停、整理入口及安全的继续按钮。容量恢复后明确手动继续；自动开关文案解释为技能释放。刷新检查容量，离线弹窗提示容量截断。 | WebKit 实际容量夹具 991 件触发停止，整理一件后点击继续恢复 running，锁定物保留；原样完整 e2e 通过。 |
| R2-04 P2 | 舞台从地图数据及完整名字表取中文标题；iceyak/ashram 明确共享现有 frostdeer 生成立绘，slagbeetle 共享 stone_turtle 动作，不再回落墨狼。现有专图和首领引用保留。 | 原样 e2e 自然进入寒川并完成读档/离线；专项寒川、熔脊标题及三物种实际 DOM 素材路径断言通过。共享素材不是新增专属原画，三种物种专图仍可后续补充。 |
| R2-05 P2 | 按 skillIds 展示红环双技能，分别升级、排序；释放顺序、吸收/替换预览和英雄页同步多技能，兼容单 skillId。 | WebKit 来源红环夹具逐个检查两个技能升级及排序按钮；既有红环执行、替换、剥离 Node 回归通过。 |
| R2-06 P2 | actions 三列可收缩，艺术字限于按钮内容宽度。 | 390×844 图片加载完成后检查 dialog.scrollWidth≤clientWidth，所有操作按钮右边界在 actions 内；完整吸收流程通过。 |
| R2-07 P2 | 保存失败条改用现有生成面板，保留持续警告、准确导出与重试。 | WebKit QuotaExceededError 注入、跨页提示、导出 JSON 与恢复后重试通过；visual_audit 正式入口待替换 0 / 原始候选 93。 |
| R2-09 P2 | 策略文字明确“首领战合契技留待手动”，保持 reserveBossFusion 接口语义。 | 真实策略弹窗及完整 e2e 通过；core_auto / core_auto_battle 普通波与首领保留测试通过。 |

验证：
- 所有跟踪/新增 JS 执行 node --check：通过。
- node tests/run.js：全部通过。
- python3 tools/e2e.py：退出 0，consoleErrors=[]，30 张截图、34 次采集，加载 783357 B，首战 1538501 B。
- python3 tests/e2e/view.py：WebKit 390×844，全部专项通过，pageerror / console.error / HTTP 错误 0。
- python3 tools/visual_audit.py：正式待替换 0；运行生成的历史截图及机器报告已恢复，避免混入非本次所有权内容。

R2-01、R2-03、R2-08 为 logic 归属，未修改；未宣称完整后期方案或平衡通过。
