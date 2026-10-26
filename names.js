/* 玩家可见专有名词集中配置。UI/文本只引用 SR.NAMES.key，禁止写死。日后换名只改这里。 */
(function (g) {
  var SR = g.SR = g.SR || {};
  SR.NAMES = {
    game: '魂域挂机', world: '裂渊大陆',
    martialSoul: '武魂', soulRing: '魂环', ringEssence: '魂环精魄', ringSkill: '轮技',
    talent: '天资', soulBone: '灵骨', beast: '渊兽', beastLord: '渊主',
    pet: '契兽', petMaster: '契魂师', pact: '心契', evolve: '蜕变', ringify: '化轮',
    resonance: '共鸣技', egg: '兽卵', crystal: '灵晶', petSoul: '兽魂',
    ringColors: { white: '十年', yellow: '百年', purple: '千年', black: '万年', red: '十万年' },
    realms: ['凡士', '灵士', '灵师', '灵尊', '灵宗', '灵王', '灵帝', '灵圣', '灵极', '天称'],
    petGrades: ['奴仆级', '战将级', '统领级', '君主级', '帝皇级', '主宰级', '不朽级', '不死级', '神级'],
    maps: { start: '七棘院后山', forest: '万渊林' }
  };
  if (typeof module !== 'undefined') module.exports = SR.NAMES;
})(typeof window !== 'undefined' ? window : globalThis);

/* A 路新增：万渊林怪物与首领预警。 */
(function(g){var n=g.SR.NAMES;n.coreMobs={reed:'苇影獾',moss:'苔甲貘',lord:'苍苔渊守'};n.coreWarnings={surge:'苔潮震荡',rage:'裂根怒涌'};})(typeof window!=='undefined'?window:globalThis);
/* B 系统新增命名，仅追加。 */
(function(g){var N=g.SR.NAMES;
N.souls={blade:'青锋剑',tiger:'赤瞳虎',body:'金刚体'};
N.veins={wind:'风脉',fire:'焰脉',earth:'岩脉',moon:'月脉'};
N.soulKinds={tool:'器',beast:'兽',body:'本体'};
N.skills={cut:'竹影斩',flame:'赤焰破',guard:'山灵护',fox:'灵狐之息',moon:'月华照',storm:'回风引',stone:'磐石御',wing:'流羽袭'};
N.species={fox:'灵狐',jadefox:'碧尾灵狐',moonfox:'映月灵狐',tiger:'烬纹虎',crane:'听风鹤',turtle:'青岩龟',deer:'苔角鹿',hawk:'逐岚鹰'};
N.bond='契心值';N.twin='双相';N.afterimage='残影';N.heroName='清微子';N.resonate='轮脉共振';
})(typeof window!=='undefined'?window:globalThis);
(function(g){g.SR.NAMES.behaviors={kills:'击败次数',battles:'清剿波次'};})(typeof window!=='undefined'?window:globalThis);
;(function(){SR.NAMES.gearSlots={crown:'头冠',robe:'衣袍',belt:'腰带',boots:'靴履',bracer:'护腕',skirt:'下裳',necklace:'项链',ring:'戒指',weapon:'法器',jade:'玉佩'};})();

