# N 技能图标与特效交付记录

## 范围与需求

只写 assets/skills/、tools/n/、tests/assets_skills.test.js、本报告；分支 dev/n-skillart。全部原画使用内置 image_gen，不下载、不以代码绘图。遵循 K 路 style-bible.md 的淡彩水墨、低反差、细墨线、玉色与古金；图标 128×128（@2x），透明外部至少 8% 留白。

当前数据快照：599 个技能；六脉 × 七类型 = 42 张基础图标；六职业终极专属 6 张；合体专属 30 张；12 类首领 × 九环双分支 = 216 张专属；总图标需求 294 张。终极同职业多环共享职业终极图，首领及合体每个 id 独立生图。特效需求 12 套：六脉斩击各一套，爆裂、护盾、治疗、控制、召唤、合体各一套，每套 4 帧、5fps、800ms、loop:false。

## 生成与后处理

- 图标提示词完整存于 tools/n/prompts.json 和 dedicated-prompts.json；特效提示词在 fx-prompts.json。生成路径来自内置 image_gen 的 output_hint，原图复制到 tools/n/raw/，由 tools/n/.gitignore 排除。
- tools/n/process.py 只做 alpha 裁边、统一缩放、透明画布居中、合图、WebP 压缩，不画图、不按白色阈值误删纸芯。
- 图标单图限制 300000 B，静态图集每组最多 64 图，限制 1000000 B；图集矩形与动画元数据分开。
- 特效原图为同一效果的 2×2 连续四帧；固定格裁切、统一缩放，再拼成 1024×256 横向图集，保留中心锚点。
- tools/n/catalog.js 读取与正式技能清单相同的基础、扩展和技能数据，避免只扫描源码字面量漏掉运行时派生技能。

## 批次进度

生成持续进行中；完成批次在下方追加实测数量、验证和提交记录。需求数量以上述数据快照为准，不把映射数量冒充独立原画数量。

第一批：13/294 图标已规整为 128×128 WebP，并提供静态合图；生成其余素材中。现有全部 tests/*.test.js 与所有 JS 语法检查通过。本批尚未发布全量 manifest，不宣称覆盖全部技能；专用覆盖测试待全量素材生成后启用。

接入约定：在已有 assets/manifest.js 之后加载 assets/skills/manifest.js（Object.assign 保留原有 SR.ASSETS 键）；JSON 与 JS 内容严格一致。以技能自身 iconKey/fxKey 查 SR.ASSETS。静态图标优先 file 单图，也可读 atlas 的 file/x/y/w/h；特效按 frames/fw/fh/fps 横向裁帧，loop:false，800ms 后移除并停止绘制。入口与舞台文件由其所有者接入，本路不越界修改。

第二批：已入库图标 103/294（基础 42/42，专属 61/252）；特效 12/12 套、48 帧全部入库。599/599 个 iconKey、59/59 个共享 fxKey 均可解析。专属尚未齐备的条目保留基础族回退，artId/dedicated 可审计；最终批次将强制检查全部首领和合体技能的专属图。全部 JS 语法检查与 tests/*.test.js 通过（含新增 assets_skills 测试）。图标与特效均为内置 image_gen 原画，来源及 SHA-256 记录见 tools/n/provenance.json。
