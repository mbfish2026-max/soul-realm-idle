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

## 变更提案-g-gear
- G 提供 `SR.gear.roll(level, rng?)` → 六部位 gear，quality 为 0..4（白黄紫黑红），新增 level、affixes:[{key,value}]、setId、reforges、locked、affixLock（-1 或索引）。stats 为基础属性，不含词缀。A 请以该方法替换简易 gear 生成，等级采用地图掉落等级；roll 自行生成 UID，不自行入包。
- `hero.bones[slot]` 保存完整装备对象；六部位沿用原 key；external 为外附灵骨保留槽，本里程碑始终锁定，不掉落不允许穿戴。
- `SR.gear.statBonus(state)` → `{atk,def,hp,spd}`，含基础、词缀、2/4/6 件套装加成。B 请在 SR.stats.hero 的最终 power/teamPower 计算前将四维加上此返回值；勿再单独累加 bones 避免重复。
- 加载 names → core 与 systems → ui/tabs.js 等原 UI → features/gear/data.js → gear.js → ui.js；样式 features/gear/gear.css。调用 `SR.gear.install()` 幂等安装 UI 事件与渲染器，提供 SR.ui.gear / warehouse；原背包页追加灵骨、仓库入口。集成可另挂 gear / warehouse Tab；不自动替换原导航。
- 操作成功 markDirty；属性变化发既有 hero:changed；库存变化追加 `gear:changed {}`。install 不包装 stats 或 loot，必须由 A/B 显式调用上述接口。

## 变更提案-g-gear-v2（再次更正，以本节为准）
- 装备十格固定为 crown 头冠、robe 衣袍、belt 腰带、boots 靴履、bracer 护腕、skirt 下裳、necklace 项链、ring 戒指、weapon 法器、jade 玉佩。表位于 features/gear/data.js，SR.GEAR_DATA.slots / slotNames。
- 每套仅八件，覆盖前八格；weapon、jade 永远为自由散件，setId=null。四套青篁、烬霞、听潮、叠嶂只按 2/4/6/8 件触发，无十件档。外附灵骨隐藏且不可掉落/穿戴，不计入十格。
- 八件档联动：已觉醒武魂 +5%、每枚魂环 +0.5%（最多九枚）、每只出战契兽 +1%（最多三只），只增幅该档属性，不另乘角色战力。精确档位数值见 SR.GEAR_DATA.sets，档位累加。
- 终极满配含词缀及强化，装备战力不超过同等级八件普通红品装备加两散件基础属性总战力的 1.8 倍；power=atk*5+def*3+hp*0.2+spd*2，statBonus 对超额属性同比例截断。普通指无套装/无词缀/未强化的同品质装备。
- A 需升级存档 v=2，保留 sr_save_v1 键读取兼容，放开 core/save.js 当前 v>1 拒绝限制；注册 migrations[1] 调 SR.gear.migrate(s) 后置 s.v=2；create 默认 v=2。G 不包装 save，避免旧读取器拒绝新档。
- 旧槽映射 head→crown、body→robe、larm→bracer、rarm→belt、lleg→skirt、rleg→boots；装备、背包、仓库均迁移。目标已占用则旧物入仓，保留 UID/品质/词条/锁定。migrate 幂等，install 及 save:loaded 调用槽位迁移，但升级版本由 A 完成。
- 新增 SR.gear.enhance(uid)，最高十级，每级基础属性 +2%，花费 (30+等级*4)*(强化级+1) 灵晶；锁定装备不可强化。statBonus 不改变原始装备数据。
