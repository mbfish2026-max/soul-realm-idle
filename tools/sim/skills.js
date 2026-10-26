/* Node, no dependencies. Measures authoritative 50ms combat at ten progression checkpoints. */
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../..');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require(path.join(root,f)));SR.content.install();
['data/skill-tree','data/ring-skills','data/effects','data/skill-progression','core/rng','core/save','core/bag','core/loot','systems/rings','systems/pets','systems/stats','systems/skills','systems/ring-skills','core/battle'].forEach(f=>require(path.join(root,f)));SR.loot.init();
let results=[];
for(const c of SR.DATA.classes)for(let option=0;option<2;option++)for(const role of Object.keys(SR.NAMES.petRoles)){
 let curve=[];
 for(const level of [1,10,20,30,40,50,60,70,80,90,99]){
  SR.battle.stop();SR.rng.seed(4200+level);const s=SR.save.state=SR.save.create();s.flags.awakened=true;s.hero.soulId=c.recommend;s.hero.classId=c.id;s.hero.level=level;s.map.floor=Math.min(5,1+Math.floor(level/10));s.map.wave=1;const n=Math.min(9,Math.floor(level/10));s.hero.rings=Array.from({length:n},(_,i)=>({years:Math.pow(10,Math.min(5,1+Math.floor(i/2))),color:'yellow',vein:c.vein}));
  const pool=Object.values(SR.DATA.ringSkillPools).find(p=>SR.DATA.skills[p.slots[1][0]].classId===c.id);s.hero.rings.forEach((r,i)=>{r.sourceKind=pool.kind;r.skillBranch=option;r.skillId=pool.slots[i+1][option];});let b=SR.skills.init();for(let i=1;i<=n;i++){let id=pool.slots[i][option];b.levels[id]=Math.min(5,1+Math.floor(level/20));b.slots[i]=id;b.priority.push(id);}
  let species=SR.DATA.pets.find(p=>p.skillRole===role);s.pets=[{uid:'p',speciesId:species.id,grade:species.grade,seg:Math.min(10,1+Math.floor(level/10)),step:1,bond:100,counters:{},skills:species.skills.slice()}];s.team.pets=['p'];SR.battle.start();const before=s.hero.exp;for(let t=0;t<60000;t+=50)SR.battle.tick(50);curve.push({level,xpPerHour:Math.max(1,s.hero.exp-before)*60,kills:s.stats.kills||0});
 }
 let elapsed=0,checkpoints=[];
 for(let level=1;level<99;level++){const sample=curve.slice().reverse().find(x=>x.level<=level);elapsed+=SR.progression.expToNext(level)/sample.xpPerHour;if(level%10===9||level===98)checkpoints.push({level:level+1,hours:+elapsed.toFixed(2)});}
 results.push({classId:c.id,option,role,hours:+elapsed.toFixed(2),curve:checkpoints,samples:curve});
}
SR.battle.stop();fs.writeFileSync(path.join(root,'docs/balance-skills.json'),JSON.stringify(results,null,2));
let out='# 技能体系数值模拟\n\n运行 `node tools/sim/skills.js`。使用真实 battle.tick(50)、AI、掉落与技能效果测量；固定种子，每个组合在 11 个等级节点各战斗 60 秒，分段积分到 99 级。共 6 职业 × 2 主力分支 × 5 契兽定位 = 60 组。\n\n假设：节点自动配置对应等级的魂环、技能等级与契兽段位，不计玩家决策时间、死亡外的操作时间与离线折算。结果是模型估计，不是连续 80 小时实机验收。\n\n|职业|最短小时|最长小时|60–80 小时达标组数|\n|---|---:|---:|---:|\n';
for(const c of SR.DATA.classes){const rows=results.filter(r=>r.classId===c.id);out+='|'+SR.NAMES.classes[c.id]+'|'+Math.min(...rows.map(r=>r.hours))+'|'+Math.max(...rows.map(r=>r.hours))+'|'+rows.filter(r=>r.hours>=60&&r.hours<=80).length+'/10|\n';}
out+='\n完整组合与阶段曲线见 [balance-skills.json](balance-skills.json)。通关定义为 99 级；地图末层仍可循环挂机。1–39 级保持原有节奏，40 级后采用 data/skill-progression.js 的修行经验曲线。弱势职业通过属性成长补偿，未削减既有技能。\n';fs.writeFileSync(path.join(root,'docs/balance.md'),out);console.log(out);
