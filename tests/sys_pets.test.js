const assert=require('assert');
const fs=require('fs'),vm=require('vm');
global.SR={rng:()=>0,bus:{on(){},emit(){}},save:{markDirty(){},state:{hero:{soulId:'blade',level:20,talent:7,rings:[],exp:20},flags:{awakened:true},bag:[],store:[],bagCap:60,pets:[],team:{pets:[]},cur:{petSoul:9999}}}};
['names.js','data/souls.js','data/skills.js','data/pets.js','data/realms.js','systems/awaken.js','systems/rings.js','systems/pets.js','systems/stats.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(require('path').join(__dirname,'..',f),'utf8')));
const s=SR.save.state;
s.bag.push({uid:'egg',type:'egg',speciesId:'fox'});let p=SR.pets.hatch('egg');assert(p);assert.equal(s.bag.length,0);assert(SR.pets.deploy(p.uid));p.seg=9;p.step=9;assert(SR.pets.feed(p.uid));assert.equal(p.seg,10);assert.equal(p.step,1);assert(!SR.pets.feed(p.uid));assert(!SR.pets.evolve(p.uid,'jadefox'));p.counters.kills=30;assert(SR.pets.preview(p.uid)[0].ready);assert(SR.pets.evolve(p.uid,'jadefox'));assert.equal(p.seg,1);assert.equal(p.grade,1);assert(!SR.pets.ringify(p.uid));p.seg=10;assert(SR.pets.ringify(p.uid));assert.equal(s.pets.length,0);assert.equal(s.team.pets.length,0);assert(s.petAlbum[0].afterimage);assert.equal(s.bag[0].years,20000);
console.log('sys_pets passed');

s.bag.push({uid:'locked-egg',type:'egg',speciesId:'fox',locked:true});assert.equal(SR.pets.hatch('locked-egg'),false);assert(s.bag.some(x=>x.uid==='locked-egg'));
