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

## INT 正式入口与装备 v2（追加）
- `index.html` 为游戏唯一入口；开发样板移至 `dev/`，正式入口不引用。
- 本地 key 保持 `sr_save_v1`，结构版本 `v:2`。`hero.bones` 保存已穿戴物品，键与 `item.slot` 统一为 crown / robe / belt / boots / bracer / skirt / necklace / ring / weapon / jade。
- v1 六部位迁移：head→crown、body→robe、larm→bracer、rarm→weapon、lleg→skirt、rleg→boots；背包与仓库同步迁移。
- `gear:equip {uid}`、`gear:unequip {slot}` 为装备请求事件；成功后发 `hero:changed`，属性由 `SR.stats.hero` 汇总。
- INT 补齐经验升级：每级消耗当前等级×15 经验，99级封顶；掉落同时供给兽魂培养资源。
## 变更提案-e-content
- 加载全部基础 `data/*.js` 后，依次加载 `data/ext/progression.js`、`pets.js`、`maps.js`、`install.js`，在系统初始化前调用 `SR.content.install()`。安装幂等，无存档写入、无事件监听、无新增 Tab。
- souls 新增 `branches:[{id,name,nodes:[{level,cost,effects:{atkPct?,defPct?,hpPct?,spdPct?}}]}]`；同一分支三级为累计效果，按最高已学级应用，不逐级相加。B 负责选择/消费/属性应用。
- realms 合并 `expToNext,petSlots,contractSlots,trial`；trial 为 `{id,level,requiredRings,recPower,boss}`，10 至 90 级试炼解锁下一境界，天称 `trial:null`。boss 含 hp/atk/def/yearsRange/skills/phases。A 负责瓶颈流程，B 展示；原有 ringSlots 与等级区间不变。
- `DATA.ringTiers:[{id,color,name,minYears,maxYears,skillCount,affixIds,skillIds}]`；`DATA.ringAffixes:{id:{id,name,stat,min,max}}`，区间含端点、红色上限 999999 年。红环双技能需 B/A 扩展存档与施法，本路不改现有单 skillId 格式。
- pets 补充 `source,species,activeSkills,passiveSkills`，名称从 `NAMES.sources/speciesKinds` 查；skills 为兼容现有战斗的两个主动技能，passiveSkills 独立由 B 应用。evolve 沿用 need.seg/counter/mat，计数仅用已有 kills/battles。`DATA.petGrades` 提供九级成长与化轮参考参数。
- `DATA.resonances:[{id,name,type:'heroPet'|'petPet',soulId?,petIds?,veins:[a,b],bond,cd,mult,skillId}]`：heroPet 要求 soulId 与伙伴脉匹配；petPet 要求两只不同 uid、分别匹配 petIds，顺序无关；所有参与契兽 bond 均达门槛。A 负责触发/冷却，B 图鉴。
- maps 新增 snow/ridge，沿用 floorTables；各层 boss.phases 为 `{phase,hpRatio,skillId,delayMs,mult}` 三项，技能定义在 DATA.skills；A 需复制并执行这些参数（现核心仍使用固定预警），C/D 负责对应技能表现/素材。unlock 为 `{mapId,floor,level}`，eggPool 为物种 id 列表，掉落按地图筛选由 A 接入，避免现有全池随机直接取得神级兽卵。
- 词条基础值为 ringAffixes.min/max，实际按 ringTiers.affixScale（白至红 1..5）相乘；宠物 passiveSkills 引用 ringAffixes 的 id，应用其 min 为固定百分比，不参与主动技能冷却。

## 技能体系（SKILL，追加）
- 正式入口加载 ext/install 后依次加载 `data/skill-tree.js`、`data/ring-skills.js`、`data/effects.js`、`data/skill-progression.js`；systems/skills 后加载 systems/ring-skills，ui/skills 后加载 ui/ring-skills。
- `DATA.classes` 六职业：`{id,nameKey,vein,growth,gear,recommend}`。觉醒后三选一武魂确定，再自由选择职业；未选职业不启动战斗。
- `DATA.classSkills` 为六职业九环双分支的效果模板（108）。正式技能取得统一走魂环，不单独购买模板。
- `DATA.ringSkillPools[kind]={kind,name,slots:{1:[skillId,skillId],…9:[]}}` 覆盖地图渊兽、首领及已有试炼首领。`DATA.skills[id]` 保存来源派生魂技；每技能有 `id,name,kind,ring,classId,vein,cd,cost,maxLevel,growth,synergy,effects,iconKey,fxKey`。
- 精魄及已吸收魂环追加 `sourceKind,skillBranch,ringIndex`，原有 `skillId,years,color,vein` 保留。`loot.essence(years,preview,enemy)` 按来源生成；旧档无来源精魄保留原魂技。`SR.ringSkill.resolve(e,index,branch?)` 得到目标环位魂技，`fit(e,hero,index)` 返回威力倍率，`allowed(e,index)` 校验环位年限和类型；颜色由年限重算，五阶品阶共用连续年限成长。
- `rings.absorb(uid,index?,confirmed?)`：默认填空槽；指定已有环位必须 confirmed=true；失败保留旧环，成功替换并丢弃旧魂技。`ring:replace {uid,index}` 仅由二次确认面板发出。`rings.shouldAuto(e)` 同时判断空槽、年限、类型及适配；`hero.autoRing={enabled,minYears,minFit}` 持久化，默认关闭，阈值10年/100%。
- `hero.skillBuild={v:1,levels,slots,priority,spent}`，v0 learned 数组迁移；吸收自动授予1级并绑定槽位。`skills.learn(id)` 升级，`cost(id)` 返回灵晶/技能材料费用，`reset()` 返还投入并保留魂环基础魂技；`branch(index,branch)` 花20灵晶切换来源魂技分支。
- `skills.entries(actor)` 返回实际魂环/契兽技能；`skillAI.pick(actor,ctx)` 按优先列表筛选未冷却、魂力足够、非被动技能。沉默/眩晕阻止主动施法；每秒恢复8魂力。技能冷却单位秒，运行时毫秒。
- `DATA.effects` 类型表与 `effects.apply/tick/factor` 结算 damage/dot/control（stun/slow/silence）/shield/heal/buff/debuff/summon/aoe/combo，effects 可组合。
- `DATA.petSkillPools[speciesId]` 四技能：talent/active/bond/evolved；段位、品阶、蜕变前置分别读取 unlockSeg/unlockGrade/evolutionCount。`pet.skillPriority` 与 `hero.skillBuild.priority` 保存自动释放顺序；`skill:order {uid?,id}` 移至首位。
- `DATA.fusionSkills` 六职业×五契兽定位30项，按 classId/role/bond/cd/cost 触发。`battle:skill` 追加 `fxKey`；`battle:fusion` 追加 `fxKey,fx:{duration,bursts}`，stage按键播放一次性效果。
- 新事件：`class:choose {id}`、`skill:learn/equip {id}`、`skill:reset {}`、`skill:branch {index,branch}`、`ring:auto {}`；均在成功后标脏并通知 hero:changed。存档外层仍为v2，技能子结构独立迁移。

