/* Continuous seeded collection simulation. No fixtures and no source/report writes.
 * node tools/sim/skills.js --hours=120 --class=blade --investment=high --mode=online
 * Omit filters to cover 6 classes x 3 decision frequencies x online/offline.
 * --hours=1 is a smoke run, not a balance acceptance run.
 */
const path=require('path'),root=path.resolve(__dirname,'../..');
['names','core/bus','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require(path.join(root,f)));SR.content.install();
['data/skill-tree','data/ring-skills','data/effects','data/skill-progression','core/rng','core/save','core/bag','core/loot','core/auto','features/gear/data','features/gear/gear','systems/rings','systems/pets','systems/stats','systems/skills','systems/ring-skills','core/battle','core/offline'].forEach(f=>require(path.join(root,f)));SR.loot.init();
['features/rift/shared','features/rift/rift'].forEach(f=>require(path.join(root,f)));
const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));
const hours=Number(args.hours||120);if(!Number.isFinite(hours)||hours<=0)throw Error('invalid hours');
// Persistence is outside the balance model; suppress autosaves, not game events.
SR.save.save=()=>true;
function advance(){let h=SR.save.state.hero,changed=false;while(h.level<99&&h.exp>=SR.progression.expToNext(h.level)){h.exp-=SR.progression.expToNext(h.level++);changed=true;}if(changed)SR.bus.emit('hero:changed',{});}
let cultivation={enhances:0,evolutions:0,riftAttempts:0,riftClears:0};
function manage(){const s=SR.save.state,h=s.hero;
 for(const e of s.bag.concat(s.store).slice()){
  if(e.locked)continue;
  if(e.type==='gear'){
   let old=h.bones[e.slot];if(!old||SR.gear.power(SR.gear.itemBonus(e))>SR.gear.power(SR.gear.itemBonus(old)))SR.gear.equip(e.uid);
   if(SR.gear.find(e.uid)?.where)SR.gear.dismantle([e.uid]);
  }else if(e.type==='essence'){
   if(h.rings.length<SR.rings.slots(h)&&SR.ringSkill.allowed(e,h.rings.length))SR.rings.absorb(e.uid);
   else SR.bag.dismantle(e.uid,s.store.includes(e)?'store':'bag');
  }else if(e.type==='egg'){
   if(s.pets.length<SR.pets.slots(h)){if(s.store.includes(e))SR.bag.move(e.uid,'store','bag');let p=SR.pets.hatch(e.uid);if(p)SR.pets.deploy(p.uid);}
   else SR.bag.dismantle(e.uid,s.store.includes(e)?'store':'bag');
  }
 }
 for(const p of s.pets){if(!s.team.pets.includes(p.uid))SR.pets.deploy(p.uid);let budget=100;while(budget--&&SR.pets.feed(p.uid)){} }
 if(args.cultivation==='full'){
  for(const gear of Object.values(h.bones)){let budget=10;while(budget--&&SR.gear.enhance(gear.uid))cultivation.enhances++;}
  for(const p of s.pets){const next=SR.pets.preview(p.uid).find(e=>e.ready);if(next&&SR.pets.evolve(p.uid,next.to))cultivation.evolutions++;}
  const r=SR.rift.challenge();cultivation.riftAttempts++;if(r&&r.ok)cultivation.riftClears++;
 }
 for(const e of SR.skills.entries({side:'hero'})){let budget=5;while(budget--&&SR.skills.learn(e.id)){} }
 SR.auto.config().pending=[];
}
// main.js advances after each kill (synchronously during offline simulation).
SR.bus.on('battle:kill',advance);
let result=[];
for(const c of SR.DATA.classes.filter(c=>!args.class||c.id===args.class))for(const investment of ['low','medium','high'].filter(x=>!args.investment||x===args.investment))for(const mode of ['online','offline'].filter(x=>!args.mode||x===args.mode)){
 cultivation={enhances:0,evolutions:0,riftAttempts:0,riftClears:0};
 SR.battle.stop();SR.rng.seed(Number(args.seed||4200));const s=SR.save.state=SR.save.create();s.flags.awakened=true;s.hero.soulId=c.recommend;SR.skills.chooseClass(c.id);SR.auto.config().absorb=false;
 let elapsed=0,clears=0,attempts=0,failures=0,checkpoints=[],paused=0;let off=SR.bus.on('ring:absorb_result',r=>{attempts++;if(!r.ok)failures++;});let off2=SR.bus.on('battle:wave_clear',()=>clears++);
 const interval={low:3600,medium:600,high:60}[investment];
 SR.battle.start();
 while(elapsed<hours*3600){let seconds=Math.min(mode==='offline'?interval:60,hours*3600-elapsed);if(mode==='offline')SR.offline.claim(s.t+seconds*1000);else SR.battle.tick(seconds*1000);elapsed+=seconds;advance();if(SR.bag.full())paused+=seconds;if(elapsed%interval===0){manage();SR.battle.start();}if(!checkpoints.length||checkpoints.at(-1).level!==s.hero.level)checkpoints.push({level:s.hero.level,hours:+(elapsed/3600).toFixed(3),map:s.map.mapId,rings:s.hero.rings.length});if(s.hero.level===99&&s.flags.mapsCleared?.ridge)break;}
 off();off2();SR.battle.stop();let row={seed:Number(args.seed||4200),classId:c.id,investment,mode,cultivation:args.cultivation||'basic',cultivationActions:Object.assign({},cultivation),hours:+(elapsed/3600).toFixed(3),complete:s.hero.level===99&&!!s.flags.mapsCleared?.ridge,level:s.hero.level,map:s.map,attempts,failures,clears,pausedHours:paused/3600,resources:s.cur,gear:Object.keys(s.hero.bones).length,rings:s.hero.rings.length,pets:s.pets.map(p=>({speciesId:p.speciesId,seg:p.seg,bond:p.bond})),checkpoints};result.push(row);console.log(JSON.stringify(row));
}
if(!result.length)throw Error('no scenarios selected');
console.error(JSON.stringify({scenarios:result.length,complete:result.filter(r=>r.complete).length,inTarget:result.filter(r=>r.complete&&r.hours>=60&&r.hours<=80).length,definition:'level 99 and ridge final boss; elapsed wall hours; offline uses real claim at decision interval (60/600/3600s), 70% combat time; natural drops and resource costs; level 40+ combat practice settled on kills; rested experience bonus from game progression config'}));

if(args['assert-target']==='true'&&result.some(r=>!r.complete||r.hours<60||r.hours>80))process.exitCode=1;
