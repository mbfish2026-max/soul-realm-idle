# 最小接口约定 v1（各路 Codex 必须遵守；要改先写进本文件并在提交说明里注明）

## 0. 全局
- 普通 `<script>`，全局命名空间 `window.SR`（node 测试里用 `globalThis.SR`）。每个文件 IIFE：`(function(g){var SR=g.SR=g.SR||{}; ...})(typeof window!=='undefined'?window:globalThis);`
- 加载顺序（index.html / game.html）：names.js → core/bus.js → data/*.js → core/*.js → systems/*.js → stage/*.js → ui/*.js → audio/*.js → main.js（集成时写）。
- 所有可见名词用 `SR.NAMES.xxx`（names.js）。
- 随机数统一走 `SR.rng()`（core/rng.js，可设种子，测试可复现）。

## 1. 事件总线 core/bus.js（Codex-A 负责实现）
`SR.bus.on(name, fn)` / `SR.bus.off(name, fn)` / `SR.bus.emit(name, payload)` / `SR.bus.once(name, fn)`

| 事件 | 发出方 | payload |
|---|---|---|
| `battle:wave_start` | A | `{mapId, floor, wave, waveMax, enemies:[{uid, kind, name, hp, hpMax, years, isBoss}]}` |
| `battle:attack` | A | `{src:{side:'hero'|'pet'|'enemy', uid}, dst:{side, uid}, dmg, crit:bool, skillId|null, ringIndex|null}` |
| `battle:skill` | A | `{caster:{side,uid}, skillId, ringIndex, name}`（放技能，C 点亮对应魂环） |
| `battle:fusion` | A | `{heroUid, petUid, name}`（共鸣技/合体） |
| `battle:hp` | A | `{side, uid, hp, hpMax}` |
| `battle:kill` | A | `{uid, kind, years, isBoss}` |
| `battle:hero_down` | A | `{}` |
| `battle:wave_clear` | A | `{wave}` |
| `battle:boss_phase` | A | `{uid, phase:1|2|3, warn:{name, delayMs}|null}` |
| `loot:drop` | A | `{item}`（见 §3） |
| `offline:reward` | A | `{seconds, crystal, exp, items:[item]}` |
| `save:loaded` / `save:saved` | A | `{state}` / `{t}` |
| `ring:absorb_request` | B | `{essenceUid}` |
| `ring:absorb_result` | B | `{ok:bool, ringIndex, essence, rate}` |
| `pet:changed` | B | `{petUid}` |
| `hero:changed` | B | `{}`（属性需重算） |
| `ui:open` / `ui:close` | B/C | `{panel}` |
| `sfx` | 任意 | `{id}`（D 的 audio 监听，id 见 audio/README） |

## 2. 存档结构（localStorage key `sr_save_v1`，A 负责读写；B 只改自己字段并 emit 事件后调用 `SR.save.markDirty()`）
```js
{
  v: 1, t: 1730000000000,          // 保存时间 ms
  hero: { name, soulId, twin:false, level:1, exp:0, talent:1..10,
          rings:[ {uid, years, color:'white|yellow|purple|black|red', vein, skillId} ],   // 最多 9
          bones:{} },                // 灵骨，MVP 可空
  pets: [ {uid, speciesId, grade:0..8, seg:1..10, step:1..9, exp, formId, counters:{}, skills:[], bond:0..100} ],
  team: { pets:[petUid, petUid] },  // MVP 最多 2 只出战
  bag: [item], store: [item], bagCap: 60,
  cur: { crystal:0, petSoul:0, pactCharm:0 },
  map: { mapId:'forest', floor:1, wave:1, bestFloor:1 },
  flags: { awakened:false }, stats: {}
}
```
- `SR.save.load()`, `SR.save.save()`, `SR.save.markDirty()`, `SR.save.state`（当前对象）, `SR.save.cloud`（预留：`{push(state), pull()}` 返回 Promise，默认实现 reject('not configured')，参考 /workspace/idle-arpg 的 cloud.js）。

## 3. 物品 item
`{uid, type:'essence'|'egg'|'gear'|'mat', ...}`
- essence（魂环精魄）：`{years, color, vein, skillId}`；color 由 years 决定：<100 white，<1000 yellow，<10000 purple，<100000 black，否则 red。
- egg（兽卵）：`{speciesId, grade}`
- gear（灵骨/装备）：`{slot:'head|body|larm|rarm|lleg|rleg', quality, stats:{atk,def,hp}}`

## 4. 数据表（data/，B 负责；A 读取）
- `SR.DATA.souls`：`[{id, name, kind:'tool|beast|body', vein, role, baseStats:{atk,def,hp,spd}, skills:[skillId]}]`（MVP 3 个）
- `SR.DATA.skills`：`{id:{name, cd, mult, vein, desc}}`
- `SR.DATA.pets`：`[{id, name, vein, grade, baseStats, skills, evolve:[{to, need:{seg, counter?, mat?}}]}]`（MVP 8 种，含 1 条蜕变链）
- `SR.DATA.maps`：`[{id, name, floors:5, waves:10, monsters:[{kind, name, hp, atk, yearsRange:[a,b], weight}], boss:{...}, recPower}]`（A 负责 data/maps.js）
- `SR.DATA.realms`：境界 10 阶，每 10 级 1 环槽。
- 公式 `SR.formula.absorbRate(hero, essence)` → `{rate, parts:{talent, fit, over}}`（B 实现，C 的吸收面板调用显示）。

## 5. 舞台 stage（C）
- `SR.stage.mount(el)`；仅监听 bus 事件做表现，不改存档。
- `SR.actor.create({el, sprites:{idle,attack,...}, dur:{}})` → `{set(state), state}`；状态 idle/move/attack/skill/hit/fusion/win/die。
- 素材路径一律查 `SR.ASSETS`（由 D 的 assets/manifest.js 提供，键名见 assets/manifest.json）；缺图时回落到 mock/assets/。

## 6. 美术 assets（D）
- `assets/manifest.json` + 同内容 `assets/manifest.js`（`SR.ASSETS={key:{file,w,h,use}}`）。
- 键名约定：`hero_idle hero_move hero_attack hero_skill hero_hit hero_win hero_die`、`pet_fox_idle pet_fox_attack ...`、`mob_<id>`、`boss_<id>`、`bg_<id>`、`icon_skill_<id>`、`icon_ring_<color>`、`icon_pet_<id>`、`ui_<name>`。

## B 系统补充（MVP，追加）
- `SR.awaken.choices()` 返回本次三选一列表；`choose(soulId)` 只允许觉醒一次，双相概率 1%。
- `SR.rings.color(years)`、`slots(hero)`（floor(level/10)，最多9）、`capacity(hero)`、`benefit(years)`（log10(1+years)）、`absorb(uid)`、`strip(index)`。剥离将年限 floor(50%) 的精魄放回背包；背包满则拒绝。吸收支持背包/仓库，失败不改等级和经验。`absorbRate.parts` 为可相加的小数概率，最终 clamp 到 [0,1]。
- `SR.pets.hatch(eggUid)`、`feed(petUid)`（每次花 10×段 兽魂升一阶）、`preview(petUid)` → `[{to,need,ready}]`、`evolve(petUid,to)`、`ringify(petUid)`、`deploy(petUid)`（切换出战）、`count(key,n)`。10段 step 固定1、无细分阶；蜕变重置段阶。化轮产生背包精魄，需要后续吸收，并追加存档 `petAlbum:[{speciesId,grade,afterimage:true}]`。
- `SR.stats.hero(state)` 返回 `{atk,def,hp,spd,power,teamPower,ringMult,bondBonus}`；`ringMult[i]` 含年限收益和同脉出战 +20%，供战斗读取对应轮技倍率；`pet(pet)` 返回四维及 power。契心值每100提供英雄属性5%加成，可叠加两只。
- 新请求事件：`hero:awaken_request {soulId}`、`ring:strip_request {ringIndex}`、`pet:hatch_request {eggUid}`、`pet:feed_request` / `pet:deploy_request` / `pet:ringify_request {petUid}`、`pet:evolve_request {petUid,to}`。
- UI 加载：`ui/tabs.js` → `hero.js` / `pets.js` / `bag.js` / `awaken.js` / `absorb.js`，样式 `ui/ui.css`。`SR.ui.mount(el)`、`show('battle'|'hero'|'pets'|'bag')`、`awaken()`、`absorb(essenceUid)`。battle 是舞台接入占位，集成方可覆盖 `SR.ui.battle(state)`，返回内容 HTML。
- 预览专用 `ui/preview_stub.js` 只供 `ui/preview.html` 使用，正式入口不要加载。

## 变更提案-h-art2
- 第二批资源加载 `assets/m2/manifest.js`，自动合并至 `SR.ASSETS`，也可重复调用 `SR.art2.install()`；应在第一批 manifest 之后、舞台/UI 挂载之前加载，不增加 Tab 或业务事件。
- 沿用 §6：`mob_<kind>`、`boss_<kind>`、`bg_<mapId>`、`icon_pet_<speciesId>`；立绘为 `pet_<speciesId>_idle`。本批契兽为 bud/thorn/crownseed/emberseed/prismfox/aurorafox/skyfox/everfox/dawnfox/magmahorn。
- 装备扩展键 `gear_<slot>`、`gear_frost_<slot>`、`gear_ember_<slot>`；slot 为 crown/robe/belt/boots/bracer/skirt/necklace/ring/weapon/jade，套装不含 weapon/jade。定稿套装 ID 由 G 路映射；外附灵骨 `icon_bone_external`。
- 功能图标：`ui_achievement`、`ui_achievement_battle`、`ui_achievement_pet`、`ui_achievement_ring`、`ui_daily`、`ui_daily_hunt`、`ui_daily_gift`、`ui_rift`、`ui_rift_tower`、`ui_rift_token`。
- 本次需求指定渊兽 kind：snowmink/iceserpent/frostdeer/coldcrow、magmalizard/redfalcon/lavawolf/ashspider；首领 snowlord/ridgelord，背景 snow/ridge。读取 E 路当前 data/ext/maps.js 时仍为 snowmink/iceyak、slagbeetle/ashram，请 E 路按本次需求对齐名单；不把不同物种图片强行别名映射。
- C 路需按 mapId 查背景、kind 查敌人、speciesId 查契兽立绘；B/G/F 路按上述键查头像/装备/功能图标。所有 file 路径相对仓库根。
- 后续复核 G 路定稿 `features/gear/data.js`：十部位 ID 一致，套装 ID 为 bamboo/ember/tide/cliff；本批两套美术建议 ember→gear_ember_<slot>、tide→gear_frost_<slot>，其余使用基础图标。frost 为美术主题名，不新增业务套装。
- 第一批 dev/d-art 与本批仅 bg_snow 键重复；本批后加载时采用本批雪岭背景，其他第一批资源保留。
