# MAP 山河行卷交付

分支 dev/world-map，基于现有 integration 内容；未 push，未修改 master。

已实现六区域、每区域八节点，共48节点。每节点推荐战力、波数、首领/精英状态、魂环年限及颜色范围、装备/兽卵/材料预览，区域进度、当前位置、重复挂机与前沿选择请求。纯逻辑支持连续解锁、每区一次奖励、防重复领取、自动推进/首领设置、旧档映射和非法节点修复；秘境保持独立。怪物与魂技来源沿用十五层现有表，不新增无素材物种。

## 素材

使用内置 image_gen，2次生成，输出15张项目素材（2张生成原图切片/压缩），均在 assets/map/，总清单 manifest.json，完整提示词 prompts.txt，来源与后处理 provenance.json。六区域插画 region-0..5.webp（含手绘路径），节点 normal/elite/boss/cleared/locked/current.webp，奖励 reward.webp，框体 panel.webp，框体中心裁取纸底 paper.webp。没有 CSS/Canvas/SVG 绘制背景、图标或路径。源图保留 image_gen 默认生成目录，未放进不属于本路的 tools 目录。

## 测试与截图

全部已跟踪及新增 JS node --check、全部 tests/*.test.js 通过。worldmap_progress 覆盖48节点贯通、顺序锁、旧档幂等、原地刷、奖励只发一次、自动首领关闭；worldmap_assets 验证15素材文件、WebP格式和300KB预算。

Playwright WebKit 390×844，使用正式页面加载的真实数据及样式，临时挂载本路界面并设置已通11节点夹具：docs/shots/map_overview.png、map_details.png、map_final_regions.png；零 pageerror / console.error，无横向溢出。截图为独立地图组件验收，不冒充正式入口接线或真实战斗进度。

## 遗留与接线

本路未修改超出所有权的入口、Tab、战斗、存档主模块、离线和自动策略模块。docs/requests-world-map.md 给出具体接线位置；docs/interfaces.md 已追加完整接口。正式游戏入口尚未显示地图，选择事件需 WIRE 安全停止/切换/保存/重启，battle.spawn/step 需消费本路 encounter/clearWave，离线需复用同一路径。

新节点总波数与首领密度不同于旧十五层，因此本次不宣称60–80h全链路达标；接线后须真实在线/离线连续模拟复验。保留原地图 hp/atk/recPower/年限/魂技来源并不等于已经证明新曲线。旧档仅保守映射已通下界，不能重建原来未记录的逐波历史。
