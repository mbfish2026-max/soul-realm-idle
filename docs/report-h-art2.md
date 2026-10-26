# h-art2 第二批美术交付

## 范围与来源

交付目录 `assets/m2/`，生产记录 `tools/art2/`，测试 `tests/assets_m2_manifest.test.js`。仅修改本路目录及用户指定报告，公共 `docs/interfaces.md` 仅追加「变更提案-h-art2」。没有修改 names.js、业务逻辑、入口、其他路目录，没有切换 master/integration，没有 push。

使用内置 image_gen 技能逐张生成，不下载、不用代码绘制主体。69 张独立生成：8 渊兽、2 渊主、10 契兽立绘与 10 头像、26 装备图标、1 外附灵骨、10 成就/日常/秘境图标、2 背景。提示词集合和处理说明在 `tools/art2/prompts.json`、`tools/art2/README.md`；原图文件名及 SHA-256 在 `tools/art2/provenance.json`。原图从 `~/.codex/generated_images/` 复制到 `tools/art2/raw/` 后处理，raw 已忽略，不进入提交。

风格为清新中国水墨、宣纸淡彩、主体无文字。角色及图标保留生成的透明通道，处理仅裁切、缩放、留边、WebP 压缩。背景 780×1688；渊兽 512×448、渊主 800×800、契兽立绘 512×512、头像 256×256、物品/功能图标 192×192。普通图片不超过 300KB、渊主不超过 600KB。

## 资源与接线

先加载第一批 `assets/manifest.js`（若存在），再加载 `assets/m2/manifest.js`，最后挂载 UI/舞台。脚本自动调用 `SR.art2.install()` 合并至 `SR.ASSETS`，保留已有对象及其他条目；再次调用 install 幂等。无新 Tab、无 DOM、无定时器、无业务事件和存档字段。

- 渊兽：`mob_snowmink`、`mob_iceserpent`、`mob_frostdeer`、`mob_coldcrow`、`mob_magmalizard`、`mob_redfalcon`、`mob_lavawolf`、`mob_ashspider`。
- 渊主：`boss_snowlord`、`boss_ridgelord`；背景：`bg_snow`、`bg_ridge`。
- 契兽：`pet_<id>_idle` 立绘、`icon_pet_<id>` 头像；id 为 bud/thorn/crownseed/emberseed/prismfox/aurorafox/skyfox/everfox/dawnfox/magmahorn，对应 E 路扩展契兽表末 10 种。
- 基础装备：`gear_<slot>`；高阶两套：`gear_frost_<slot>`、`gear_ember_<slot>`。slot 为 crown/robe/belt/boots/bracer/skirt/necklace/ring/weapon/jade；套装各 8 件，不含 weapon/jade。
- 外附灵骨：`icon_bone_external`。
- 成就：`ui_achievement`、`ui_achievement_battle`、`ui_achievement_pet`、`ui_achievement_ring`。
- 日常：`ui_daily`、`ui_daily_hunt`、`ui_daily_gift`。
- 秘境：`ui_rift`、`ui_rift_tower`、`ui_rift_token`。

清单 JSON 与 JS 同内容，每条为 `{file,w,h,use}`，路径相对仓库根。头像独立生成；舞台应使用立绘键，避免把头像拉成角色。

## 需要配合

- E 内容路：读取当前 dev/e-content 时地图怪物为 snowmink/iceyak、slagbeetle/ashram，与本次用户指定 8 物种不同。已按本次要求制作，需将地图 kind 对齐上列资源 ID；未把不同物种强行映射。首领使用既有 snowlord/ridgelord ID。
- C 舞台路：按 mapId 使用 bg_snow/bg_ridge；按 kind 使用 mob/boss 键；按 speciesId 使用 pet_<id>_idle。当前 MVP 舞台固定 forest/fox 的取图方式需由 C 路接入。
- B 系统界面路：本批头像按 icon_pet_<id> 读取，详情立绘按 pet_<id>_idle 读取。
- G 装备路：已复核定稿 features/gear/data.js，十个 slot 完全一致。四套业务 ID 为 bamboo/ember/tide/cliff；本次只制作要求的两套高阶图标，建议 ember→gear_ember_<slot>、tide→gear_frost_<slot>，bamboo/cliff→gear_<slot>。frost 为美术主题 ID，不修改业务套装 ID。
- F 秘境/日常路与集成路：使用对应 ui_ 图标，加载上述脚本。所有新增接口约定已追加至 docs/interfaces.md。

## 验证

测试验证完整 69 键、文件存在、WebP 头、实际像素尺寸、体积上限、非背景透明通道、输出 SHA-256、JSON/JS 一致性，以及已有资源保留和 install 可重复调用。生产工具生成忽略的联系表供逐图检查。

第一批 dev/d-art 清单与本批唯一重复键为 bg_snow；按指定脚本顺序由本批雪岭背景生效，其他第一批条目保留。

本次续作从已有 49 张交付图和 59 项原图记录接续，补齐未处理原图及最后 10 项生成；没有重做已选用资源。最终 69 张共 2,983,110 字节；最大背景 254,820 字节，最大首领 161,746 字节。已逐页人工检查全部联系表及两张背景原图，无文字、水印或缺失主体。压缩工具改为先在忽略目录完整写入，再替换交付图片，防止压缩中断损坏已交付文件。

最终全仓已跟踪与新增 JS 的 `node --check` 全部通过；全部 13 个 `tests/*.test.js` 通过（含本批资源测试），`git diff --check` 通过。此路不修改正式入口，集成方仍需按上述方式加载清单、对齐数据键并接入舞台/UI。
