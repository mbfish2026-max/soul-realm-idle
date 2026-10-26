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