/* E 内容扩展：仅追加命名。 */
(function(g){var N=g.SR.NAMES;
N.souls=N.souls||{};Object.assign(N.souls,{"hammer":"玄铁锤","vine":"缠灵藤","eagle":"霜翼鹰"});
N.veins=N.veins||{};Object.assign(N.veins,{"ice":"霜脉","wood":"木脉"});
N.sources=N.sources||{};Object.assign(N.sources,{"beast":"兽源","wing":"羽源","spirit":"灵源"});
N.speciesKinds=N.speciesKinds||{};Object.assign(N.speciesKinds,{"fox":"绒尾种","tiger":"纹爪种","bird":"翎羽种","shell":"甲岩种","deer":"枝角种","seed":"芽灵种"});
N.extRoles=N.extRoles||{};Object.assign(N.extRoles,{"strike":"攻伐","break":"破甲","control":"牵制","burst":"猛攻","speed":"疾行","guard":"坚守"});
N.extMaps=N.extMaps||{};Object.assign(N.extMaps,{"snow":"寒川雪岭","ridge":"熔脊"});
N.extMobs=N.extMobs||{};Object.assign(N.extMobs,{"snowmink":"雪绒貂","iceyak":"冰背牦","snowlord":"寂川角守","slagbeetle":"熔砾虫","ashram":"灰脊羚","ridgelord":"赤垒炉守"});
N.extSkills=N.extSkills||{};Object.assign(N.extSkills,{"crush":"沉岳击","bind":"绕枝缚","frost":"霜翎落","icewave":"寒汐卷","ember":"炉心涌","snowburst":"碎川震","ashfall":"焚砾雨","leaf":"新芽拂","echo":"静轮鸣"});
N.extBranches=N.extBranches||{};Object.assign(N.extBranches,{"blade0":"逐锋","blade1":"藏锋","blade2":"回锋","hammer0":"裂甲","hammer1":"震岳","hammer2":"铸壁","vine0":"缚根","vine1":"繁枝","vine2":"返青","tiger0":"赤眸","tiger1":"踏焰","tiger2":"狩心","eagle0":"掠雪","eagle1":"折风","eagle2":"凝羽","body0":"坚骨","body1":"回震","body2":"养元"});
N.extSpecies=N.extSpecies||{};Object.assign(N.extSpecies,{"galefox":"风岫绒狐","nightfox":"夜澄绒狐","cinderpaw":"炭爪狞","sunpaw":"曜爪狞","snowcrane":"雪缄鹤","cloudcrane":"云缄鹤","basaltshell":"玄垒龟","jadeshell":"玉垒龟","bloomdeer":"花灯鹿","moonantler":"月灯鹿","icehawk":"冰弦隼","stormhawk":"雷岚隼","bud":"露芽灵","thorn":"棘芽灵","crownseed":"冠枝灵","emberseed":"烛芽灵","prismfox":"棱光绒狐","aurorafox":"极照绒狐","skyfox":"穹游绒狐","everfox":"长明绒狐","dawnfox":"曙宸绒狐","magmahorn":"熔冠羚"});
N.extResonances=N.extResonances||{};Object.assign(N.extResonances,{"res0":"岚焰合璧","res1":"霜锋回旋","res2":"青枝承岳","res3":"赤眸逐风","res4":"寒翎映月","res5":"金骨镇川","res6":"绒影双照","res7":"雪鹤回岚","res8":"岩甲生花","res9":"双隼凌空","res10":"芽火相生","res11":"长夜启曙"});
N.extAffixes=N.extAffixes||{};Object.assign(N.extAffixes,{"keen":"锋锐","shell":"坚甲","vigor":"生机","haste":"轻身","focus":"凝神"});
N.extTrials=N.extTrials||{};Object.assign(N.extTrials,{"trial0":"镇关灵卫·初石","trial1":"镇关灵卫·听溪","trial2":"镇关灵卫·照林","trial3":"镇关灵卫·承岚","trial4":"镇关灵卫·凌川","trial5":"镇关灵卫·踏焰","trial6":"镇关灵卫·定岳","trial7":"镇关灵卫·映穹","trial8":"镇关灵卫·归一"});
})(typeof window!=='undefined'?window:globalThis);

