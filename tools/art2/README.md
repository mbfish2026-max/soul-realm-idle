# 第二批美术生产记录

全部主体与背景使用内置 `image_gen` 逐张生成。`prompts.json` 保存实际提示词集合（首张雪貂采用同等约束的初始提示词，详见下文），`provenance.json` 保存原图文件名、原图与交付图 SHA-256；无下载图、代码绘制主体或程序拼造的图标。头像独立生成，非立绘复用裁切。

原图默认保留在 `~/.codex/generated_images/`，由 `process.py` 复制至 `raw/<key>.png`。`raw/` 和 Python 缓存已忽略，不提交。`raw/sources.json` 记录本机生成路径；其他机器复现压缩时应先准备同名原图及路径表。生产工具依赖 Pillow，仅在资源处理时使用，游戏没有 Python/npm 运行时依赖。

```sh
python3 tools/art2/process.py
python3 tools/art2/review.py
node tests/assets_m2_manifest.test.js
```

处理仅包含透明边缘裁切、等比缩放、透明画布留边及 WebP 压缩，背景按目标比例裁为 780×1688。不使用代码绘制美术。角色脚底由画布主体边界控制，舞台可按现有底部锚点布局。

## 接线

先加载第一批 `assets/manifest.js`（若存在），然后加载 `assets/m2/manifest.js`，最后挂载舞台和 UI。脚本自动合并，不替换已有 `SR.ASSETS` 对象；`SR.art2.install()` 可在其他清单加载完成后再次合并，无 DOM、无监听器、无计时器。不增加 Tab。

```html
<script src="assets/m2/manifest.js"></script>
<script>
  SR.art2.install();
  // 舞台/UI 自己按实际业务 ID 查 SR.ASSETS[key].file。
</script>
```

`manifest.json` 与 JS 条目一一对应，`file` 相对仓库根；`w/h` 为 WebP 实际像素尺寸；`use` 为 mob/boss/pet/portrait/icon/background。

- 渊兽 `mob_<kind>`：snowmink、iceserpent、frostdeer、coldcrow、magmalizard、redfalcon、lavawolf、ashspider。
- 首领 `boss_snowlord`、`boss_ridgelord`；背景 `bg_snow`、`bg_ridge`。
- 契兽头像 `icon_pet_<id>`，立绘 `pet_<id>_idle`：bud、thorn、crownseed、emberseed、prismfox、aurorafox、skyfox、everfox、dawnfox、magmahorn。
- 基础装备 `gear_<slot>`；高阶霜系 `gear_frost_<slot>`、焰系 `gear_ember_<slot>`。10 部位 crown/robe/belt/boots/bracer/skirt/necklace/ring/weapon/jade；两套各前 8 部位，不含 weapon/jade。
- 外附灵骨 `icon_bone_external`；10 个功能图标键见 manifest 的 `ui_` 前缀。

## 首张实际提示词

Use case: stylized-concept. Single game sprite of a snow-white mink abyss beast, full body, crouching alert, facing left, icy teal eyes and fine frosted fur. Chinese ink wash and pale watercolor on xuan paper aesthetic, elegant brush edges, muted sage and cold blue accents, same aesthetic as the provided Chinese ink fantasy game references. Isolated single subject centered, generous transparent margins, no ground, no scenery, no text, no letters, no seal, no frame. Actual transparent background.

已复核 G 路定稿 `features/gear/data.js`：slot 一致。建议套装取图：ember→gear_ember_<slot>，tide→gear_frost_<slot>；bamboo/cliff 使用 gear_<slot>。frost 是图片主题，不是新增业务套装。第一批与本批仅 bg_snow 重名，后加载本批时采用本批背景。
