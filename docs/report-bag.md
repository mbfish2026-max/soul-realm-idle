# BAG 格子背包交付

基于当前 integration 已集成版本的 dev/bag-grid 工作分支；未 push，未切换 master。

## 实现

ui/bag.js 改为 390 宽五列格子，每个数组物品占一格；生成图标、五阶品质框、数量与等级／年限角标、锁定文字。背包和仓库分别显示已用／总格，显示空格与满包转仓提示，仓库沿用接近上限暂停战斗提示。

全部／装备／魂环精魄／兽卵／材料分类，品质／等级年限／类型／新获得排序，一键原地整理。新获得使用既有 item-N 序号，无该序号的旧物品按数组顺序回退；整理可能改变这部分旧物品的回退顺序，不伪造获得时间。无新增存档字段，旧档直接兼容。

点格子查看，空白关闭；出售、装备分解二次确认，锁定／解锁、吸收、孵化、装备、存取仓库均接现有逻辑；装备详情保留现有强化／重铸等入口。长按500ms或多选按钮进入批量模式，全选仅当前分类未锁定物品；确认执行时再次检查存在性与锁定。分解仅装备，沿用 gear.dismantle 收益；出售与自动出售均用 bag.value。

纯逻辑在 core/bag.js：slots/category/quality/query/sort/selectable/batch。接口已追加 docs/interfaces.md。CSS 由 ui/bag.js 自行加载，无需改入口或他人文件。视觉只使用生成位图，CSS 仅布局、字号和贴图。

## 素材

内置 image_gen 生成 1 张九格素材源图，裁切交付 9 个 WebP：assets/ui/bag/{white,yellow,purple,black,red,empty,base,badge,selected}.webp。五品质框、空格、底图、角标底、选中框均为水墨宣纸与淡金云角。页签、按钮、道具与装备图标复用 integration 已交付生成素材。每图小于300KB。

提示词、生成源路径及处理记录见 assets/ui/bag/provenance.json；最终提示为3×3水墨UI素材表，五色品质框、纸芯、空格、玉色角标和选中框，透明外部／框心，无字无物件。后处理仅 Pillow 裁切、缩放和 WebP 压缩，未绘图。源图位于内置工具生成目录；交付贴图已全部进入仓库。

## 验证与截图

- AGENTS.md 指定的全部已跟踪／新增 JS 语法检查通过；全部 tests/*.test.js 通过，含自动出售、离线84小时容量限制、装备与旧档回归。
- tests/core_bag_grid.test.js 覆盖格数、堆叠一格、分类、品质／年限／类型／新获得排序、副本不改原数组、整理幂等、批量重复／缺失ID、锁定保护、装备分解收益、旧档迁移保留、UI输出与素材预算。
- `python3 assets/ui/bag/acceptance.py`：Playwright WebKit，390×844，移动触屏，9截图，无横向溢出；pageerror、console.error、HTTP>=400 均0。明确背包夹具用于隔离随机掉落等待，未声称物品均自然刷出；自动策略接收／出售与仓库存储调用真实逻辑。
- 验证网格五列、详情、500ms长按、锁定不可选、批量确认并执行、满包自动出售／锁定装备转仓、分类排序整理、空包、刷新读档。
- 截图：docs/shots/bag_grid.png、bag_detail.png、bag_multi.png、bag_batch_confirm.png、bag_full.png、bag_store.png、bag_filter.png、bag_empty.png、bag_reload.png。

## 遗留

见 docs/requests-bag.md：其他路在背包函数外包装的来源长列表和旧入口仍保留；旧纯核心无auto调用的满包兑换行为按既有测试保留，正式入口沿用auto满包转仓库。未测实体手机。九级兽卵品级映射至五个显示品质框（4级及以上共用红框），角标保留原契兽品级名称。
