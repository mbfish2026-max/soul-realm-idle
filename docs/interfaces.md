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
## 变更提案-i-audio
- 新增可选音频模块：按 `audio/m2/score.js` → `audio/m2/audio.js` 加载，bus 就绪后 `SR.audio2.install()`。不修改现有事件与存档。
- `SR.audio2.setScene('town'|'field'|'boss')` 场景交叉淡化；wave_start 自动判断普通/首领，hero_down 回主城。ui:open 不改变音乐，避免养成弹窗打断战斗音乐。主城入口由集成路显式 setScene('town')。
- `getSettings()` / `setSettings({master,music,sfx,muted})`，音量 0..1，独立 localStorage `sr_audio2_v1`；`mountSettings(el)` 提供可嵌入设置面板；`openSettings()` 提供可点空白关闭的独立弹窗。集成路添加「声音」按钮调用 openSettings，无须新 Tab。
- `play(id)` 与现有 `sfx {id}` 一致。支持 skill_wind/fire/earth/moon、pet_attack、boss_warning、absorb_success/fail、level_up、drop_white/yellow/purple/black/red、ui_click，以及 attack/skill/pet/boss/absorb/upgrade/click 旧别名。battle:skill 根据 DATA.skills[skillId].vein 自动选音色。
- 自动监听现有 battle、loot:drop、ring:absorb_result、hero:changed、save:loaded；升级按 hero.level 增量识别。无需新增业务事件。首次 pointerdown/touchend/keydown 解锁，visibilitychange/pagehide 暂停，pageshow 恢复。
- 若同时加载第一批 SR.audio，默认共存（不会擅改未知旧 API）；为避免双重 bus 音效，集成路应只安装 audio2，或通过 install({legacy:SR.audio}) 明确移交，legacy 需提供 uninstall()。详细说明见 docs/report-i-audio.md。
## 变更提案-h-art2
- 第二批资源加载 `assets/m2/manifest.js`，自动合并至 `SR.ASSETS`，也可重复调用 `SR.art2.install()`；应在第一批 manifest 之后、舞台/UI 挂载之前加载，不增加 Tab 或业务事件。
- 沿用 §6：`mob_<kind>`、`boss_<kind>`、`bg_<mapId>`、`icon_pet_<speciesId>`；立绘为 `pet_<speciesId>_idle`。本批契兽为 bud/thorn/crownseed/emberseed/prismfox/aurorafox/skyfox/everfox/dawnfox/magmahorn。
- 装备扩展键 `gear_<slot>`、`gear_frost_<slot>`、`gear_ember_<slot>`；slot 为 crown/robe/belt/boots/bracer/skirt/necklace/ring/weapon/jade，套装不含 weapon/jade。定稿套装 ID 由 G 路映射；外附灵骨 `icon_bone_external`。
- 功能图标：`ui_achievement`、`ui_achievement_battle`、`ui_achievement_pet`、`ui_achievement_ring`、`ui_daily`、`ui_daily_hunt`、`ui_daily_gift`、`ui_rift`、`ui_rift_tower`、`ui_rift_token`。
- 本次需求指定渊兽 kind：snowmink/iceserpent/frostdeer/coldcrow、magmalizard/redfalcon/lavawolf/ashspider；首领 snowlord/ridgelord，背景 snow/ridge。读取 E 路当前 data/ext/maps.js 时仍为 snowmink/iceyak、slagbeetle/ashram，请 E 路按本次需求对齐名单；不把不同物种图片强行别名映射。
- C 路需按 mapId 查背景、kind 查敌人、speciesId 查契兽立绘；B/G/F 路按上述键查头像/装备/功能图标。所有 file 路径相对仓库根。
- 后续复核 G 路定稿 `features/gear/data.js`：十部位 ID 一致，套装 ID 为 bamboo/ember/tide/cliff；本批两套美术建议 ember→gear_ember_<slot>、tide→gear_frost_<slot>，其余使用基础图标。frost 为美术主题名，不新增业务套装。
- 第一批 dev/d-art 与本批仅 bg_snow 键重复；本批后加载时采用本批雪岭背景，其他第一批资源保留。

## WIRE 第二批正式入口接线（追加）
- 正式加载基础 → m2 → ui2 → frames → scene → scene/mobile → fx → skills 清单；均原地合并 SR.ASSETS。scene/mobile 仅缩放/压缩已有生成原画，以相同键覆盖手机版路径。
- 内部 UI 请求 `wire:menu {}` 打开手札；`wire:gear {}` 进入 G 装备页；`wire:open {id:'gear'|'rift'|'achieve'|'daily'|'settings'}` 打开可用模块；`wire:auto {}` 打开既有自动策略。无新存档字段。
- main 在 mount/idle.start 前 install gear/rift/achieve/daily/audio2，gear:equip/unequip 委托 G。掉落使用 G.roll，stats 使用 G.statBonus，不重复累计 bones 基础值。
- 舞台 `SR.stageFx.create().image(key,x,y,size)` 播放 SR.ASSETS 横向帧图集，按 frames/fps 一次播放并移除；角色按 fw/fh 显示、按 fps 播放，只有 idle 循环，首领 phase 使用对应姿态。

## 第三轮离线重试补充（2026-10-26）
- `SR.idle.retry()` 返回当前结算 Promise；无结算时从保留游标重新结算，未启动时委托 start。用于 offline:status 异常后的显式重试。
- `SR.save.save(true)` 保存当前时间游标，不覆盖为 Date.now；默认无参行为不变。异步离线异常落盘使用此选项，避免丢失未处理区间。

## MAP 山河行卷（追加）
- content.install 后调用 `SR.buildWorldMap()`：派生 `DATA.worldRegions` 六区×八节点，不覆盖原十五层战斗数据。须在 progress/UI 使用前调用。
- `SR.progress.migrate(state)` 补齐 `world:{v:1,cleared:0..48,selected:'node-N',wave:1..10,rewards:{}}`，保持外层 v2。cleared 是连续已通节点数；下标等于 cleared 为前沿。旧 bestFloor 表示已解锁层，因此只承认其之前的层已通，避免误授首领通关；历史已解锁区不补发奖励。
- `progress.node(id)`、`frontier(state?)`、`select(id,state?)`、`advance(state?)`、`encounter(state?)`、`clearWave(state?,autoConfig?)` 为无 DOM 接口。select 仅允许已通或前沿；encounter 返回 `{node,map,table,wave,boss,eggPool}`，怪物 kind、数值、年限及掉落池来自原表。clearWave **必须替换**旧战斗推进而非在 wave_clear 后再调用；返回 `{cleared,first,nodeId,reward,selected}` 或 `{blocked:true}`。区域每八节点后奖励一次，最后区域视为终局奖励。
- 普通节点五波；每区末节点十波且最后一波首领。advance=false 原地重刷；challengeBoss=false 在首领前循环，显式首领结算亦拒绝。秘境不调用此接口。
- UI：加载 ui/worldmap.css 与 ui/worldmap.js，`SR.worldmap.mount(el)` / `render()` / `open(nodeId)` / `unmount()`。卸载清理弹层。`world:select_request {nodeId}` 请求安全切换；`world:changed {}` 在成功选择或结算后通知刷新。UI 不直接重启战斗或落盘。
- `progress.install()` 幂等监听 save:loaded；由集成路在 idle.start 前安装。存档主模块保留未知 world 字段。离线真实 battle 模拟使用相同 encounter/clearWave，禁止监听 battle:wave_clear 二次推进。