(function(g){var N=g.SR.NAMES;N.classes={"blade": "逐锋", "forge": "铸星", "bind": "织岚", "mend": "映泉", "guard": "镇岳", "tame": "唤灵"};N.classRoles={"blade": "攻伐", "forge": "破甲", "bind": "牵制", "mend": "治疗", "guard": "护盾", "tame": "驭兽"};N.skillNames={"blade_1_0": "穿林式", "blade_1_1": "穿林诀", "blade_2_0": "回岚式", "blade_2_1": "回岚诀", "blade_3_0": "断流式", "blade_3_1": "断流诀", "blade_4_0": "照穹式", "blade_4_1": "照穹诀", "blade_5_0": "穿林式·5", "blade_5_1": "穿林诀·5", "blade_6_0": "回岚式·6", "blade_6_1": "回岚诀·6", "blade_7_0": "断流式·7", "blade_7_1": "断流诀·7", "blade_8_0": "照穹式·8", "blade_8_1": "照穹诀·8", "blade_9_0": "穿林式·9", "blade_9_1": "穿林诀·9", "forge_1_0": "落锤式", "forge_1_1": "落锤诀", "forge_2_0": "熔纹式", "forge_2_1": "熔纹诀", "forge_3_0": "震炉式", "forge_3_1": "震炉诀", "forge_4_0": "星铸式", "forge_4_1": "星铸诀", "forge_5_0": "落锤式·5", "forge_5_1": "落锤诀·5", "forge_6_0": "熔纹式·6", "forge_6_1": "熔纹诀·6", "forge_7_0": "震炉式·7", "forge_7_1": "震炉诀·7", "forge_8_0": "星铸式·8", "forge_8_1": "星铸诀·8", "forge_9_0": "落锤式·9", "forge_9_1": "落锤诀·9", "bind_1_0": "缠枝式", "bind_1_1": "缠枝诀", "bind_2_0": "锁风式", "bind_2_1": "锁风诀", "bind_3_0": "寂林式", "bind_3_1": "寂林诀", "bind_4_0": "天罗式", "bind_4_1": "天罗诀", "bind_5_0": "缠枝式·5", "bind_5_1": "缠枝诀·5", "bind_6_0": "锁风式·6", "bind_6_1": "锁风诀·6", "bind_7_0": "寂林式·7", "bind_7_1": "寂林诀·7", "bind_8_0": "天罗式·8", "bind_8_1": "天罗诀·8", "bind_9_0": "缠枝式·9", "bind_9_1": "缠枝诀·9", "mend_1_0": "润叶式", "mend_1_1": "润叶诀", "mend_2_0": "清汐式", "mend_2_1": "清汐诀", "mend_3_0": "回澜式", "mend_3_1": "回澜诀", "mend_4_0": "月泉式", "mend_4_1": "月泉诀", "mend_5_0": "润叶式·5", "mend_5_1": "润叶诀·5", "mend_6_0": "清汐式·6", "mend_6_1": "清汐诀·6", "mend_7_0": "回澜式·7", "mend_7_1": "回澜诀·7", "mend_8_0": "月泉式·8", "mend_8_1": "月泉诀·8", "mend_9_0": "润叶式·9", "mend_9_1": "润叶诀·9", "guard_1_0": "立垒式", "guard_1_1": "立垒诀", "guard_2_0": "回震式", "guard_2_1": "回震诀", "guard_3_0": "定川式", "guard_3_1": "定川诀", "guard_4_0": "山誓式", "guard_4_1": "山誓诀", "guard_5_0": "立垒式·5", "guard_5_1": "立垒诀·5", "guard_6_0": "回震式·6", "guard_6_1": "回震诀·6", "guard_7_0": "定川式·7", "guard_7_1": "定川诀·7", "guard_8_0": "山誓式·8", "guard_8_1": "山誓诀·8", "guard_9_0": "立垒式·9", "guard_9_1": "立垒诀·9", "tame_1_0": "引羽式", "tame_1_1": "引羽诀", "tame_2_0": "同狩式", "tame_2_1": "同狩诀", "tame_3_0": "群鸣式", "tame_3_1": "群鸣诀", "tame_4_0": "万灵式", "tame_4_1": "万灵诀", "tame_5_0": "引羽式·5", "tame_5_1": "引羽诀·5", "tame_6_0": "同狩式·6", "tame_6_1": "同狩诀·6", "tame_7_0": "群鸣式·7", "tame_7_1": "群鸣诀·7", "tame_8_0": "万灵式·8", "tame_8_1": "万灵诀·8", "tame_9_0": "引羽式·9", "tame_9_1": "引羽诀·9"};N.skillTypes={active:'主动',passive:'被动',ultimate:'终极',talent:'种族天赋',bond:'羁绊',evolved:'蜕变技'};N.petRoles={damage:'攻伐',control:'牵制',heal:'治疗',shield:'护盾',buff:'增益'};N.skillBook='魂技谱';N.soulPower='魂力';N.skillDust='悟尘';N.fusionSkill='合契技';N.petSkillSuffix={talent:'灵性',active:'灵袭',bond:'心应',evolved:'新生'};N.fusionSuffix='同辉';})(typeof window!=='undefined'?window:globalThis);

(function(g){g.SR.NAMES.effectTypes={damage:'伤害',dot:'持续伤害',control:'控制',shield:'护盾',heal:'治疗',buff:'增益',debuff:'削弱',summon:'召唤',aoe:'群攻',combo:'连携'};})(typeof window!=='undefined'?window:globalThis);

(function(g){g.SR.NAMES.statNames={atk:'攻击',def:'防御',hp:'生命',spd:'速度'};})(typeof window!=='undefined'?window:globalThis);

(function(g){var N=g.SR.NAMES;N.ringOrigin='渊兽来处';N.ringReplace='更换魂环';N.ringLost='旧魂技将丢失，确认更换';N.ringFit='适配威力';N.ringAtlas='渊兽图鉴';N.ringBranch='分支强化';N.autoRing='自动吸收';N.unknownOrigin='游离精魄';})(typeof window!=='undefined'?window:globalThis);

(function(g){var N=g.SR.NAMES;Object.keys(N.extSpecies||{}).forEach(function(id){if(!N.species[id])N.species[id]=N.extSpecies[id];});})(typeof window!=='undefined'?window:globalThis);

