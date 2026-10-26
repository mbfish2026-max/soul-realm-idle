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
/* F 路：秘境、成就与日常，仅追加。 */
(function(g){var N=g.SR.NAMES;N.rift='渊层秘境';N.achieve='成就';N.daily='日常';N.pactCharm='契符';N.goldLines='金纹';N.riftLord='渊纹守';
N.featMetrics={kills:'击败渊兽',bosses:'击败渊主',waves:'清剿波次',skills:'施展轮技',fusions:'触发共鸣技',rings:'成功吸收魂环',drops:'拾取掉落',rift:'通关秘境',damage:'累计伤害',offline:'离线修行秒数'};
N.featRanks=['初识','渐入','精进'];
})(typeof window!=='undefined'?window:globalThis);