## AUTO 自动战斗（追加）
- 外层仍为 v2；旧档加载时补全 `state.auto` 默认值；一次迁移旧 `hero.autoRing.enabled` 至 absorb，以 `autoMigrated:true` 标记。旧开关事件委托新策略。
- `auto={enabled:true,priority:[],healThreshold:0.3,reserveBossFusion:false,advance:true,challengeBoss:true,absorb:false,absorbRate:0.9,fitOnly:true,sell:false,sellQuality:1,pending:[]}`。priority 为英雄魂技 id 顺序；healThreshold/absorbRate 为 [0,1] 比例；sellQuality 为装备质量下界，仅出售 quality 严格小于阈值的未锁定装备；pending 为待玩家选择精魄 uid 队列，物品保存在仓库。契兽沿用各自 skillPriority。
- `SR.auto.config/update/pick/ready/canAbsorb/shouldSell/receive` 为统一策略；仅填开放空槽，年限及魂技类型合法，成功率达到阈值，fitOnly 开启另需适配倍率≥1；替换已有魂环始终走玩家确认。自动吸收关闭时正常收纳，不主动弹窗。
- `SR.battle.setAuto(bool)/cast(skillId)/fusion()`；关闭自动仍普通攻击与冷却/魂力恢复，主动技由玩家点击；被动技持续生效。治疗/护盾在低血阈值下优先；背包 `mat` 可携带 `healPercent:(0,1]` 作为消耗治疗物，锁定不使用。当前掉落无此药物，保命主要依靠治疗/护盾魂技。
- `auto:changed {}` 通知状态与策略更新。UI 自动策略弹窗点空白关闭；待吸收队列仅战斗页无弹窗且前台时取出，不因切页或战斗刷新抢焦点。
- 正式入口离线使用相同 battle/loot/auto 规则，保留12小时上限、70%有效时长；旧纯核心调用无 auto 模块时兼容原收益公式。`offline.simulating` 阻止表现、弹窗、音频及逐事件落盘；最终 `offline:reward` 一次落盘。离线手动模式仅普通攻击和被动技，无主动技能假定。
- `idle.visibility(hidden,now?)` 在隐藏时结清最后一段前台时间并保存，恢复时从隐藏游标补算一次；后台计时器不结算；pagehide 不覆盖隐藏期间游标。
- 自动收纳遇到背包满时溢出至仓库，避免满包机制绕过出售品质阈值或出售锁定物品；旧魂技页 `skill:order` 同步自动策略顺序。
- 合体技在英雄死亡、眩晕或沉默时不可释放，自动与手动共用条件。离线报告 exp 为实际获得总经验，避免升级扣除经验后出现负数。
## 变更提案-f-rift
- 新增存档 `state.rift={floor:1,best:0,clears:0,attempts:0}`、`state.achieve={counts:{},claimed:{}}`、`state.daily={day:'YYYY-MM-DD',counts:{},claimed:{}}`。模块 install/load 时补齐；沿用 save 持久化未知字段，无需 A 修改迁移。
- 新事件 `rift:clear {floor,years,goldLines,crystal}`、`rift:result {ok,floor,rounds}`、`achieve:claimed {id,reward}`、`daily:claimed {id,reward}`。秘境独立回合结算，不伪造 battle 事件，不改变主线地图。每层必得精魄，满背包入仓库。
- `SR.rift/achieve/daily.install({entry?:HTMLElement})` 幂等订阅，entry 可追加入口按钮；各自 `.open()` 打开面板，`.render()` 返回面板内容，`.claim(id)` 用于成就/日常。`SR.rift.challenge()` 挑战当前层，`.select(floor)` 重刷已通层，`.goldLines(years)` 计算金纹。
- 加载 names → bus/save/bag/loot/stats/数据 → features/rift/shared.js → features/rift/rift.js → features/achieve/achieve.js → features/daily/daily.js；样式 features/rift/panels.css。集成路在 idle.start() 前 install 三模块；在功能入口挂三个按钮或调用 open，无需更改原四 Tab。
- 需 B 配合：魂环及精魄界面读取 `SR.rift.goldLines(years)` 展示金纹；金纹由年限派生，吸收/剥离无需保存额外字段。十万年零纹，二十万年一纹，一百万年九纹。
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