(function(g){var N=g.SR.NAMES;N.autoSettings='自动策略';})(typeof window!=='undefined'?window:globalThis);

(function(g){g.SR.NAMES.autoQualities=['普通','优良','稀有','史诗','传说'];})(typeof window!=='undefined'?window:globalThis);
/* F 路：秘境、成就与日常，仅追加。 */
(function(g){var N=g.SR.NAMES;N.rift='渊层秘境';N.achieve='成就';N.daily='日常';N.pactCharm='契符';N.goldLines='金纹';N.riftLord='渊纹守';
N.featMetrics={kills:'击败渊兽',bosses:'击败渊主',waves:'清剿波次',skills:'施展轮技',fusions:'触发共鸣技',rings:'成功吸收魂环',drops:'拾取掉落',rift:'通关秘境',damage:'累计伤害',offline:'离线修行秒数'};
N.featRanks=['初识','渐入','精进'];
})(typeof window!=='undefined'?window:globalThis);
/* G 灵骨与仓库命名，仅追加。 */
(function(g){var N=g.SR.NAMES;N.gear={slots:{head:'头部',body:'躯干',larm:'左臂',rarm:'右臂',lleg:'左腿',rleg:'右腿',external:'外附灵骨'},qualities:['白品','黄品','紫品','黑品','红品'],sets:{bamboo:'青篁',ember:'烬霞',tide:'听潮',cliff:'叠嶂'},stats:{atk:'攻击',def:'防御',hp:'气血',spd:'速度'},affixes:{fierce:'锐意',steady:'坚守',vital:'生息',swift:'轻身',force:'破阵',guard:'凝壁',bloom:'长青',wind:'逐风'}};})(typeof window!=='undefined'?window:globalThis);

/* G 装备 v2：十部位，八件套装，法器与玉佩为散件。 */
(function(g){var N=g.SR.NAMES;N.gearSlotsV2={crown:'头冠',robe:'衣袍',belt:'腰带',boots:'靴履',bracer:'护腕',skirt:'下裳',necklace:'项链',ring:'戒指',weapon:'法器',jade:'玉佩'};N.gearLinksV2='八件齐备：武魂属性增幅5%，每枚魂环增幅0.5%，每只出战契兽增幅1%（最多三只），均作用于八件档属性。';})(typeof window!=='undefined'?window:globalThis);

(function(g){g.SR.NAMES.wireMenu='修行手札';g.SR.NAMES.wireMenuShort='手札';})(typeof window!=='undefined'?window:globalThis);
/* BAG 网格背包，仅追加。 */
(function(g){g.SR.NAMES.bagGrid={title:'背包',store:'仓库',gear:'装备',mat:'材料',all:'全部',empty:'空格',locked:'锁定',selected:'已选',full:'背包已满 · 新掉落转入仓库',storeFull:'仓库接近上限 · 战斗将暂停',sort:'排序',quality:'品质',level:'等级／年限',type:'类型',newest:'新获得',tidy:'一键整理',multi:'多选',done:'完成',select:'全选可用',sell:'出售',dismantle:'分解',confirm:'确认',cancel:'取消',unlock:'解锁',detail:'物品详情',absorb:'吸收',hatch:'孵化',equip:'穿戴',advanced:'装备详情',put:'存入仓库',take:'取回背包',used:'已用',hint:'点按查看 · 长按多选',none:'当前筛选没有物品',year:'年',lv:'级',result:'处理完成',cannot:'条件不足，请检查等级、锁定或容量',pending:'待吸收',overflow:'满包掉落转仓库；自动出售遵循自动策略。'};})(typeof window!=='undefined'?window:globalThis);

/* MAP 世界地图：只追加。 */
(function(g){var N=g.SR.NAMES;N.worldMap={title:'山河行卷',regions:['苇风汀','碧篁渡','霜汀泽','雪岫关','烬砂麓','叠焰巅'],nodes:['初径','听泉','石阶','幽涧','岚台','古渡','险隘','镇关'],normal:'行径',elite:'险隘',boss:'渊主',cleared:'已通关',locked:'未解锁',current:'当前位置',power:'推荐战力',waves:'波',drops:'掉落预览',ring:'魂环',gear:'装备',egg:'兽卵',mat:'材料',reward:'区域解锁奖励',frontier:'推进到最前沿',farm:'在此挂机',close:'收起',progress:'区域进度',years:'年',crystal:'灵晶',petSoul:'兽魂',complete:'行卷已通',colors:['白','黄','紫','黑','红']};})(typeof window!=='undefined'?window:globalThis);
