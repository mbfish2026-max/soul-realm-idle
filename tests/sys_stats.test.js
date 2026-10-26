const assert=require('assert');
const fs=require('fs'),vm=require('vm');
global.SR={rng:()=>0,bus:{on(){},emit(){}},save:{markDirty(){},state:{hero:{soulId:'blade',level:20,talent:7,rings:[],exp:20},flags:{awakened:true},bag:[],store:[],bagCap:60,pets:[],team:{pets:[]},cur:{petSoul:9999}}}};
['names.js','data/souls.js','data/skills.js','data/pets.js','data/realms.js','systems/awaken.js','systems/rings.js','systems/pets.js','systems/stats.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(require('path').join(__dirname,'..',f),'utf8')));
const s=SR.save.state;
s.bag.push({uid:'e',type:'egg',speciesId:'fox'});let p=SR.pets.hatch('e');let a=SR.stats.hero(s);SR.pets.deploy(p.uid);p.bond=100;s.hero.rings=[{years:1000,vein:'wind'}];let b=SR.stats.hero(s);assert(b.atk>a.atk);assert.equal(b.bondBonus,.05);assert(Math.abs(b.ringMult[0]-(1+SR.rings.benefit(1000)*.1)*1.2)<1e-8);let x=SR.stats.pet(p).power;p.seg=10;assert(SR.stats.pet(p).power>x);assert(b.teamPower>b.power);assert(SR.rings.benefit(100000)<SR.rings.benefit(10000)*2);
console.log('sys_stats passed');
