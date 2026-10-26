# e-content 跨路接入请求

字段与语义以 docs/interfaces.md 末尾「变更提案-e-content」为准，完整内容/参数/限制见 docs/report-e-content.md。

- 集成路：原 data/*.js 后加载 ext/progression.js → ext/pets.js → ext/maps.js → ext/install.js；系统初始化前调用 SR.content.install()，无需新 Tab。
- A：实施 realms.trial、maps.unlock/eggPool、boss.phases、resonances；兽卵池必须限定地图，避免原全池随机直接掉神级终点。万渊林建议 fox/crane/turtle/deer/hawk/tiger/bud；新地图使用表内 eggPool。黑红精魄仅在线首领掉落，离线仍封顶紫色。完成全内容时长与经济验证。
- B：消费 souls.branches、境界经验与试炼入口、三宠位、宠物 passiveSkills、ringTiers/ringAffixes、红环双技能、共鸣图鉴；不要把新增字段当成已被旧系统执行。
- C：新图背景与新 boss 轮技预警表现，共鸣名称由实际配方提供。
- D：新武魂/契兽/技能图标音画，bg_snow/bg_ridge，四个新 mob 与 snowlord/ridgelord 首领素材。
