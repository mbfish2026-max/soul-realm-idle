# AGENTS.md — 魂域挂机（soul-realm-idle）

## 目标
手机竖屏网页挂机游戏，斗罗式「武魂+魂环」×「契兽」养成，中国水墨清新风。设计方案：`docs/plan.md`；已通过的样板：`mock/`（动作状态机、人宠联动时序见 mock/README.md）。当前里程碑 1 = MVP 最小可玩循环（觉醒三选一 → 挂机刷怪 → 精魄掉落/吸收 → 兽卵/契兽出战 → 存档/离线收益）。

## 技术约束
- 纯 JS，无构建、无 npm 运行时依赖。普通 `<script>` + 全局命名空间 `SR`（不用 ES modules，兼容手机 Safari 与 file:// / GitHub Pages）。
- 390×844 竖屏优先；按钮一行放得下；点空白处关闭弹窗；除呼吸外动画一次性播放；Canvas 粒子用完停 rAF。
- 体积：单张图 ≤300KB（首领 ≤600KB），优先 webp/png 压缩；JS 每文件尽量 <800 行。
- 接口以 `docs/interfaces.md` 为准（事件名、存档结构、数据表字段）。
- 可参考/拷贝 `/workspace/idle-arpg`（暗夜挂机）的思路与代码（存档、cloud.js、audio.js、背包、掉落、离线）。

## 命名约定
- 保留：「武魂」「魂环」（十年白/百年黄/千年紫/万年黑/十万年红）、宠物 9 级（奴仆级…神级）。
- 其余用原创名：契兽、心契、蜕变、灵骨、轮技、渊兽、渊主、灵晶、凡士/灵士/灵师/灵尊/灵宗/灵王/灵帝/灵圣/灵极/天称。
- 所有玩家可见专有名词放 `names.js`（`SR.NAMES`），代码引用 key，不写死。
- 不得出现两部原作的人名、地名、角色、具体魂兽/魂宠名、剧情。

## 文件所有权（只改自己的目录；需要别人改的写进 docs/requests-<你的名字>.md）
| 路 | 目录 |
|---|---|
| A 战斗与挂机核心 | `core/`, `data/maps.js`, `tests/core_*.test.js` |
| B 武魂/魂环/契兽 | `systems/`, `ui/`, `data/`（除 maps.js）, `tests/sys_*.test.js` |
| C 战斗表现 | `stage/`, `tests/stage_*.test.js` |
| D 美术与音频 | `assets/`, `audio/`, `tools/art/`, `tests/assets_*.test.js` |
| 集成 | `main.js`, `game.html`, `index.html`, `tests/run.js` |
公共文件 `names.js`、`docs/interfaces.md`、`AGENTS.md`：只允许追加（新 key/新事件），不得删改他人内容。

## 测试与提交
- 测试：`tests/*.test.js`，用 node 直接跑（`node tests/xxx.test.js`，失败 `process.exit(1)`），不依赖 npm 包；DOM 相关逻辑把纯逻辑拆出来测。
- 每次提交前：`for f in $(git ls-files '*.js'; git ls-files -o --exclude-standard '*.js'); do node --check $f || exit 1; done` 且 `for t in tests/*.test.js; do node $t || exit 1; done`。
- 提交信息：`[A|B|C|D] 简述`，中文可。小步多次提交。
- **禁止 git push，禁止切换/修改 master 分支，禁止改别人目录。**
