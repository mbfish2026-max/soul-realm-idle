const assert=require('assert');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require('../'+f));SR.content.install();
['data/skill-tree','data/ring-skills','data/effects','core/rng','core/save','core/bag','core/loot','systems/rings','systems/pets','systems/stats','systems/skills','systems/ring-skills'].forEach(f=>require('../'+f));
const S=SR,s=S.save.state,h=s.hero;h.level=40;h.soulId='blade';h.classId='blade';s.flags.awakened=true;s.cur.crystal=10000;s.cur.skillDust=100;S.rng=()=>0;
const sources=Object.keys(S.DATA.ringSkillPools);assert(sources.length>=9);
for(const m of S.DATA.maps)for(const t of [m].concat(m.floorTables||[]))for(const e of (t.monsters||[]).concat(t.boss?[t.boss]:[]))assert(S.DATA.ringSkillPools[e.kind]);
function drop(kind){let e=S.loot.essence(100,false,{kind});s.bag.push(e);return e;}
const e=drop(sources[0]),e2=drop(sources[1]);assert.notEqual(e.skillId,e2.skillId);assert(S.rings.absorb(e.uid).ok);assert.equal(h.rings[0].sourceKind,sources[0]);assert.equal(S.skills.entries({side:'hero'})[0].id,h.rings[0].skillId);assert.equal(S.skills.init().levels[h.rings[0].skillId],1);
const previous=h.rings[0].skillId;assert.equal(S.rings.absorb(e2.uid,0).reason,'confirm');assert.equal(h.rings[0].skillId,previous);assert(S.rings.absorb(e2.uid,0,true).ok);assert.notEqual(h.rings[0].skillId,previous);assert(!S.skills.init().levels[previous]);assert.equal(h.rings.length,1);
const skill=S.DATA.skills[h.rings[0].skillId];h.classId=skill.classId;h.soulId=S.DATA.souls.find(x=>x.vein===skill.vein)?.id||'blade';let good=S.ringSkill.fit(h.rings[0],h,0);h.classId=S.DATA.classes.find(x=>x.id!==skill.classId).id;assert(good>S.ringSkill.fit(h.rings[0],h,0));h.classId=skill.classId;
assert(S.skills.learn(skill.id));assert.equal(S.skills.init().levels[skill.id],2);assert(S.skills.reset());assert.equal(S.skills.init().levels[skill.id],1);assert(S.skills.branch(0,1));assert.notEqual(h.rings[0].skillId,skill.id);
h.autoRing={enabled:true,minYears:100,minFit:0.1};const auto=drop(sources[0]);assert(S.rings.shouldAuto(auto));auto.years=99;assert(!S.rings.shouldAuto(auto));auto.years=100;h.autoRing.minFit=2;assert(!S.rings.shouldAuto(auto));
S.save.save();S.save.load();assert.equal(S.save.state.hero.rings[0].sourceKind,sources[1]);assert.equal(S.skills.entries({side:'hero'})[0].id,S.save.state.hero.rings[0].skillId);
S.save.state=S.save.migrate({v:1,hero:{level:10,soulId:'blade',rings:[{skillId:'slash',years:50,vein:'wind',color:'white'}]}});S.skills.init();assert.equal(S.save.state.hero.rings[0].skillId,'slash');console.log('skill_rings: sources, absorption, replacement, fit, reset, branch, auto thresholds and migration passed');

S.save.state=S.save.create();S.save.state.flags.awakened=true;S.save.state.hero.level=10;S.save.state.hero.soulId='blade';S.save.state.bag.push({uid:'legacy',type:'essence',years:20,vein:'wind',skillId:'cut'});assert(S.rings.absorb('legacy').ok);assert.equal(S.skills.entries({side:'hero'})[0].id,'cut');
